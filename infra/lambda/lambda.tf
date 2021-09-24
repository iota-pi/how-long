locals {
  standard_tags = {
    Environment = var.environment
    Component   = "lambda"
    Application = "how-long"
  }
}

resource "aws_lambda_function" "lambda" {
  function_name = "how-long-lambda-${var.environment}"

  handler     = "lambda.handler"
  runtime     = "nodejs14.x"
  memory_size = 256
  timeout     = 5

  s3_bucket = var.code_bucket
  s3_key    = "how-long/${var.environment}/${var.git_version}/lambda.zip"

  role = aws_iam_role.lambda_role.arn

  environment {
    variables = {
      CACHE_TABLE = aws_dynamodb_table.cache_table.name
    }
  }

  tags = local.standard_tags
}

resource "aws_iam_role" "lambda_role" {
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "lambda_policy" {
  description = "Lambda policy to allow writing to DynamoDB and logging"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PutLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": ["arn:aws:logs:*:*:*"]
    },
    {
      "Sid": "ReadWriteCreateTable",
      "Effect": "Allow",
      "Action": [
          "dynamodb:BatchGetItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:CreateTable"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/${aws_dynamodb_table.cache_table.name}"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}


resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.lambda.function_name}"
  retention_in_days = 14
}


resource "aws_dynamodb_table" "cache_table" {
  name         = "HowLongCache_${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "reference"

  attribute {
    name = "reference"
    type = "S"
  }

  tags = local.standard_tags
}


resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.lambda_gateway.execution_arn}/*/*"
}


resource "aws_api_gateway_rest_api" "lambda_gateway" {
  name        = "how_long_lambda_gateway_${var.environment}"
  description = "How Long gateway for API"
}

resource "aws_api_gateway_resource" "lambda_proxy" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  parent_id   = aws_api_gateway_rest_api.lambda_gateway.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "lambda_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id   = aws_api_gateway_resource.lambda_proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_lambda" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = aws_api_gateway_method.lambda_proxy_method.resource_id
  http_method = aws_api_gateway_method.lambda_proxy_method.http_method

  integration_http_method = "POST"

  type = "AWS_PROXY"
  uri  = aws_lambda_function.lambda.invoke_arn
}

resource "aws_api_gateway_method" "lambda_proxy_method_root" {
  rest_api_id   = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id   = aws_api_gateway_rest_api.lambda_gateway.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  resource_id = aws_api_gateway_method.lambda_proxy_method_root.resource_id
  http_method = aws_api_gateway_method.lambda_proxy_method_root.http_method

  integration_http_method = "POST"

  type = "AWS_PROXY"
  uri  = aws_lambda_function.lambda.invoke_arn
}

resource "aws_api_gateway_deployment" "lambda_deployment" {
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.lambda_proxy.id,
      aws_api_gateway_method.lambda_proxy_method.id,
      aws_api_gateway_method.lambda_proxy_method_root.id,
      aws_api_gateway_integration.lambda_lambda.id,
      aws_api_gateway_integration.lambda_lambda_root.id,
      aws_cloudwatch_log_group.debugging.id,
    ]))
  }

  rest_api_id = aws_api_gateway_rest_api.lambda_gateway.id
  stage_name  = var.environment
}


resource "aws_cloudwatch_log_group" "debugging" {
  name = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.lambda_gateway.id}/${var.environment}"

  retention_in_days = 7
}

output "invoke_url" {
  value = aws_api_gateway_deployment.lambda_deployment.invoke_url
}
