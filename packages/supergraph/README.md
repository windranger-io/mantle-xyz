# Mantle - Supergraph - Vercel Subgraph-like multi-chain indexer

This directory contains a utility toolkit to index any RPC using subgraph-like mapping definitions backed by MongoDB.

The constructed `Entities` are made available in the background to a schema-driven `graphql-yoga` instance via resolvers.

## Tech Stack

We are depending on:

- `graphql-yoga` to create a GraphQL endpoint
- `ethers` to map `Events` to stored `Entities`
- `mongodb`/`node-persist` as a persistence layer
- `typescript`, `eslint`, and `prettier` to maintain coding standards

## Usage

### Getting started

To get started with `supergraph`, follow these steps:

1. Install the required dependencies:

   ```bash
   $ pnpm add @mantle-xyz/supergraph
   ```

### GraphQL:

1. Construct a schema that will be 1:1 mapped against our `sync` handler entities:

   ```typescript
   const schema = `
     # id = \`\${owner}\`
     type Name @entity {
       id: ID!
       name: String
       owner: Bytes
       number: BigNumber
     }
   `;
   const entities = {
     Name: [
       {
         id: "0",
         name: "grezle",
         owner: "0x0...",
         number: "0848293943825030",
       },
     ],
   };
   ```

2. If we're using `supergraph` to construct static `GraphQL` endpoints, we can call `createSupergraph` and supply a mapping of arrays (`{Entity: []}`) as the `entities` prop, otherwise, we might want to use a resolver:

   ```typescript
   import { createSupergraph, memoryResolver } from "@mantle-xyz/supergraph";

   import * as http from "http";

   const supergraph = createSupergraph({
     schema,
     entities: memoryResolver({
       name: "supergraph",
     }),
     graphqlEndpoint: ``, // the relative path which will load supergraph.GET()
     defaultQuery: `
       {
         names {
           id
           name
           number
           owner
         }
       }`,
   });

   const server = http.createServer(supergraph);

   server.listen(4001, () => {
     console.info("Server is running on http://localhost:4001/api/graphql");
   });
   ```

3. Start `supergraph` with node:

   ```bash
   $ node ./[filename].js
   ```

4. Or expose it as a `nextjs` endpoint:

   ```typescript
   import type { NextApiRequest, NextApiResponse } from "next";

   export default createSupergraph<NextApiRequest, NextApiResponse>({
     schema,
     entities,
     graphqlEndpoint: `/api/graphql`, // this _must_ match the current route
     defaultQuery: `
       {
         names {
           id
           name
           number
           owner
         }
       }`,
   });
   ```

5. Start `nextjs` as normal:

   ```bash
   $ yarn dev
   ```

### Sync

To create a new `supergraph syncOp[]` handler and keep the `supergraph` instance up to date, follow these steps:

1. Import the necessary functions:

   ```typescript
   import { addSync, sync, Store } from "@mantle-xyz/supergraph";
   ```

2. Create a new `syncOp[]` handler using `addSync()`:

   ```typescript
   const handler = addSync<{ name: string; number: string }>(
     CONTRACT_EVT,
     CONTRACT_ADDRESS,
     CHAINS_PROVIDER,
     CONTRACT_ABI,
     async ({ name, number }, { tx, block }) => {
       // Code for handling the sync operation
     }
   );
   ```

3. Retrieve an entity from the store and update its properties:

   ```typescript
   const handler = addSync<{ name: string; number: string }>(
     ...async ({ name, number }, { tx, block }) => {
       let entity = await Store.get<{
         id: string;
         name: string;
         number: string;
         owner: string;
       }>("Name", tx.from);

       entity.set("name", name);
       entity.set("number", number);
       entity.set("owner", tx.from);

       entity = await entity.save();
     }
   );
   ```

4. Call the `sync()` method in the `GET` handler of a nextjs `route.ts` document (or any other means if running `supergraph` in a different environment):

   ```typescript
   export async function GET() {
     const events = await sync(); // all new events discovered from all sync operations

     // Code for handling the response
   }
   ```

5. The simplest way to keep a Vercel-hosted `supergraph` instance up to date is to set a `cron` job in the project's `vercel.json` config to call the `${sync_get_route}` every minute (`reqs per day` === `syncOps * 1440`):

   ```
   # vercel.json
   {
     "crons": [
       {
         "path": `${sync_get_route}`,
         "schedule": "* * * * *"
       }
     ]
   }
   ```

## Contributing

If you would like to contribute to `supergraph`, please follow these steps:

1. Fork this repository.
2. Create a new branch for your changes.
3. Make your changes and test them thoroughly.
4. Create a pull request and describe your changes.
