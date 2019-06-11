# Choosing Right Logux Architecture for Your Case

Next chapters depend on your use case. Find the closest client-side
and server-side case and then go to right chapters.


## Client

### Logux Redux

When you should choose it:

* You want to add WebSocket to Redux application.
* You are creating rich application on top of React.

Benefits:

* You should not worry of having different action order on different nodes.

Next step:

* If you are starting new project, read
  **[Starting Logux Redux Project](../2-starting/1-creating-redux.md)**.
* If you have old Redux project, read
  **[Replacing Redux to Logux Redux](../2-starting/2-replacing-redux.md)**.


### Logux Client

When you should choose it:

* You deeply understand how Logux works and your algorithm doesn’t care about
  the order of action. All your operations should be commutative.

Benefits:

* Better performance.

Next step:

* Read **[Starting Logux Client Project](../2-starting/3-creating-client.md)**.


## Server

### Proxy Server

When you should choose it:

* You want to use legacy back-end.
* You do not want to write new back-end on top of Node.js.

Benefits:

* Works with back-end on any language.
* You can always improve performance in critical parts by moving
  to [Mixed Server](#mixed-server).

Next step:

* Read **[Creating Logux Proxy](../2-starting/4-creating-proxy.md)**.


### Node.js Server

When you should choose it:

* You are starting new back-end and like Node.js.

Benefits:

* The best performance.
* You can still keep some logic in servers written on different languages.
  See [Mixed Server](#mixed-server).

Next step:

* Read **[Starting Logux Server Project](../2-starting/5-creating-server.md)**.


### Mixed Server

When you should choose it:

* You want to keep some back-end logic in Logux Server on Node.js
  and some back-end logic should be sent to other HTTP servers.

Next step:

1. Read **[Starting Logux Server Project](../2-starting/5-creating-server.md)**.
2. Set `LOGUX_BACKEND` or `backend` option.
3. All actions with `server.type()` and all subscriptions
   with `server.channel()` will be processed by Logux Server. All actions
   and subscriptions without these definitions will be sent to HTTP server
   from `backend` option.


## Peer-to-peer

When you should choose it:

* When you do not fit classic client-server architecture.

Next step:

1. Read Logux Core API.
2. You can ask for advice in [Logux Gitter](https://gitter.im/logux/logux).
