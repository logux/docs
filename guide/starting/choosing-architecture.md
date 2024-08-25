# Choosing Right Logux Architecture for Your Case

Next chapters depend on your use case. Find the closest client-side and server-side case and then go to right chapters.


## Server

* Read **[Starting Logux Server](../starting/node-server.md)**.


## Client

### Logux Redux or Vuex

When you should choose it:

* You want to add WebSocket to Redux or Vuex application.
* You are creating rich application on top of React or Vue.js.

Benefits:

* You should not worry of having different action order on different nodes.

Next step:

* If you are starting new React project, read **[Starting Logux Redux Project](../starting/new-redux-client.md)**.
* If you are starting new Vue project, read **[Starting Logux Vuex Project](../starting/new-vuex-client.md)**.
* If you have old Redux project, read **[Replacing Redux to Logux Redux](../starting/replace-redux.md)**.
* If you have old Vuex project, read **[Replacing Vuex to Logux Vuex](../starting/replace-vuex.md)**.


### Logux Client

When you should choose it:

* You deeply understand how Logux works and your algorithm doesn’t care about the order of action. All your operations should be commutative.

Benefits:

* Better performance.

Next step:

* Read [`CrossTabClient`](https://logux.org/web-api/#crosstabclient) API.


## Peer-to-peer

When you should choose it:

* When you do not fit classic client-server architecture.

Next step:

* Read Logux Core API.
