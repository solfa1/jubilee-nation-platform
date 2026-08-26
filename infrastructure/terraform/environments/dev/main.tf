module "media_storage" {
  source = "../../modules/media-storage"

  bucket_name = var.media_bucket_name
  environment = "dev"

  allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3002"
  ]
}