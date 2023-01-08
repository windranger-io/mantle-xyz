# BitDAO OS

The offial monorepo for the BitDAO ecosystem. We like to call it the BitDAO Operating System System.


## Tech Stack

This monorepo uses [turborepo]() and [pnpm](https://pnpm.io) as a package manager. It includes the following packages/apps:

### Apps and Packages

**Apps**

- `website`: The main BitDAO.io marketing website and pages
- `dashboard`: The main application dashboard, jobs, events, usecases, analytics 
- `resources`: A resource portal for docs, prompts, research
- `design-system`: A resource portal for docs, prompts, research
- `app-template`: A template to copy when adding a new application into the OS

**Packages**

- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo
- `ui`: A shared design system

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

The following tools are being used:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting


## Getting Started
You will need to have Node 14 and [pnpm](https://pnpm.io) installed 


### Build

To build all apps and packages, run the following command:

```
cd bitdao-os
pnpm run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd bitdao-os
pnpm run dev
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
