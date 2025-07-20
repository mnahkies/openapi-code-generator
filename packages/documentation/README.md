# @nahkies/openapi-code-generator - documentation website
The documentation website is built using [NextJS](https://nextjs.org/) / [Nextra](https://nextra.site/).

It's hosted at https://openapi-code-generator.nahkies.co.nz/ using GitHub pages.

<!-- toc -->

- [Local development](#local-development)
  - [Testing production builds](#testing-production-builds)

<!-- tocstop -->

## Local development

Run the development server with the `dev` script:

```shell
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing production builds

Additional Requirements:
- Docker

You can test a production build locally by using the included script. It'll run
a production build, and then serve it on port `8080` using the official `nginx` docker image

```shell
./scripts/serve-prod-build-in-docker.sh
```
