# Starting Logux Client Project

In this section, we will create a UI client for Logux with [Logux Client](https://github.com/logux/client).

We recommend using any Single-Page-Application boilerplate based on Vite.

Then install Logux Client:

```sh
npm i @logux/client
```

Open `src/index.ts` and add:

```tsx
import { CrossTabClient, badge, badgeEn, log } from '@logux/client'
import { badgeStyles } from '@logux/client/badge/styles'
import { SUBPROTOCOL } from '../api'

const client = new CrossTabClient({
  prefix: 'appName',
  server: process.env.NODE_ENV === 'development'
    ? 'ws://localhost:31337'
    : 'wss://logux.example.com',
  subprotocol: SUBPROTOCOL,
  userId: 'anonymous',  // TODO: We will fill it in Authentication recipe
  token: ''  // TODO: We will fill it in Authentication recipe
})

badge(client, { messages: badgeEn, styles: badgeStyles })
log(client)

client.start()
```


## Check the Result

1. Open two terminals.
2. Start your Logux server in one terminal by `npm start` in server directory.
3. Start your client in the second terminal by `npm start` in client directory.

[Next chapter](../architecture/core.md)
