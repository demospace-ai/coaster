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

provider "google-beta" {
  project     = "fabra-344902"
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
    no_external_ip = false
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
    name  = "fabra"
    owner = "fabra-io"

    push {
      branch       = "main"
      invert_regex = false
    }
  }

  filename = "infra/cloudbuild/terraform.yaml"
}

resource "google_cloudbuild_trigger" "backend-build-trigger" {
  name = "backend-trigger"

  included_files = ["backend/server/**"]
  ignored_files = ["backend/server/migrations/**"]

  github {
    name  = "fabra"
    owner = "fabra-io"

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
        "run.googleapis.com/vpc-access-egress" = "all-traffic"
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
      template.0.metadata.0.annotations,
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

resource "google_cloudbuild_trigger" "database-migration-trigger" {
  name = "database-migration-trigger"

  included_files = ["backend/server/migrations/**"]

  github {
    name  = "fabra"
    owner = "fabra-io"

    push {
      branch       = "main"
      invert_regex = false
    }
  }

  filename = "infra/cloudbuild/database-migration.yaml"
}

resource "google_compute_backend_service" "default" {
    affinity_cookie_ttl_sec         = 0
    connection_draining_timeout_sec = 300
    enable_cdn                      = false
    load_balancing_scheme           = "EXTERNAL"
    name                            = "fabra-lb-backend-default"
    port_name                       = "http"
    protocol                        = "HTTP"
    session_affinity                = "NONE"
    timeout_sec                     = 30

    backend {
        balancing_mode               = "UTILIZATION"
        capacity_scaler              = 1
        group                        = "https://www.googleapis.com/compute/v1/projects/fabra-344902/regions/us-west1/networkEndpointGroups/fabra-neg"
        max_connections              = 0
        max_connections_per_endpoint = 0
        max_connections_per_instance = 0
        max_rate                     = 0
        max_rate_per_endpoint        = 0
        max_rate_per_instance        = 0
        max_utilization              = 0
    }
}

resource "google_compute_global_address" "default" {
    address_type       = "EXTERNAL"
    name               = "fabra-lb-address"
    prefix_length      = 0
}

resource "google_compute_global_forwarding_rule" "http" {
    ip_address            = google_compute_global_address.default.id
    ip_protocol           = "TCP"
    load_balancing_scheme = "EXTERNAL"
    name                  = "fabra-lb"
    port_range            = "80"
    target                = google_compute_target_http_proxy.default.id
}

resource "google_compute_global_forwarding_rule" "https" {
    ip_address            = google_compute_global_address.default.id
    ip_protocol           = "TCP"
    load_balancing_scheme = "EXTERNAL"
    name                  = "fabra-lb-https"
    port_range            = "443"
    target                = google_compute_target_https_proxy.default.id
}

resource "google_compute_managed_ssl_certificate" "default" {
    name                      = "fabra-lb-cert"
    type                      = "MANAGED"

    managed {
        domains = [
            "app.fabra.io",
        ]
    }
}

resource "google_compute_url_map" "default" {
    name               = "fabra-lb-url-map"
    default_service    = google_compute_backend_bucket.frontend_backend.id
    host_rule {
        hosts = [
            "app.fabra.io",
        ]
        path_matcher = "fabra-lb-path-matcher"
    }
    
    path_matcher {
        name            = "fabra-lb-path-matcher"
        default_service = google_compute_backend_bucket.frontend_backend.id

        path_rule {
            paths   = [
              "/api/*",
            ]
            service = google_compute_backend_service.default.id
        }
    }
}

resource "google_compute_url_map" "https_redirect" {
    name = "fabra-lb-https-redirect"

    default_url_redirect {
        https_redirect         = true
        redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
        strip_query            = false
    }
}

resource "google_compute_target_http_proxy" "default" {
    name               = "fabra-lb-http-proxy"
    proxy_bind         = false
    url_map            = google_compute_url_map.https_redirect.id
}

resource "google_compute_target_https_proxy" "default" {
    name               = "fabra-lb-https-proxy"
    proxy_bind         = false
    quic_override      = "NONE"
    ssl_certificates   = [
        google_compute_managed_ssl_certificate.default.id,
    ]
    url_map            = google_compute_url_map.default.id
}

resource "google_compute_region_network_endpoint_group" "fabra_neg" {
  provider              = google
  name                  = "fabra-neg"
  network_endpoint_type = "SERVERLESS"
  region                = "us-west1"
  cloud_run {
    service = google_cloud_run_service.fabra.name
  }
}

resource "google_storage_bucket" "fabra_frontend_bucket" {
  name          = "fabra-frontend-bucket"
  location      = "US"
  storage_class = "STANDARD"

  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_storage_bucket_iam_member" "public_member_read_access" {
  bucket = google_storage_bucket.fabra_frontend_bucket.name
  role = "roles/storage.objectViewer"
  member = "allUsers"
}

resource "google_compute_backend_bucket" "frontend_backend" {
  name        = "frontend-backend-bucket"
  description = "Static react web app"
  bucket_name = google_storage_bucket.fabra_frontend_bucket.name
  enable_cdn  = true
}

resource "google_cloudbuild_trigger" "frontend-build-trigger" {
  name = "frontend-trigger"

  included_files = ["frontend/**"]

  github {
    name  = "fabra"
    owner = "fabra-io"

    push {
      branch       = "main"
      invert_regex = false
    }
  }

  filename = "infra/cloudbuild/frontend.yaml"
}

resource "google_kms_key_ring" "data-connection-keyring" {
  name     = "data-connection-keyring"
  location = "global"
}

resource "google_kms_crypto_key" "data-connection-key" {
  name            = "data-connection-key"
  key_ring        = google_kms_key_ring.data-connection-keyring.id
  rotation_period = "100000s"

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_key_ring_iam_member" "data-connection-key-ring-cloud-run-role" {
  key_ring_id = google_kms_key_ring.data-connection-keyring.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:932264813910-compute@developer.gserviceaccount.com"
}

resource "google_kms_key_ring" "api-key-keyring" {
  name     = "api-key-keyring"
  location = "global"
}

resource "google_kms_crypto_key" "api-key-key" {
  name            = "api-key-key"
  key_ring        = google_kms_key_ring.api-key-keyring.id
  rotation_period = "100000s"

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_key_ring_iam_member" "api-key-key-ring-cloud-run-role" {
  key_ring_id = google_kms_key_ring.api-key-keyring.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:932264813910-compute@developer.gserviceaccount.com"
}

resource "google_compute_router" "fabra-ip-router" {
  name     = "fabra-ip-router"
  network  = google_compute_network.vpc.name
  region   = "us-west1"
}

resource "google_compute_address" "egress-ip-address" {
  name     = "egress-statis-ip"
  region   = "us-west1"
}

resource "google_compute_router_nat" "fabra-nat" {
  name     = "fabra-static-nat"
  router   = google_compute_router.fabra-ip-router.name
  region   = "us-west1"

  nat_ip_allocate_option = "MANUAL_ONLY"
  nat_ips                = [google_compute_address.egress-ip-address.self_link]

  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}
