# Choosing Right Logux Architecture for Your Case

Next chapter depends on your use case. Find the closest client-side
and server-side case and then go to right chapter.


## Client

### Logux Redux

When you should choose it:

* You want to add WebSocket to Redux application.
* You are creating rich application on top of React or Angular.

Benefits:

* You should not worry of having different action order on different nodes.

Next step:

* If you are starting new project, read
  **[Starting Logux Redux Project](../2-starting/1-creating-redux.md)**.
* If you have old Redux project, read
  **[Replacing Redux to Logux Redux](../2-starting/2-replacing-redux.md)**.


### Logux Client

When you should choose it:

* When you don’t care about the order of action. All your operations should
  have commutative.

Benefits:

* Better performance.

Next step:

* Read **[Starting Logux Client Project](../2-starting/3-creating-client.md)**.


## Server

### Proxy Server

When you should choose it:

* You want to use legacy back-end.
* You do not want to use Node.js.

Benefits:

* Works with back-end on any language.
* You can always improve performance in critical parts by moving
  to [Mixed Servers](#mixed-server).

Next step:

* Read **[Creating Logux Proxy](../2-starting/4-creating-proxy.md)**.


### Node.js Server

When you should choose it:

* You are starting new back-end and like Node.js.

Benefits:

* The best performance.
* You can still keep some logic in servers written on different languages.

Next step:

* Read **[Starting Logux Server Project](../2-starting/5-creating-server.md)**.


### Mixed Server

When you should choose it:

* You are starting new back-end and like Node.js.

Next step:

* Read **[Starting Logux Server Project](../2-starting/5-creating-server.md)**.
* Set `LOGUX_BACKEND` or `backend` option to proxy actions and subscriptions
  without callbacks.


## Peer-to-peer

When you should choose it:

* When you do not fit classic client-server architecture.

Next step:

* Read Logux Core API.
* You can ask for advice in [Logux Gitter](https://gitter.im/logux/logux).
