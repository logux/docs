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

Server will receive `{ type: '0', d, iv }` actions, which should be saved to the persistent log.
