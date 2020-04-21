# Writing Tests for Logux

## Server

<details open><summary>Node.js</summary>

To make tests easy, we suggest to split server logic into modules. Each module will be a function, which will receive server instance.

```js
// modules/posts/index.js

module.exports = server => {
  server.type('posts/add', {
    …
  })

  server.channel('posts', { … })
}
```

In the server you will load modules and apply to the server:

```js
// index.js

const { Server } = require('@logux/server')

const postsModule = require('./modules/posts')

let server = new Server(…)

postsModule(server)

server.listen()
```

You can use any test framework, but we will show examples with [Jest](https://jestjs.io/).

```sh
npm i --dev jest
```

Now we can write unit test for server’s module:

```js
// modules/posts/index.test.js

const { TestServer } = require('@logux/server')

const postsModule = require('.')

let destroyable
afterEach(() => {
  if (destroyable) destroyable.destroy()
})

function createServer () {
  destroyable = new TestServer()
  postsModule(destroyable)
  return destroyable
}

it('creates and loads posts', () => {
  const server = createServer()
  const client1 = await server.connect('1')

  const post = { … }
  // Check that action will not return error
  await client1.process({ type: 'posts/add', post })
  // Check that other client will load new user
  expect(await client2.subscribe('posts')).toEqual([
    { type: 'posts/add', post }
  ])

  const action = { type: 'posts/rename', … }
  // Check that server will re-send action to subscribed clients
  expect(await client2.collect(async () => {
    await client1.process(action)
  })).toEqual([
    action
  ])
})
```

There are special API to test authenticator:

```js
// modules/auth/index.test.js

const { TestServer, TestClient } = require('@logux/server')

const authModule = require('.')

let destroyable
afterEach(() => {
  if (destroyable) destroyable.destroy()
})

function createServer () {
  destroyable = new TestServer()
  authModule(destroyable)
  return destroyable
}

it('checks token', () => {
  const server = createServer()
  await server.connect('1', { token: 'good' })
  expect(() => {
    await server.connect('2', { token: 'bad' })
  }).rejects.toEqual({
    error: 'Wrong credentials'
  })
})
```

Now you can run tests by:

```sh
npx jest
```

See [`TestServer`](https://logux.io/node-api/#testserver) and [`TestClient`](https://logux.io/node-api/#testclient) APIs for available methods.

You can enable server log during the test debugging.

```js
it.only('creates and loads posts', () => {
  const server = createServer({ reporter: 'human })
```

</details>
<details><summary>Ruby on Rails server</summary>

*Under construction*

</details>
