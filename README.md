# Millbrae Local

A no-cost local discovery publication and self-service community business directory for `millbrae.ca`.

## Monetization model

- Free organic discovery content builds a local audience.
- Eligible Millbrae businesses can publish and maintain a basic community listing at no charge.
- Social sign-in and server-side policy checks keep publishing self-service without collecting application email.
- Paid placement remains separate from free community listings and will be selected category by category.
- Paid self-service placement is deferred until the first chargeable category is selected from real directory demand.
- High-intent restaurant, hotel, airport-transit, parking, hotel-shuttle, and park-and-fly tools create sponsor inventory around real decisions.

## Run locally

```bash
cd site
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Publishing

Pushes to `main` deploy the `site/` directory to GitHub Pages. The deployment workflow then submits every sitemap URL to IndexNow.

Analytics are intentionally deferred until a privacy-conscious provider is selected.

## Self-service listings

The listing application uses Google social sign-in, a Lambda Function URL, and a provisioned DynamoDB table. Production configuration lives in `site/aws-config.js`; the infrastructure template documents the deployed no-cost architecture. See [docs/self-service-listings.md](docs/self-service-listings.md) for the policy, guardrails, and verification checklist.
