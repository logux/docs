# Creating Logux Proxy

In this guide we will create the basic server to the most simple case:

* You already have back-end HTTP server. It authenticate users
  and generate HTML pages.
* You use [Logux Redux] or [Logux Client] on the client side.

It is the best case for migrating big legacy project to Logux.
You can move only few operations to Logux and keep using AJAX or forms
for rest operations.

[Logux Client]: ./5-creating-client.md
[Logux Redux]: ./3-creating-redux.md


## Create the Project

First you need to [install Node.js] (version 10.0 or later).

Create a directory with a project. We will use `project-logux`, but you can
replace it to more relevant to your project.

```sh
mkdir project-logux
cd project-logux
```

Create `package.json` with:

```json
{
  "name": "project-logux",
  "private": true,
  "main": "index.js"
}
```

<details open><summary><b>npm</b></summary>

```sh
npm i @logux/server
```

</details>
<details><summary><b>yarn</b></summary>

```sh
yarn add @logux/server
```

</details>

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

Read about HTTP API in **[Logux Back-end Protocol]**.

[Logux Back-end Protocol]: ../backend-protocol/spec.md
[install Node.js]: https://nodejs.org/en/download/package-manager/


## Ruby on Rails

[`logux_rails`] gem can add Back-end Protocol support and syntax sugar
to Ruby on Rails.

Go to your Ruby on Rails application folder:

```sh
cd ../project-rails
```

Add it to `Gemfile` and call `bundle`:

```ruby
gem 'logux_rails'
```

Create file at `config/initializers/logux.rb`:

```ruby
Logux.configuration do |config|
  config.logux_host = 'http://localhost:31338'
end
```

Add Logux to `config/routes.rb`:

```diff
  Amplifr::Application.routes.draw do
+   mount Logux::Engine, at: '/'
```

[`logux_rails`]: https://github.com/logux/logux_rails

**[Next chapter →](./3-creating-redux.md)**
