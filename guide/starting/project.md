# Creating New Logux Project

Logux is a flexible framework. You can build very different systems with it (even point-to-point ones).

The most popular use case is a client-server application in a monorepo using TypeScript.

We suggest creating a monorepo with a structure like this:

```
project/
  api/
  server/
  client/
```

We will use the `api/` folder for types and constants shared between the client and server.

Create `api/index.ts` with the subprotocol version (client-server API).

```ts
export const SUBPROTOCOL = 1
```

Update it every time you change the API to track old clients (and suggest a different handler if necessary).

[Next chapter](./server.md)
