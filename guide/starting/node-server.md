# Starting Logux Server Project

In this guide, we will create the Logux server for the simplest case:

* You have simple HTTP server to serve static HTML, CSS, and JS files.
* You use [Logux Redux] on the client side.
* Logux server do most of back-end business logic.
* You write Logux server on Node.js.

If you want to use another language for the server read [Logux Proxy] page.

[Logux Redux]: ./new-client.md
[Logux Proxy]: ./proxy-server.md


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

server.auth(({ userId, token }) => {
  // Allow only local users until we will have a proper authentication
  return process.env.NODE_ENV === 'development'
})

server.listen()
```

The simple Logux server is ready. You can start it with:

```sh
npm start
```

To stop the server press <kbd>Command</kbd>+<kbd>.</kbd> on Mac OS X and <kbd>Ctrl</kbd>+<kbd>C</kbd> on Linux and Windows.

[Install Node.js]: https://nodejs.org/en/download/package-manager/

## Database

Logux Server supports any database. We will use PostgreSQL only as an example.

[Install PostgreSQL](https://www.postgresql.org/download/).

Install PostgreSQL tools for Node.js:

```sh
npm i dotenv pg-promise node-pg-migrate pg
```

Start database depends on your environment.

Create database. Use [this advice] if you will have `role does not exist` error.

```sh
createdb server-logux
```

Create `.env` file with URL to your database. Put this file to `.gitignore`.

```ini
DATABASE_URL=postgres://localhost/server-logux
```

Create new migration for database schema:

```sh
npx node-pg-migrate create create_users
```

Open generated file from `migrations/` and create `users` table:

```js
exports.up = pgm => {
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar', notNull: true, unique: true },
    password: { type: 'varchar', notNull: true }
  })
}

exports.down = pgm => {
  pgm.dropTable('users')
}
```

Run migration:

```sh
npx node-pg-migrate up
```

Connect to the database in `index.js`:

```diff
  const { Server } = require('@logux/server')
+ const pg = require('pg-promise')

  const server = new Server(
    Server.loadOptions(process, {
      subprotocol: '1.0.0',
      supports: '1.x',
      root: __dirname
    })
  )

+ let db = pg()(process.env.DATABASE_URL)
```

[this advice]: https://stackoverflow.com/questions/16973018/createuser-could-not-connect-to-database-postgres-fatal-role-tom-does-not-e

Look at [Node.js API](https://logux.io/node-api/#server) to see what you can do next.

[Next chapter](./new-client.md)
