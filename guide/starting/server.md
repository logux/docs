# Starting Logux Server Project

Create `server/package.json` with:

```json
{
  "name": "server",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node --experimental-strip-types --watch index.ts"
  }
}
```

Install [Logux Server](https://github.com/logux/server):

```sh
npm i @logux/server
```

Create `index.ts` with:

```js
import { Server } from '@logux/server'
import { SUBPROTOCOL } from '../api/index.js'

const server = new Server(
  Server.loadOptions(process, {
    subprotocol: SUBPROTOCOL,
    minSubprotocol: 1,
    fileUrl: import.meta.url
  })
)

server.auth(async ({ userId, token }) => {
  // Allow only local users until we will have a proper authentication
  return process.env.NODE_ENV === 'development'
})

server.listen()
```

The simple Logux server is ready. You can start it with:

```sh
npm start
```

To stop the server press <kbd>Command</kbd>+<kbd>.</kbd> on Mac OS X and <kbd>Ctrl</kbd>+<kbd>C</kbd> on Linux and Windows.

Look at [Node.js API](https://logux.org/node-api/#server) to learn server API.

[Next chapter](./client.md)
