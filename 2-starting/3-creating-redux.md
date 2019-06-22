# Starting Logux Redux Project

In this section we will create UI client for Logux with [Logux Redux].
Logux Redux can work with any UI framework. We will use React
and Create React App only as example.

[Logux Redux]: https://github.com/logux/redux


## Server

Before starting the client you need to create Logux Server:

* [How to create the server] on Node.js.
* [How to create a proxy] to use HTTP server on any other language.

[How to create the server]: ./1-creating-server.md
[How to create a proxy]: ./2-creating-proxy.md


## Creating the Project

First you need to [install Node.js].

You will need a bundle to compile npm packages to JS bundle. Webpack or Parcel
will be perfect. Also we are recommend to use some library to bind Redux state
with DOM. React or Preact will work great. But for simple UI you can manually
write code to change DOM according state changes.

To create a project with a single command, we will use Create React App.
We will use `client-logux`, but you can replace it to more relevant.

*Under construction*

[install Node.js]: https://nodejs.org/en/download/package-manager/


## Adding Logux Redux

Install Logux Redux:

```sh
npm i @logux/server
```

*Under construction*


## Synchronization UI

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
