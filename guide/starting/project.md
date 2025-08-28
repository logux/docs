# Creating New Logux Project

Logux is a flexible framework. You can build very different systems (even point-to-point).

The most popular use case if to have client-server application in monorepo with TypeScript.

We suggest creating monorepo with a structure like this:

```
project/
  api/
  server/
  client/
```

We will use `api/` folder for types and constant shared between client and server.

Create `api/index.ts` with subprotocol version (client-server API).

```ts
export const SUBPROTOCOL = 1
```

Update it every time you change an API to track old clients (and suggest different handler if necessary).

[Next chapter](./server.md)
