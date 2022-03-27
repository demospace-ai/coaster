terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "3.5.0"
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
