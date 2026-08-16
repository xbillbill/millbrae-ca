# Self-service community listings

## Launch scope

The first release is a free community directory. A representative signs in with Google, creates one basic listing, and can later update or delete it. Public visitors can browse without signing in.

The form accepts only a business name, an allowlisted category, a 94030 street address, an HTTPS website, and a public phone number. It deliberately excludes descriptions, photos, offers, links in text, email collection, and paid placement. This makes automatic publishing practical while the directory is new.

## Architecture

- GitHub Pages serves the existing static site.
- Google Identity Services supplies a signed Google ID token using its standard web sign-in control.
- A public Lambda Function URL exposes four routes: public directory read, owner read, owner publish/update, and owner delete.
- Lambda verifies the Google ID token signature, issuer, audience, and expiry before every owner action.
- DynamoDB stores one listing per Google subject identifier. A small secondary index serves the public directory alphabetically.

No application email is sent or stored. Google may include profile claims in its signed identity token, but the application copies only the stable subject identifier into the DynamoDB key.

## Policy and abuse controls

- Google or Facebook federated identity only; Google is the initial provider.
- One listing per Google subject.
- 94030 addresses only.
- Allowlisted, low-risk local categories only.
- Prohibited business terms are rejected on the client and again in Lambda.
- Website URLs must use HTTPS and cannot contain embedded credentials.
- The representative must attest to authorization, accuracy, and lawful content.
- Ten publish, update, or delete actions per identity per day.
- Public directory responses are cached for one minute and limited to 100 records in the first release.
- Listing fields are rendered with DOM text nodes rather than HTML.

This is an MVP safety boundary, not a substitute for human enforcement. A later release should add structured user reporting and an owner-admin removal tool before accepting descriptions or images.

## No-cost guardrails

- DynamoDB uses provisioned capacity at 1 RCU and 1 WCU for the table and directory index, well inside the ongoing 25-unit free allocation.
- Lambda uses 128 MB, a five-second timeout, and reserved concurrency of two.
- Google Identity Services uses its public web client with no client secret stored in the site or Lambda.
- CloudWatch logs expire after three days.
- No API Gateway, Cognito, RDS, S3 uploads, SES, WAF, paid identity feature, or paid database backup is provisioned.

AWS free allocations are not hard billing stops. The application limits are deliberately low, but AWS does not offer a true account-level zero-dollar cutoff. No budget email notification is created while email features are paused.

## Deployment checklist

1. Create a Google OAuth web client at no charge. Add `https://www.millbrae.ca` and `http://localhost:8000` as authorized JavaScript origins.
2. Deploy `infrastructure/template.yaml` in the intended AWS account and region with the public Google client ID.
3. Copy the stack's API URL and Google client ID into `site/aws-config.js`; change `enabled` to `true`.
4. Test Google sign-in at `http://localhost:8000/list-your-business.html`, then publish, edit, and delete a test listing.
5. Confirm an unauthenticated visitor can read `community.html` but cannot call owner routes.
6. Confirm a modified client cannot publish an unsupported category, a non-94030 address, markup, an HTTP website, or a prohibited business name.
7. Run the full project tests, commit once, and push `main` for the existing GitHub Pages deployment.

Apple sign-in is deferred because web use normally requires the paid Apple Developer Program. Facebook can be added later with a free Meta app. LinkedIn is deferred because it needs a separate OIDC setup and is not necessary to launch the free directory.
