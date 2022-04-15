terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }

  backend "gcs" {
    bucket = "fabra-344902-tfstate"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = "fabra-344902"
}

resource "google_container_registry" "registry" {
  location = "US"
}

resource "google_compute_network" "vpc" {
  name                    = "fabra-vpc"
  routing_mode            = "GLOBAL"
  auto_create_subnetworks = true
}

# Setup IP block for VPC
resource "google_compute_global_address" "private_ip_block" {
  name         = "private-ip-block"
  purpose      = "VPC_PEERING"
  address_type = "INTERNAL"
  ip_version   = "IPV4"
  prefix_length = 20
  network       = google_compute_network.vpc.self_link
}

# Connection that allows services in our private VPC to access underlying Google Cloud Services VPC
resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.self_link
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_block.name]
}

resource "google_sql_database" "main_database" {
  name     = "fabra-db"
  instance = google_sql_database_instance.main_instance.name
}

resource "google_sql_database_instance" "main_instance" {
  name             = "fabra-database-instance"
  region           = "us-west1"
  database_version = "POSTGRES_11"
  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.self_link
    }
  }

  deletion_protection  = "true"

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

data "google_secret_manager_secret_version" "db_password" {
  secret   = "fabra-db-password"
}

resource "google_sql_user" "db_user" {
  name = "db_user"
  instance = google_sql_database_instance.main_instance.name
  password = data.google_secret_manager_secret_version.db_password.secret_data
}

resource "google_cloudbuild_worker_pool" "builder_pool" {
  name = "fabra-pool"
  location = "us-west1"
  worker_config {
    no_external_ip = true
    disk_size_gb   = 100
    machine_type   = "e2-medium"
  }
  network_config {
    peered_network = google_compute_network.vpc.id
  }
}

resource "google_cloudbuild_trigger" "terraform-build-trigger" {
  name = "terraform-trigger"

  included_files = ["infra/terraform/**"]

  github {
    name  = "Fabra"
    owner = "nfiacco"

    push {
      branch       = "main"
      invert_regex = false
    }
  }

  filename = "infra/cloudbuild/terraform.yaml"
}

resource "google_cloudbuild_trigger" "backend-build-trigger" {
  name = "backend-trigger"

  included_files = ["backend/**"]

  github {
    name  = "Fabra"
    owner = "nfiacco"

    push {
      branch       = "main"
      invert_regex = false
    }
  }

  filename = "infra/cloudbuild/backend.yaml"
}

resource "google_cloud_run_service" "fabra" {
  name     = "fabra"
  location = "us-west1"

  template {
    spec {
      containers {
        image = "gcr.io/fabra-344902/fabra"
        env {
          name = "DB_USER"
          value = google_sql_user.db_user.name
        }
        env {
          name = "DB_NAME"
          value = google_sql_database.main_database.name
        }
        env {
          name = "DB_HOST"
          value = google_sql_database_instance.main_instance.private_ip_address
        }
        env {
          name = "DB_PORT"
          value = "5432"
        }
        env {
          name = "IS_PROD"
          value = "true"
        }
      }
    }

    metadata {
      annotations = {
        # Limit scale up to prevent any cost blow outs!
        "autoscaling.knative.dev/maxScale" = 5
        # Use the VPC Connector
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.connector.id
        # all egress from the service should go through the VPC Connector
        "run.googleapis.com/vpc-access-egress" = "private-ranges-only"
        "run.googleapis.com/client-name"       = "cloud-console"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  lifecycle {
    ignore_changes = [
      metadata.0.annotations,
      template.0.spec.0.containers.0.image,
    ]
  }

  autogenerate_revision_name = true
}

resource "google_vpc_access_connector" "connector" {
  name          = "vpcconn"
  region        = "us-west1"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc.name
}

resource "google_cloud_run_service_iam_member" "all_users_member" {
  location = google_cloud_run_service.fabra.location
  project = google_cloud_run_service.fabra.project
  service = google_cloud_run_service.fabra.name
  role = "roles/run.invoker"
  member = "allUsers"
}
