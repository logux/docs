# Logux

<img align="right" width="95" height="95" title="Logux logo"
     src="https://cdn.rawgit.com/logux/logux/master/logo.svg">

Logux is a new way to connect client (webapp, mobile app) and server.
Instead of sending HTTP requests (e.g., AJAX, REST, and GraphQL)
it synchronizes log of operations between client, server, and other clients
through WebSocket.

* Built-in **optimistic UI** will improve UI performance.
* Built-in **live updates** allow to build collaborative tools
  (like Google Docs).
* Built-in **offline-first** will improve UX on unstable connection.
  It is useful from next billion users to New York subway.
* Compatible with modern stack: **Redux** API,
  works with **any back-end language** and **any database**.

<a href="https://evilmartians.com/?utm_source=logux">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## Client Example

<details open><summary><b>React/Redux client</b></summary>

Using [`@logux/redux`](https://github.com/logux/redux/):

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

<details><summary><b>Pure JS client</b></summary>

Using [`@logux/client`](https://github.com/logux/client/):

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


## Server Example

<details open><summary><b>Node.js server</b></summary>

Using [`@logux/server`](https://github.com/logux/server/):

```js
app.channel('counter', {
  access () {
    // Access control is mondatory. API was designed to make harder writting dangerous code.
    return true
  },
  async init (ctx) {
    // Load initial state when client subscribing to the channel
    let value = await db.get('counter')
    app.log.add({ type: 'INC', value }, { clients: [ctx.clientId] })
  }
})

app.type('INC', {
  access () {
    return true
  },
  async process () {
    // Don’t forget to keep action atomic
    await db.set('counter', 'value += 2')
  }
})
```

</details>

<details><summary><b>Ruby on Rails server</b></summary>

Using [`logux_rails`](https://github.com/logux/logux_rails/):

```ruby
# app/logux/channels/counter.rb
module Channels
  class Counter < Channels::Base
    def initial_data
      [{ type: 'INC', value: db.counter }]
    end
  end
end
```

```ruby
# app/logux/actions/inc.rb
module Actions
  class Inc < Actions::Base
    def inc
      # Don’t forget to keep action atomic
      db.update_counter! 'value += 1'
    end
  end
end
```

```ruby
# app/logux/policies/channels/counter.rb
module Policies
  module Channels
    class Counter < Policies::Base
      # Access control is mondatory. API was designed to make harder writting dangerous code.
      def subscribe?
        true
      end
    end
  end
end
```

```ruby
# app/logux/policies/actions/inc.rb
module Policies
  module Actions
    class inc < Policies::Base
      def inc?
        true
      end
    end
  end
end
```

</details>

<details><summary><b>Any other HTTP server</b></summary>

You can use any HTTP server with Logux WebSocket proxy server.
Here PHP pseudocode:

```php
<?php
$req = json_decode(file_get_contents('php://input'), TRUE);
if ($req['password'] == LOGUX_PASSWORD) {
  foreach ($req['commands'] as $command) {
    if ($command[0] == 'action') {
      $action = $command[1]
      $meta = $command[2]

      if ($action['type'] == 'logux/subscribe') {
        echo('[["approved"],')
        $value = $db->getCounter()
        send_json_http_post(LOGUX_HOST, array(
          'password' => LOGUX_PASSWORD,
          'version' => 1,
          'commands' => array(
            array(
              'action',
              array('type' => 'INC', 'value' => $value),
              array('clients' => get_client_id($meta['id']))
            )
          )
        ))
        echo('["processed"]]')

      } elseif ($action['type'] == 'inc') {
        $db->updateCounter('value += 1')
        echo('[["approved"],["processed"]]')
      }

    }
  }
}
```

</details>
