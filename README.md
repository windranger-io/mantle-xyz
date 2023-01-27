# Mantle XYZ

The offical monorepo for the Mantle website, bridge and faucet.

## Tech Stack

This monorepo uses [turborepo](https://turbo.build) for the monorepo build and [pnpm](https://pnpm.io) as a package manager. It includes the following packages/apps:

### Apps and Packages

**Apps (some apps not created yet)**

- `mantle-website`: The main [Mantle.xyz](https://www.mantle.xyz/) marketing website and pages
- `mantle-bridge`: The mantle bridge application
- `mantle-faucet`: The mantle faucet application
- `mantle-cms`: The mantle cms application
- `mantle-template`: A template for other apps

**Packages**

- `@mantle/eslint-config-next`: `eslint` configurations for nextjs apps
- `@mantle/tsconfig`: `tsconfig.json`s used throughout the monorepo
- `@mantle/ui`: A shared design system component library
- `@mantle/web-tests`: e2e tests configurable for all projects

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

The following tools are being used:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Husky](https://typicode.github.io/husky/#/) for for git hooks
- [Commitlint](https://commitlint.js.org/#/) for cleaner commit messages

## Getting Started

You will need to have Node 16.16.0 LTS and [pnpm](https://pnpm.io) installed

### Build

To build all apps and packages, run the following command:

```
cd mantle-xyz
pnpm run build
```

### Develop

Install dependencies

```
cd mantle-xyz
pnpm i
```

**Run all Website, facuet and bridge together:**

```
pnpm run dev
```

**Run projects alone:**

Mantle Website

```
pnpm run dev:web
```

Mantle Faucet

```
pnpm run dev:faucet
```

Mantle Bridge

```
pnpm run dev:bridge
```

Mantle CMS

```
pnpm run dev:cms
```

### Adding packages

Add packages to individual apps

```
pnpm add <PACKAGE_NAME> --filter mantle-website
```

For dev dependencies

```
pnpm add <PACKAGE_NAME> -D --filter mantle-website
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd bitdao-os
pnpm dlx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
pnpm dlx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
