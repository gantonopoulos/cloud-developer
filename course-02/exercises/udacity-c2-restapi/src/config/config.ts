export const config = {
  "dev": {
    "username": process.env["POSTGRES_USERNAME"],
    "password": process.env["POSTGRES_PASSWORD"],
    "database": "pontikasdb",
    "host": "pontikasdb.crtkvdvwlnm8.eu-west-3.rds.amazonaws.com",
    "dialect": "postgres",
    "aws_region": process.env["AWS_REGION"],
    "aws_profile": process.env["AWS_PROFILE"],
    "aws_media_bucket": "pontikasdb-bucky-dev"
  },
  "prod": {
    "username": "",
    "password": "",
    "database": "udagram_prod",
    "host": "",
    "dialect": "postgres"
  }
}
