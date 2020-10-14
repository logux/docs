# Starting Logux Redux Project

In this section, we will create a UI client for Logux with [Logux Redux]. Logux Redux can work with any UI framework. We will use React and Create React App only as an example.

[Logux Redux]: https://github.com/logux/redux


## Server

Before starting the client, you need to create Logux Server:

* [How to create the server] on Node.js.
* [How to create a proxy] to use HTTP server on any other language.

[How to create the server]: ./node-server.md
[How to create a proxy]: ./proxy-server.md


## Creating the Project

[Install Node.js].

You will need a bundler to compile npm packages into JS bundle. Webpack or Parcel is excellent for it. Also, we recommend using some library to bind Redux state with DOM. React or Preact is good options. However, for simple UI, you can write code to change DOM according to state changes.

To create a project with a single command, we will use Create React App.

```sh
npx create-react-app client-logux
cd client-logux
```

[Install Node.js]: https://nodejs.org/en/download/package-manager/


## Adding Redux

Install Redux:

```sh
npm i react-redux redux
```

Open `src/index.js`:

```diff
  import * as serviceWorker from './serviceWorker'
+ import { Provider } from 'react-redux'
+ import reducer from './reducers'
+ import { createStore } from 'redux'

+ const store = createStore(reducer)

- ReactDOM.render(<App />, document.getElementById('root'))
+ ReactDOM.render(
+   <Provider store={store}><App /></Provider>,
+   document.getElementById('root')
+ )
```

Create `src/reducers/index.js`

```js
import { combineReducers } from 'redux'

export default combineReducers({
  // TODO: Add reducers depends on application purposes
  test: (state = 0) => state // Remove me when you will have real reducer
})
```

Read [how to use Redux](http://redux.js.org).


## Adding Logux Redux

Install Logux Redux:

```sh
npm i @logux/core @logux/client @logux/redux
```

Edit `src/index.js`:

```diff
  import reducer from './reducers'
- import { createStore } from 'redux'
+ import { CrossTabClient } from '@logux/client'
+ import { createStoreCreator } from '@logux/redux'
+
+ const client = new CrossTabClient({
+   server: process.env.NODE_ENV === 'development'
+     ? 'ws://localhost:31337'
+     : 'wss://logux.example.com',
+   subprotocol: '1.0.0',
+   userId: 'anonymous',  // TODO: We will fill it in Authentication recipe
+   token: ''  // TODO: We will fill it in Authentication recipe
+ })
+
+ const createStore = createStoreCreator(client)

  const store = createStore(reducer)
+ store.client.start()
```


## Synchronization UI

To see the state of the synchronization process, we will add some helpers. They are all optional, but they are great for a start.

Install Logux Client:

```sh
npm i @logux/client
```

Change `src/index.js`:

```diff
- import { CrossTabClient } from '@logux/client'
+ import { CrossTabClient, badge, badgeEn, log } from '@logux/client'
+ import { badgeStyles } from '@logux/client/badge/styles'
  import { createStoreCreator } from '@logux/redux'
```

```diff
+ badge(store.client, { messages: badgeEn, styles: badgeStyles })
+ log(store.client)
+
  store.client.start()
```


## Check the Result

1. Open two terminals.
2. Start your Logux server in one terminal by `npm start` in server directory.
3. Start your client in the second terminal by `npm start` in client directory.

[Next chapter](../architecture/core.md)
