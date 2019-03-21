# Logux

<img align="right" width="95" height="95" title="Logux logo"
     src="https://cdn.rawgit.com/logux/logux/master/logo.svg">

Logux is a new way to connect client (webapp, mobile app) and server.
Instead of sending HTTP requests (e.g. AJAX, REST, and GraphQL)
it synchronizes log of operations between client, server, and other clients
through WebSocket.

* Built-in **optimistic UI** will improve UI performance.
* Built-in **live updates** allow to build collaborative tools
  (like Google Docs).
* Built-in **offline-first** will improve UX on unstable connection.
  It is useful from next billion users to New York subway.
* Compatible with modern stack: **Redux** API,
  works with **any back-end language** and **any database**.

## Example

React/Redux app:

```js
import subscribe from '@logux/redux/subscribe'

const Counter = ({ counter, onIncrease }) => (<>
  <div>{ counter }</div>
  <button onClick={ onIncrease }>
</>)

const dispatchToProps = dispatch => ({
  onIncrease () {
    // `dispatch.sync` instead of Redux `dispatch` will send action to the server
    // `channels` will ask Logux to resend action to all clients subscribed to this channel
    dispatch.sync({ action: 'INC' }, { channels: ['counter'] })
  }
})

// subscribe() will subscribe this client to selected channel, when component will mount
export default subscribe('counter')(connect(stateToProps, dispatchToProps)(Counter))
```
