output "environment" {
  value = local.environment
}

output "app_bucket" {
  value = module.app.app_bucket
}

output "lambda_endpoint" {
  value = module.lambda.invoke_url
}
