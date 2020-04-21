# Creating Logux Proxy

In this guide, we will create the Logux proxy between WebSocket and your back-end server.

* You already have back-end HTTP server. It authenticates users and generates HTML pages. You want to continue using this HTTP server to process Logux actions.
* You use [Logux Redux] on the client side.

If you like Node.js and want the best performance, you can try to [move business logic] directly to Logux Server. Or you can keep high-performance parts in Logux Server and send others to the back-end HTTP server.

[move business logic]: ./node-server.md
[Logux Redux]: ./replace-redux.md


## Creating the Project

[Install Node.js] (version 10.0 or later).

Create a directory for a project. We will use `server-logux` name.

```sh
mkdir server-logux
cd server-logux
```

Create `package.json` with:

```json
{
  "name": "server-logux",
  "private": true,
  "scripts": {
    "start": "node index.js"
  }
}
```

Install Logux Server:

```sh
npm i @logux/server
```

Create `index.js` with:

```js
const { Server } = require('@logux/server')

const server = new Server(
  Server.loadOptions(process, {
    subprotocol: '1.0.0',
    supports: '1.x',
    root: __dirname
  })
)

server.listen()
```

Create `.env` file. Put this file to `.gitignore`. Set your local back-end server URL and secret:

```ini
LOGUX_BACKEND=http://localhost:3000/
LOGUX_CONTROL_SECRET=secret
```

The proxy is ready. You can start it with:

```sh
npm start
```

To stop the server press <kbd>Command</kbd>+<kbd>.</kbd> on Mac OS X and <kbd>Ctrl</kbd>+<kbd>C</kbd> on Linux and Windows.

The proxy will send the user’s authentication request, Logux subscriptions, and actions to `http://localhost:3000/logux`. Your back-end can send actions to the client by sending an HTTP request to `http://localhost:31338`.

[Install Node.js]: https://nodejs.org/en/download/package-manager/


## Back-end Server

Now we need to prepare back-end to receive requests from Logux proxy server.

<details><summary>Django server</summary>

[`logux-django`] package adds Back-end Protocol support to Django.

Install from PyPI

```shell script
pip install logux-django
```

Install dev version from the master
```shell script
pip install -e git://github.com/logux/django.git#egg=logux_django
```

Add `path(r'logux/', include('logux.urls')),` into your `urls.py`

Sets Logux settings in your `settings.py`:
```python
# Logux settings: https://logux.io/guide/starting/proxy-server/
LOGUX_CONTROL_SECRET = "secret"
LOGUX_URL = "http://localhost:31338"
LOGUX_AUTH_FUNC = your_auth_function #  your_auth_function(user_id, token: str) -> bool
```

For `action` handling add `logux_actions.py` file in your app, add `ActionCommand` inheritors and implement all his
abstract methods.

Actions classes requirements:

* Set `action_type: str`
* Implement all `ActionCommand` abstracts methods
* Implement `resend` and `process` methods if you need (optional)
* import `logux` dispatcher: `from logux.dispatchers import logux`
* Register all your action handlers: `logux.actions.register(YourAction)`

For example – User rename action handler:
```python
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

For `subsription` handling add `logux_subsriptions.py` file in your app, and `ChannelCommand` inheritors
and implement all his abstract methods.

Subscription classes requirements:

* Set `channel_pattern: str` – this is a regexp like Django's url's patters in `urls.py`
* Implement all `ChannelCommand` abstracts methods
* import `logux` dispatcher: `from logux.dispatchers import logux`
* Register all your subscription handlers: `logux.channels.register(YourChannelCommand)`

For example:
```python
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

Utils:

`logux_add(action: Action, raw_meta: Optional[Dict] = None) -> None` is low level API function to send any actions
and meta into Logux server.

If `raw_meta` is `None` just empty Dict will be passed to Logux server.

Keep in mind, in the current version `logux_add` is sync.

</details>

<details><summary>Ruby on Rails server</summary>

[`logux_rails`] gem adds Back-end Protocol support to Ruby on Rails.

Go to your Ruby on Rails application folder:

```sh
cd ../server-rails
```

Add gems to `Gemfile` and call `bundle`:

```ruby
gem 'logux_rails'
gem 'dotenv-rails', groups: [:development, :test]
```

Create `.env` file. Put this file to `.gitignore`.

```ini
LOGUX_CONTROL_SECRET=secret
LOGUX_URL=http://localhost:31338/
```

Create `config/initializers/logux.rb` file:

```ruby
Logux.configuration do |config|
  config.password = ENV['LOGUX_CONTROL_SECRET']
  config.logux_host = ENV['LOGUX_URL']

  config.auth_rule = lambda do |user_id, token|
    # Allow only local users until we will have a proper authentication
    Rails.env.development?
  end
end
```

Add Logux to `config/routes.rb`:

```diff
  Amplifr::Application.routes.draw do
+   mount Logux::Engine, at: '/'
```

</details>
<details><summary>Any other HTTP server</summary>

1. Read about **[Logux Back-end Protocol]**.
2. Implement protocol on your HTTP server.
3. Feel free to ask for help in [Logux support chat].
4. You will need proper storage to keep Logux proxy URL and secret. We recommend using `.env` with the library to support this file in your environment.

   ```ini
   LOGUX_CONTROL_SECRET=secret
   LOGUX_URL=http://localhost:31338/
   ```

[Logux support chat]: https://gitter.im/logux/logux

</details>

[Logux Back-end Protocol]: ../../protocols/backend/spec.md
[`logux_rails`]: https://github.com/logux/logux_rails
[`logux-django`]: https://github.com/logux/django

[Next chapter](./replace-redux.md)
