# Logux

<img align="right" width="95" height="148" title="Logux logotype"
     src="https://logux.org/branding/logotype.svg">

Logux is a flexible JS framework to make [local-first](https://www.inkandswitch.com/local-first/) **sync engine** with **real-time updates**, **offline-first**, **CRDT**, an **optimistic UI**.

- Instead of other local-first solutions, it is **not a database, but a framework** to build sync engines with specific needs of your project.
- **No vendor lock-in**. It works with any database and in any cloud.
- Great **TypeScript** support with end-to-end type checking from client to server.
- We thought about many production-ready problems like **monitoring**, **scaling**, **outdated clients**, authentication, rich test API.
- Optional **end-to-end encryption**.
- Just extra [**7 KB**](https://github.com/logux/client/blob/main/package.json#L141-L148) in client-side JS bundle.

Ask your questions at [community](https://github.com/orgs/logux/discussions) or [commercial support](mailto:logux@evilmartians.com).

[Next chapter](./guide/starting/node-server.md)

<a href="https://evilmartians.com/?utm_source=logux-docs">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## Client Example

Using [Logux Client](https://github.com/logux/client/):

<details open><summary>React client</summary>

```ts
import { syncMapTemplate } from '@logux/client'

export type TaskValue = {
  finished: boolean
  text: string
  authorId: string
}

export const Task = syncMapTemplate<TaskValue>('tasks')
```

```ts
export const ToDo = ({ userId }) => {
  const tasks = useFilter(Task, { authorId: userId })
  if (tasks.isLoading) {
    return <Loader />
  } else {
    return <ul>
      {tasks.map(task => <li>{task.text}</li>)}
    </ul>
  }
}
```

```ts
export const TaskPage = ({ id }) => {
  const client = useClient()
  const task = useSync(Task, id)
  if (task.isLoading) {
    return <Loader />
  } else {
    return <form>
      <input type="checkbox" checked={task.finished} onChange={e => {
        changeSyncMapById(client, Task, id, { finished: e.target.checked })
      }}>
      <input type="text" value={task.text} onChange={e => {
        changeSyncMapById(client, Task, id, { text: e.target.value })
      }} />
    </form>
  }
}
```

</details>
<details><summary>Vue client</summary>

Using [Logux Vuex](https://github.com/logux/vuex/):

```html
<template>
  <h1 v-if="isSubscribing">Loading</h1>
  <div v-else>
    <h1>{{ counter }}</h1>
    <button @click="increment"></button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore, useSubscription } from '@logux/vuex'

export default {
  setup () {
    // Inject store into the component
    let store = useStore()
    // Retrieve counter state from store
    let counter = computed(() => store.state.counter)
    // Load current counter from server and subscribe to counter changes
    let isSubscribing = useSubscription(['counter'])

    function increment () {
      // Send action to the server and all tabs in this browser
      store.commit.sync({ type: 'INC' })
    }

    return {
      counter,
      increment,
      isSubscribing
    }
  }
}
</script>
```

</details>
<details><summary>Pure JS client</summary>

You can use [Logux Client](https://github.com/logux/client/) API with any framework:

```js
client.type('INC', (action, meta) => {
  counter.innerHTML = parseInt(counter.innerHTML) + 1
})

increase.addEventListener('click', () => {
  client.sync({ type: 'INC' })
})

loading.classList.add('is-show')
await client.sync({ type: 'logux/subscribe' channel: 'counter' })
loading.classList.remove('is-show')
```

</details>


## Server Example

Using [Logux Server](https://github.com/logux/server/):

```js
addSyncMap<TaskValue>(server, 'tasks', {
  async access (ctx, id) {
    const task = await Task.find(id)
    return ctx.userId === task.authorId
  },
  async load (ctx, id, since) {
    const task = await Task.find(id)
    if (!task) throw new LoguxNotFoundError()
    return {
      id: task.id,
      text: ChangedAt(task.text, task.textChanged),
      finished: ChangedAt(task.finished, task.finishedChanged),
    }
  },
  async create (ctx, id, fields, time) {
    await Task.create({
      id,
      authorId: ctx.userId,
      text: fields.text,
      textChanged: time,
      finished: fields.finished,
      finishedChanged: time
    })
  },
  async change (ctx, id, fields, time) {
    const task = await Task.find(id)
    if ('text' in fields) {
      if (task.textChanged < time) {
        await task.update({
          text: fields.text,
          textChanged: time
        })
      }
    }
    if ('finished' in fields) {
      if (task.finishedChanged < time) {
        await task.update({
          finished: fields.finished,
          finishedChanged: time
        })
      }
    }
  }
  async delete (ctx, id) {
    await Task.delete(id)
  }
})

addSyncMapFilter<TaskValue>(server, 'tasks', {
  access (ctx, filter) {
    return true
  },
  initial (ctx, filter, since) {
    let tasks = await Tasks.where({ ...filter, authorId: ctx.userId })
    return tasks.map(task => ({
      id: task.id,
      text: ChangedAt(task.text, task.textChanged),
      finished: ChangedAt(task.finished, task.finishedChanged),
    }))
  },
  actions (filterCtx, filter) {
    return (actionCtx, action, meta) => {
      return actionCtx.userId === filterCtx.userId
    }
  }
})
```

