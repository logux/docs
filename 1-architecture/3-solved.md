# What Problems does Logux Solve

We created Logux to have better UX in non-stable networks of the real world. From non-stable LTE connection in the subway to non-stable WiFi connection in an overpopulated area.


## Reactive Programming and WebSocket Integration

Sending data to the server is a basic feature of any web application. AJAX is easy in simple non-read examples in docs. Unfortunately, in production we have a lot of abstractions for AJAX: action creator, Promises, loader flags, HTTP parameters and body.

In Logux we try to simplify the system. You have actions. You use this actions to change UI. And you use the same actions to communicate with servers. Back-end code works with the same action. And server response is actions as well.

```js
store.dispatch.sync({ type: 'user/rename', userId: 380, name: 'New name' })
```

A lot of complicated systems like live updates, Optimistic UI and conflict resolution works in Logux out of box.


## Offline-First and Fixing Merge Conflicts

Service Worker is great in serving JS and CSS files in offline. But you need a special application architecture to work with data without server connection.

You need to apply changes to the local state and keep requests for the server until you will have a connection. What if during offline another user changed the same document? We need somehow merge our changes in the right order. What if the user does not have rights to apply that changes? We need to revert these changes locally.

Logux has a built-in solution for these hard questions. It keeps actions in memory. During the edit conflict, Logux will revert changes, get new actions from another client, and apply all changes in the right order. If action can’t be applied, Logux will automatically revert it and show a warning to the user.


## Optimistic UI for Better Subjective Performance

Optimistic UI us a pattern to accept changes in UI immediately without loader and waiting server response. It increases the subjective performance of your application.

Production-ready Optimistic UI is similar to Offline First. What if the user does not have an Internet connection (you will find it only after sending the request)?

Because Logux is Offline First by design, Optimistic UI will work as expected in many edge cases of real non-stable network and servers.


## Live Updates to See the Latest Data

By default, Logux shows the latest data without the need to press the Reload button to see changes.

Logux uses WebSocket subscriptions instead of HTTP requests. Your application subscribes to some channel. The server sends the current state to the client during the subscription. If the server will receive action changing this data (with the same channel in `meta.channels`) the server will resend this new action to all subscribed clients.

The same works between browser tabs even in offline. They synchronize new actions, so all browser tabs have the same state.


## Network Reliability

There are many small problems in working with a real network.

* **Request order.** HTTP doesn’t guarantee that the server will receive a request in the same order they were sent. Often this problem appears in wrong results during keyword input. Logux doesn’t have this problem by design because every action has a time mark.
* **Missed response.** We often see infinite loader if the network went down for a second before AJAX response was received. In contrast, Logux will send data request again when the network will be back
* **Server error.** It is easy to forget server error processing. Logux will undo action during server error and use global UI to show an error message.


## Cross-Tab Communications in the Browser

Logux has built-in cross-tab communication. Calling `dispatch.crossTab()` or `dispatch.sync()` will dispatch action in all browser tabs.

Also in Logux, only one browser tab keeps WebSocket connection. All other tabs reuse the same connection. It guarantees the same state in all tabs and saves server resources.


## Compatibility Between Different Client Versions

Sometimes your user may keep web app in without reloading for a week. It may create problems when you will change the API between client and server and deploy a new version. The old client will work with the new server.

In Logux every client has `subprotocol` version. Every action has a `meta.subprotocol` with the version of the client. The server may refuse old clients for connection (client will ask users to reload the page) or may use different code to process action from old API:

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
