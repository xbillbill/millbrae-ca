# AWS deployment credentials

The repository uses the local AWS CLI profile named `millbrae`. Credentials must
stay in the user's local AWS credential store (`~/.aws/credentials`) and must
not be committed to this repository.

## One-time setup

The dedicated `millbrae-deployer` user has already been created in account
`314328938695`. Its customer-managed policy is checked in at
`infrastructure/millbrae-deployer-policy.json` and is limited to the existing
`millbrae-local-listings` Lambda, DynamoDB table, CloudWatch logs, and
read-only CloudFormation stack inspection. It has no IAM administration,
S3-wide, or root permissions.

Create one access key for that IAM user, then run locally:

```bash
aws configure --profile millbrae
```

Enter the access key ID and secret access key when prompted, use `us-west-2` as
the default region, and choose `json` as the output format. The secret is saved
outside the repository. Do not paste it into chat, a source file, or a GitHub
secret unless you intentionally set up CI deployment.

Verify the account before making changes:

```bash
npm run aws:whoami
```

The returned account must be `314328938695` (or the AWS account you explicitly
intend to manage).

## Deploy

The scoped profile is ready for direct Lambda and DynamoDB maintenance. A full
new SAM/CloudFormation deployment needs a separate, explicitly authorized
deployment role because it creates IAM roles and uploads artifacts. Do not
broaden this local key casually. If that is needed later, create a separate
short-lived deployment profile.

For reference, a full deployment would use the AWS SAM CLI:

```bash
sam deploy \
  --profile millbrae \
  --region us-west-2 \
  --stack-name millbrae-local-listings \
  --template-file infrastructure/template.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides SiteOrigin=https://www.millbrae.ca GoogleClientId=YOUR_GOOGLE_CLIENT_ID
```

The `deploy:listings` npm script is also available after replacing its
placeholder Google client ID.

Access keys are long-lived, but not truly permanent: rotate them periodically
and delete old keys. This avoids repeated browser sign-in while keeping the
application's runtime credentials separate; Lambda continues to use its own
execution role and no AWS secret is exposed to the website.
