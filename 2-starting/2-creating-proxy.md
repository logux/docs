# Creating Logux Proxy

In this guide we will create the basic server to the most simple case:

* You already have back-end HTTP server. It authenticate users
  and generate HTML pages.
* You use [Logux Redux] on the client side.

It is the best case for migrating big legacy project to Logux.
You can move only few operations to Logux and keep using AJAX or forms
for rest operations.

In you want a little better performance and like Node.js, you can try
to [move business logic] directly to Logux Server. Or you can keep
high-performance parts in Logux Server and send other to back-end HTTP server.

[move business logic]: ./1-creating-server.md
[Logux Redux]: ./3-creating-redux.md


## Creating the Project

First you need to [install Node.js] (version 10.0 or later).

Create a directory with a project. We will use `server-logux`, but you can
replace it to more relevant.

```sh
mkdir server-logux
cd server-logux
```

Create `package.json` with:

```json
{
  "name": "server-logux",
  "private": true,
  "main": "index.js"
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
    backend: 'http://localhost:3000/logux',
    root: __dirname
  })
)

server.listen()
```

Create `.env` with Logux password only for development environment.
Put this file to `.gitignore`.

Set your local back-end server URL and secret:

```
LOGUX_BACKEND=http://localhost:3000/
LOGUX_CONTROL_PASSWORD=secret
```

You can start proxy with:

```sh
node index.js
```

To stop the server press `Command`+`.` on Mac OS X and `Ctrl`+`C` on Linux
and Windows.

Logux proxy server is ready. It will send user’s authentication request,
Logux subscriptions and actions to `http://localhost:3000/logux`.
Your back-end can send actions to the client by sending HTTP request
to `http://localhost:31338`.

[install Node.js]: https://nodejs.org/en/download/package-manager/


## Back-end

Now we need prepare back-end to receive requests from Logux proxy server.

<details open><summary><b>Ruby on Rails server</b></summary>

[`logux_rails`] gem can add Back-end Protocol support and syntax sugar
to Ruby on Rails.

Go to your Ruby on Rails application folder:

```sh
cd ../project-rails
```

Add it to `Gemfile` and call `bundle`:

```ruby
gem 'logux_rails'
gem 'dotenv-rails', groups: [:development, :test]
```

Create `.env` with Logux password only for development environment.
Put this file to `.gitignore`.

```
LOGUX_CONTROL_PASSWORD=secret
LOGUX_URL=http://localhost:31338
```

Create file at `config/initializers/logux.rb`:

```ruby
Logux.configuration do |config|
  config.password = ENV['LOGUX_CONTROL_PASSWORD']
  config.logux_host = ENV['LOGUX_URL']

  config.auth_rule = lambda do |user_id, token|
    false
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
2. Implement protocol in your HTTP server.
3. You can create open source Logux library for you environment.
   Feel free to ask for help in [Logux support chat].

[Logux support chat]: https://gitter.im/logux/logux

</details>

[Logux Back-end Protocol]: ../backend-protocol/spec.md
[`logux_rails`]: https://github.com/logux/logux_rails

**[Next chapter →](./4-replacing-redux.md)**
