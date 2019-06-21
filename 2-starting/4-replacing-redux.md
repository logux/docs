# Replacing Redux to Logux Redux

If you already have Redux application, this guide will help you
to add [Logux Redux] to project. Logux Redux can work with any UI framework.
We will use React only as example.

If you just starting new project use [special guide] for creating project.

[different guide]: ./3-creating-redux.md
[Logux Redux]: https://github.com/logux/redux


## Server

Before starting the client you need to create Logux Server:

* [How to create the server] on Node.js.
* [How to create a proxy] to use HTTP server on any other language.

[How to create the server]: ./1-creating-server.md
[How to create a proxy]: ./2-creating-proxy.md


## Adding Logux Server

Install Logux Redux:

```sh
npm i @logux/redux @logux/client
```

</details>

Find store definition in your project. Look for `createStore` function call.
Often you can find it at `src/store/index.js` (TODO). Replace `createStore`
to `createLoguxCreator`:

```diff
- import { createStore } from 'redux'
+ import createLoguxCreator from '@logux/redux/create-logux-creator'
```

```diff
+ const createStore = createLoguxCreator({
+   subprotocol: '0.1.0',
+   server: process.env.NODE_ENV === 'development'
+     ? 'ws://localhost:31337'
+     : 'wss://logux.example.com',
+   userId: false,  // TODO: We will fill it in next chapter
+   credentials: '' // TODO: We will fill it in next chapter
+ })
  const store = createStore(reducer, preloadedState, enhancer)
```

Replace `wss://logux.example.com` to real URL of your Logux Server,
when you will know it.


## Syncronization UI

To see the state of synchronization process we will add some helpers.
They are all optional, but they are great for the start.

```diff
  import createLoguxCreator from '@logux/redux/create-logux-creator'
+ import badge from '@logux/client/badge'
+ import badgeStyles from '@logux/client/default'
+ import badgeText from '@logux/client/en'
+ import log from '@logux/client/log'
```

```diff
  const store = createStore(reducer, preloadedState, enhancer)
+ badge(store.client)
+ log(store.client)
```


## Check the Result

Start the your project by `npm start`. In top left corner you will see the badge
with authentication error. It is OK, we will add code for authentication
only in next chapter.

If badge style doesn’t fit your website style you can always tweak it
or replace with own component. See `@logux/client/badge`
and `@logux/client/status` API.

**[Next chapter →](./5-authentication.md)**
