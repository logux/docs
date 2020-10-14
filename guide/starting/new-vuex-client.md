# Starting Logux Vuex Project

In this section, we will create a UI client for Logux with [Logux Vuex].


[Logux Vuex]: https://github.com/logux/vuex


## Server

Before starting the client, you need to create Logux Server:

* [How to create the server] on Node.js.
* [How to create a proxy] to use HTTP server on any other language.

[How to create the server]: ./node-server.md
[How to create a proxy]: ./proxy-server.md


## Creating the Project

[Install Node.js].

You will need a bundler to compile npm packages into JS bundle. Webpack or Parcel is excellent for it.
Since Vuex is a official flux-like state management library for Vue.js, we will use Vue as core framework of application.
To create a project with a single command, we will use [Vue CLI].

```sh
npx @vue/cli create client-logux
cd client-logux
```

[Vue CLI]: https://cli.vuejs.org
[Install Node.js]: https://nodejs.org/en/download/package-manager/


## Adding Vuex

If you have chosen the default Vue CLI preset, then you have not yet installed Vuex.
You can install it via Vue CLI:

```sh
npx @vue/cli add vuex
```

Or manually, as described in [Vuex documentation](https://vuex.vuejs.org/installation.html).


## Adding Logux Vuex

Install Logux Vuex:

```sh
npm i @logux/core @logux/client @logux/vuex
```

Edit `src/store/index.js`:

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

Change `src/store/index.js`:

```diff
- import { CrossTabClient } from '@logux/client'
+ import { CrossTabClient, badge, badgeEn, log } from '@logux/client'
+ import { badgeStyles } from '@logux/client/badge/styles'
  import { createStoreCreator } from '@logux/vuex'
```

```diff
+ badge(store.client, { messages: badgeEn, styles: badgeStyles })
+ log(store.client)
+
  store.client.start()
```


## Check the Result

1. Open two terminals.
2. Start your Logux server in one terminal by `npm start` in server directory.
3. Start your client in the second terminal by `npm start` in client directory.

[Next chapter](../architecture/core.md)
