# Replacing Vuex to Logux Vuex

Logux has [Vuex] support, an official flux-like state management library for Vue.js. This guide will help you to integrate [Logux Vuex] with your Vuex store.

[Vuex]: https://vuex.vuejs.org
[Logux Vuex]: https://github.com/logux/vuex



## Server

Before starting the client, you need to create Logux Server:

* [How to create the server] on Node.js.
* [How to create a proxy] to use HTTP server on any other language.

[How to create the server]: ./node-server.md
[How to create a proxy]: ./proxy-server.md


## Adding Logux Vuex

Install Logux Vuex:

```sh
npm i @logux/core @logux/client @logux/vuex
```

</details>

Find store definition in your project. Look for `createStore` function call. Often you can find it at `src/store/index.js`.

```diff
- import { createStore } from 'vuex'
+ import { CrossTabClient } from '@logux/client'
+ import { createStoreCreator } from '@logux/vuex'
+
+ const client = new CrossTabClient({
+   server: process.env.NODE_ENV === 'development'
+     ? 'ws://localhost:31337'
+     : 'wss://logux.example.com',
+   subprotocol: '1.0.0',
+   userId: 'anonymous',  // TODO: We will fill it in Authentication recipe
+   token: ''  // TODO: We will fill it in Authentication recipe
+ })
+
+ const createStore = createStoreCreator(client)

- export default createStore({
+ const store = createStore({
    state: {},
    mutations: {},
    actions: {},
    modules: {}
  })

+ store.client.start()
+
+ export default store
```


## Synchronization UI

To see the state of the synchronization process, we will add some helpers. They are all optional, but they are great for a start.

Install Logux Client:

```sh
npm i @logux/client
```

Use helpers where you create the store.

```diff
- import { CrossTabClient } from '@logux/client'
+ import { CrossTabClient, badge, badgeEn, log } from '@logux/client'
  import { createStoreCreator } from '@logux/vuex'
+ import { badgeStyles } from '@logux/client/badge/styles'
```

```diff
+ badge(store.client, { messages: badgeEn, styles: badgeStyles })
+ log(store.client)
+
  store.client.start()
```


## Check the Result

1. Open three terminals.
2. Start your Logux server in one terminal by `npm start` in server directory.
3. Start your back-end server in the second terminal.
4. Start your client in the third terminal by `npm start` in client directory.

If badge style doesn’t fit your website style, you can always tweak it or replace with your component. See [`badge()`](https://logux.io/vuex-api/#globals-badge) and [`status()`](https://logux.io/vuex-api/#globals-status) API.

[Next chapter](../architecture/core.md)
