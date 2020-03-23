# Replacing Vuex to Logux Vuex

If you already have Vuex application, this guide will help you to add [Logux Vuex] to project. Logux Vuex can work with any UI framework. We will use Vue only as an example.

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
npm i @logux/vuex
```

</details>

Find store definition in your project. Look for creating an instance of `Vuex.Store`. Often you can find it at `src/store/index.js`.

```diff
  import Vue from 'Vue'
  import Vuex from 'vuex'
+ import { createLogux } from '@logux/vuex'

  Vue.use(Vuex)

+ const Logux = createLogux({
+   subprotocol: '1.0.0',
+   server: process.env.NODE_ENV === 'development'
+     ? 'ws://localhost:31337'
+     : 'wss://logux.example.com',
+   userId: false,  // TODO: We will fill it in next chapter
+   credentials: '' // TODO: We will fill it in next chapter
+ })

- const store = new Vuex.Store({
+ const store = new Logux.Store({
    state: {},
    mutations: {},
    actions: {},
    modules: {}
  })

+ store.client.start()
```


## Synchronization UI

To see the state of the synchronization process, we will add some helpers. They are all optional, but they are great for a start.

Install Logux Client:

```sh
npm i @logux/client
```

Use helpers where you create the store.

```diff
  import { createLogux } from '@logux/vuex'
+ import badge from '@logux/client/badge'
+ import badgeStyles from '@logux/client/default'
+ import badgeText from '@logux/client/en'
+ import log from '@logux/client/log'
```

```diff
  const store = new Logux.Store({
    state: {},
    mutations: {},
    actions: {},
    modules: {}
  })

+ badge(store.client, { messages: badgeMessages, styles: badgeStyles })
+ log(store.client)

  store.client.start()
```


## Check the Result

1. Open three terminals.
2. Start your Logux server in one terminal by `npm start` in server directory.
3. Start your back-end server in the second terminal.
4. Start your client in the third terminal by `npm start` in client directory.

If badge style doesn’t fit your website style, you can always tweak it or replace with your component. See [`badge()`](https://logux.io/web-api/#globals-badge) and [`status()`](https://logux.io/web-api/#globals-status) API.

[Next chapter](../architecture/core.md)
