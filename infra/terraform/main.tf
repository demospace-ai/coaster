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
  }
  network_config {
    peered_network = google_compute_network.network.id
  }
}
