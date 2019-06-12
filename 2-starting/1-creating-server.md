# Starting Logux Server Project

In this guide we will create the basic server to the most simple case:

* You have simple HTTP server to serve HTML and static CSS and JS files.
* You use [Logux Redux] or [Logux Client] on the client side.
* Logux server do most of back-end business logic.
* You write Logux server on Node.js.

If you want to use another language for server check [Logux Proxy] section.

[Logux Client]: ./5-creating-client.md
[Logux Redux]: ./3-creating-redux.md
[Logux Proxy]: ./2-creating-proxy.md


## Create the Project

First you need to [install Node.js].

Create a directory with a project. We will use `logux-server`, but you can
replace it to more relevant to your project.

```sh
mkdir logux-server
cd logux-server
```

Create `package.json` with:

```json
{
  "name": "logux-server",
  "private": true,
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
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

const server = new Server({
  subprotocol: '0.1.0',
  supports: '^0.1.0'
})

server.auth((userId, token) => {
  return false
})

server.listen()
```

The simple Logux server is ready. You can start it with:

<details open><summary><b>npm</b></summary>

```sh
npm start
```

</details>
<details><summary><b>yarn</b></summary>

```sh
yarn start
```

</details>

To close the server press `Command`+`.` on Mac OS X and `Ctrl`+`C` on Linux
and Windows.

[install Node.js]: https://nodejs.org/en/download/package-manager/


## Authentication

*Under construction*

**[Next chapter →](./3-creating-redux.md)**
