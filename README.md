# Logux

<img align="right" width="95" height="148" title="Logux logotype"
     src="https://logux.io/branding/logotype.svg">

Logux and WebSocket client/server framework to make:

* **Collaborative apps** when multiple users work with the same document. Logux has features inspired by **[CRDT]** to resolve edit conflicts between users. Real-time updates to prevent conflicts. Time travel to keep actions order the same on every client. A distributed timer to detect the latest changes.
* **Real-time** to see changes by another user immediately. Logux combines WebSocket with modern reactive client architecture. It synchronizes Redux actions between clients and servers, and **keeps the same order** of actions.
* **Optimistic UI** to improve UI performance by updating UI without waiting for an answer from the server. **Time travel** will revert changes later if the server refuses them.
* **Offline-first** for the next billion users or New York City Subway. Logux saves Redux actions to **IndexedDB** and has a lot of features to **merge changes** from different users.
* Compatible with modern stack: **Redux**, **Vuex** and pure JS API, works with **any back-end language** and **any database**.
* Just extra [**9 KB**] in client-side JS bundle.

Ask your questions at [community chat] or [commercial support].

[Next chapter](./guide/starting/choosing-architecture.md)

[commercial support]: mailto:logux@evilmartians.com
[community chat]: https://gitter.im/logux/logux
[**9 kB**]: https://github.com/logux/client/blob/master/package.json#L87-L90
[CRDT]: https://slides.com/ai/crdt

<a href="https://evilmartians.com/?utm_source=logux-docs">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## Client Example

<details open><summary>React/Redux client</summary>

Using [Logux Redux](https://github.com/logux/redux/):

```js
export const Counter = () => {
  const counter = useSelector(state => state.counter)
  const dispatch = useDispatch()
  // Load current counter from server and subscribe to counter changes
  const isSubscribing = useSubscription(['counter'])
  if (isSubscribing) {
    return <Loader></Loader>
  } else {
    // dispatch.sync() will send Redux action to all clients
    return <div>
      <h1>{ counter }</h1>
      <button onClick={ dispatch.sync({ type: 'INC' }) }>
    </div>
  }
}
```

</details>
<details><summary>Vue/Vuex client</summary>

Using [Logux Vuex](https://github.com/logux/vuex/):

```html
<template>
  <div v-if="isSubscribing">
    <h1>Loading</h1>
  </div>
  <div v-else>
    <h1>{{ counter }}</h1>
    <button @click="increment" />
  </div>
</template>

<script>
import { subscriptionMixin } from '@logux/vuex'

export default {
  name: 'Counter',
  mixins: [subscriptionMixin],
  computed: {
    // Retrieve counter state from store
    counter () {
      return this.$store.state.counter
    },
    // Load current counter from server and subscribe to counter changes
    channels () {
      return ['counter']
    }
  },
  methods: {
    increment () {
      // Send action to the server and all tabs in this browser
      this.$store.commit.sync({ type: 'INC' })
    }
  }
}
</script>
```

</details>
<details><summary>Pure JS client</summary>

You can use [Logux Client](https://github.com/logux/client/) API with any framework:

```js
log.on('add', (action, meta) => {
  if (action.type === 'INC') {
    counter.innerHTML = parseInt(counter.innerHTML) + 1
  }
})

increase.addEventListener('click', () => {
  log.add({ type: 'INC' }, { sync: true })
})

loading.classList.add('is-show')
log
  .add({ type: 'logux/subscribe' channel: 'counter' }, { sync: true })
  .then(meta => {
    const unbind = log.on('add', action => {
      if (action.type === 'logux/processed' && action.id === meta.id) {
        loading.classList.remove('is-show')
        unbind()
      }
    })
  })
```

</details>


## Server Example

<details open><summary>Node.js</summary>

Using [Logux Server](https://github.com/logux/server/):

```js
server.channel('counter', {
  access () {
    // Access control is mandatory
    return true
  },
  async load (ctx) {
    // Load initial state when client subscribing to the channel.
    // You can use any database.
    let value = await db.get('counter')
    ctx.sendBack({ type: 'INC', value })
  }
})

server.type('INC', {
  access () {
    return true
  },
  resend () {
    return { channel: 'counter' }
  },
  async process () {
    // Don’t forget to keep action atomic
    await db.set('counter', 'value += 1')
  }
})
```

</details>
<details><summary>Django</summary>

[`logux-django`](https://github.com/logux/django/) Back-end Logux Protocol support for Django

Actions:
```python
# logux_actions.py
from typing import Optional, Dict

from django.contrib.auth.models import User

from logux.core import ActionCommand, Meta, Action
from logux.dispatchers import logux


class RenameUserAction(ActionCommand):
    """ Action Handler for example from https://logux.io/protocols/backend/examples/ """

    action_type = 'user/rename'

        def resend(self, action: Action, meta: Optional[Meta]) -> Dict:
            return {'channels': [f'users/{action["user"]}']}

        def access(self, action: Action, meta: Meta) -> bool:
            return action['user'] == int(meta.user_id)

        def process(self, action: Action, meta: Optional[Meta]) -> None:
            user = User.objects.get(pk=action['user'])
            user.first_name = action['name']
            user.save()


logux.actions.register(RenameUserAction)

```

Subscriptions:
```python
# logux_subsriptions.py
from django.contrib.auth.models import User

from logux.core import ChannelCommand, Action, Meta
from logux.dispatchers import logux


class UserChannel(ChannelCommand):
    channel_pattern = r'^user/(?P<user_id>\w+)$'

    def access(self, action: Action, meta: Meta) -> bool:
        return self.params['user_id'] == meta.user_id

    def load(self, action: Action, meta: Meta) -> None:
        user = User.objects.get(pk=self.params['user_id'])
        self.send_back(
            {'type': 'user/name', 'user': 38, 'name': user.first_name}
        )


logux.channels.register(UserChannel)

```

</details>
<details><summary>Ruby on Rails</summary>

[`logux_rails`](https://github.com/logux/logux_rails/) gem with the Logux WebSocket proxy server.

```ruby
# app/logux/channels/counter.rb
module Channels
  class Counter < Logux::ChannelController
    def initial_data
      [{ type: 'INC', value: db.counter }]
    end
  end
end
```

```ruby
# app/logux/actions/inc.rb
module Actions
  class Inc < Logux::ActionController
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
      # Access control is mandatory. API was designed to make it harder to write dangerous code.
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
<details><summary>Any other HTTP server</summary>

You can use any HTTP server with Logux WebSocket proxy server. Here is a PHP-like pseudocode example:

```php
<?php
$req = json_decode(file_get_contents('php://input'), true);
if ($req['password'] == LOGUX_PASSWORD) {
  foreach ($req['commands'] as $command) {
    if ($command[0] == 'action') {
      $action = $command[1];
      $meta = $command[2];

      if ($action['type'] == 'logux/subscribe') {
        echo '[["approved"],';
        $value = $db->getCounter();
        send_json_http_post(LOGUX_HOST, [
          'password' => LOGUX_PASSWORD,
          'version' => 1,
          'commands' => [
            [
              'action',
              ['type' => 'INC', 'value' => $value],
              ['clients' => get_client_id($meta['id'])]
            ]
          ]
        ]);
        echo '["processed"]]';

      } elseif ($action['type'] == 'inc') {
        $db->updateCounter('value += 1');
        echo '[["approved"],["processed"]]';
      }
    }
  }
}
```

</details>


## Talks

### CRDT ideas in Logux

`Youtube:c7t_YBNHkeo` CRDT ideas in Logux talk


### Using Logux in Production

`Youtube:DvHNOplQ-tY` Using Logux in Production talk
