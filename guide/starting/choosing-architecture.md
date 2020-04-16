# Choosing Right Logux Architecture for Your Case

Next chapters depend on your use case. Find the closest client-side and server-side case and then go to right chapters.


## Server

### Node.js Server

When you should choose it:

* You are starting new back-end and like Node.js.

Benefits:

* The best performance.
* You can still keep some logic in servers written on different languages. See [Mixed Server](#mixed-server).

Next step:

* Read **[Starting Logux Server](../starting/node-server.md)**.

### Proxy Server

When you should choose it:

* You want to use legacy back-end.
* You do not want to write new back-end on top of Node.js.

Benefits:

* Works with back-end on any language.
* You can always improve performance in critical parts by moving to [Mixed Server](#mixed-server).

Next step:

* Read **[Creating Logux Proxy](../starting/proxy-server.md)**.


### Mixed Server

When you should choose it:

* You want to keep some back-end logic in Logux Server on Node.js and some back-end logic should be sent to other HTTP servers.

Next step:

1. Read **[Starting Logux Server](../starting/node-server.md)**.
2. Set `LOGUX_BACKEND` or `backend` option.
3. All actions with `server.type()` and all subscriptions with `server.channel()` will be processed by Logux Server. All actions and subscriptions without these definitions will be sent to HTTP server from `backend` option.


## Client

### Logux Redux or Vuex

When you should choose it:

* You want to add WebSocket to Redux or Vuex application.
* You are creating rich application on top of React or Vue.js.

Benefits:

* You should not worry of having different action order on different nodes.

Next step:

* If you are starting new React project, read **[Starting Logux Redux Project](../starting/new-client.md)**.
* If you have old Redux project, read **[Replacing Redux to Logux Redux](../starting/replace-redux.md)**.
* If you have old Vuex project, read **[Replacing Vuex to Logux Vuex](../starting/replace-vuex.md)**.


### Logux Client

When you should choose it:

* You deeply understand how Logux works and your algorithm doesn’t care about the order of action. All your operations should be commutative.

Benefits:

* Better performance.

Next step:

* Read [`CrossTabClient`](https://logux.io/redux-api/#crosstabclient) API.


## Peer-to-peer

When you should choose it:

* When you do not fit classic client-server architecture.

Next step:

1. Read Logux Core API.
2. You can ask for advice in [Logux support chat](https://gitter.im/logux/logux).
