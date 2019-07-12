# What Problems does Logux Solve

Logux was created to improve UX of client-server applications working on top of non-stable network. From non-stable LTE connection in subway to non-stable Wi-Fi connection in overpopulated area.


## Offline-First and Fixing Merge Conflicts

Server Workers are great in serving JS and CSS files in offline. But you need a special application architecture to work with data without server connection.

You need to apply changes to the local state and keep requests for server until you will have connection. What if during offline another user changed the same document? We need somehow merge our changes in right order. What if user do not have rights to apply that changes? We need to revert this changes locally.

Logux has built-in solution for these hard questions. It keep actions in the memory. Every action has time mark to merge conflicts in right order. During the edit conflict, Logux will revert changes, get new actions from another client and apply all changes in right order.


## Optimistic UI for Better Subjective Performance

Optimistic UI us a pattern to accept changes in UI immediately without loader and waiting server response. It increase subjective performance of your application.

But production ready Optimistic UI is similiar to Offline First. What if user do not have Internet connection (you will find it only after sending the request)?

Because Logux is Offline First by design, Optimistic UI will work as expected in many edge cases of real non-stable network and servers.


## Live Updates to See the Latest Data

By default, Logux will always show the latest data without need to press Reload button to see changes.

Logux uses WebSockets subscriptions instead of HTTP requests. You application can subscribe to some channel. Server will send current state to the client. If server in the future will receive action changing this data (with the same channel in `meta.channels`) server will resend this new action to all subscribed clients.

The same is working between brower tabs even in offline. They synchronize new actions so all browser tabs have the same state.


## Network Reliability

There are many small problems in working with real network. With AJAX and GraphQL it is easy to forget about these problems because developer has the best connection between local client and local server. In the real world these problems will affect on overal UX.

* **Request order.** HTTP doesn’t garantee that server will receive request in the same order they were sent. Often this problem appears in wrong results during keyword input. Logux doesn’t have this problem by design because every action has time mark.
* **Missed responce.** We often see infinite loader if network went down for a second before AJAX response was received. In contrast Logux will send data request again when you will have network.
* **Server error.** It is easy to forget process server error. Logux will undo action during server error and use global UI to show error message.


## Cross-Tab Communications in the Browser

Logux has built-in cross-tab communication. Calling `dispatch.crossTab()` or `dispatch.sync()` will dispatch action in all browser tabs.

Also in Logux only one browser tab keeps WebSocket connection. All other tabs reuse the same connection. It garantees the same state in all tabs and saves server resources.


## Compatibility Between Different Client Versions

Sometimes your user may keep webapp in without reloading for a weeks. It may creates probems when you will change the API between client and server and deploy new version. Old client will work with new server.

In Logux every client has `subprotocol` version. Every action has a `meta.subprotocol` with the version of the client. Server may refuse old clients for connection (client will ask users to reload the page) or may use different code to process action from old API:

```js
server.type('user/rename', {
  …
  process (ctx, action, meta) {
    let user
    if (ctx.isSubprotocol('2.x')) {
      user = findUser(action.userId)
    } else {
      user = findUser(action.id)
    }
    …
  }
})
```


**[Next chapter →](./4-compare.md)**
