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

<details open><summary><b>React/Redux client</b></summary>

```js
const Counter = ({ counter, onIncrease }) => (<>
  <div>{ counter }</div>
  <button onClick={ onIncrease }> // This button will increase the counter on all clients
</>)

const dispatchToProps = dispatch => ({
  onIncrease () {
    // `dispatch.sync()` instead of Redux `dispatch()` will send action to the server
    // `channels` will ask Logux to resend action to all clients subscribed to this channel
    dispatch.sync({ type: 'INC' }, { channels: ['counter'] })
  }
})

// `subscribe()` will subscribe this client to selected channel, when component will mount
export default subscribe('counter')(connect(stateToProps, dispatchToProps)(Counter))
```

</details>

<details><summary><b>JS client</b></summary>

```js
log.on('add', (action, meta) => {
  if (action.type === 'INC') {
    counter.innerHTML = parseInt(counter.innerHTML) + 1
  }
})

increase.addEventListener('click', () => {
  log.add({ type: 'INC' }, { channels: ['counter'], sync: true })
})

log.add({ type: 'logux/subscribe' channel: 'counter' }, { sync: true })
```

</details>
