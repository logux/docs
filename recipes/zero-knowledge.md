# Zero-Knowledge Server

Zero-Knowledge Server is an answer to modern privacy problems, when server can’t read user’s data. It has a few limits:

1. Server should not know user’s password, which mean that password recovery will not work.
2. All data manipulations must happen on client-side. Server will be used only to synchronize data between clients.

P2P-protocols without any servers (like [IPFS](https://js.ipfs.io/)) can be a better solution for some cases.

```js
import { encryptActions } from '@logux/client'

// Server should not know it
let clientPassword = localStorage.getItem('userPassword')

encryptActions(client, clientPassword, {
  ignore: ['server/public'] // action.type to not be encrypted
})
```

Clients will convert all actions to:

```ts
{ type: '0', d: string, iv: string }
```

Server need to save client’s actions. For instance by using persistent log (you may need to write `LogStore` implementation to keep log in some database).

On the server you will need to set `reasons` for `0` actions to keep them in log:

```js
import { parseId } from '@logux/core'

server.log.type('0', (action, meta) => {
  meta.reasons.push('user:' + parseId(meta.id).userId)
}, 'preadd')
```

When client will remove some action, it will send:

```ts
{ type: '0/clean', id: string }
```

Server need to remove `reasons` for that actions:

```js
import { parseId } from '@logux/core'

server.log.type('0/clean', (action) => {
  server.log.removeReason('user:' + parseId(action.id).userId, {
    id: action.id
  })
})
```
