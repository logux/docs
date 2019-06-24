# Creating Logux Proxy

In this guide we will create the Logux proxy between WebSocket and your
back-end server.

* You already have back-end HTTP server. It authenticates users
  and generates HTML pages. You want to continue using this HTTP server
  to process Logux actions.
* You use [Logux Redux] on the client side.

In you like Node.js and want the best performance, you can try
to [move business logic] directly to Logux Server. Or you can keep
high-performance parts in Logux Server and send other to back-end HTTP server.

[move business logic]: ./1-creating-server.md
[Logux Redux]: ./3-creating-redux.md


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
  "main": "index.js",
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
    subprotocol: '0.1.0',
    supports: '^0.1.0',
    root: __dirname
  })
)

server.listen()
```

Create `.env` file. Put this file to `.gitignore`.
Set your local back-end server URL and secret:

```ini
LOGUX_BACKEND=http://localhost:3000/
LOGUX_CONTROL_PASSWORD=secret
```

The proxy is ready. You can start it with:

```sh
npm start
```

To stop the server press `Command`+`.` on Mac OS X and `Ctrl`+`C` on Linux
and Windows.

The proxy will send user’s authentication request, Logux subscriptions
and actions to `http://localhost:3000/logux`. Your back-end can send actions
to the client by sending HTTP request to `http://localhost:31338`.

[Install Node.js]: https://nodejs.org/en/download/package-manager/


## Back-end Server

Now we need prepare back-end to receive requests from Logux proxy server.

<details><summary><b>Ruby on Rails server</b></summary>

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
LOGUX_CONTROL_PASSWORD=secret
LOGUX_URL=http://localhost:31338
```

Create `config/initializers/logux.rb` file:

```ruby
Logux.configuration do |config|
  config.password = ENV['LOGUX_CONTROL_PASSWORD']
  config.logux_host = ENV['LOGUX_URL']

  config.auth_rule = lambda do |user_id, token|
    false # Deny all users until we will have a proper authentication
  end
end
```

Add Logux to `config/routes.rb`:

```diff
  Amplifr::Application.routes.draw do
+   mount Logux::Engine, at: '/'
```

</details>
<details><summary><b>Any other HTTP server</b></summary>

1. Read about **[Logux Back-end Protocol]**.
2. Implement protocol on your HTTP server.
3. Feel free to ask for help in [Logux support chat].
4. You will need proper storage to keep Logux proxy URL and secret.
   We recommend to use `.env` with library to support this file
   in your environment.

   ```ini
   LOGUX_CONTROL_PASSWORD=secret
   LOGUX_URL=http://localhost:31338
   ```

[Logux support chat]: https://gitter.im/logux/logux

</details>

[Logux Back-end Protocol]: ../backend-protocol/spec.md
[`logux_rails`]: https://github.com/logux/logux_rails

**[Next chapter →](./4-replacing-redux.md)**
