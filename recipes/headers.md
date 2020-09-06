# Logux Headers

Logux’s headers are an API to set session data like selected language.

The client can define an object with any keys inside. We recommend doing it before connecting to the server.

<details open><summary>Redux client</summary>

```js
store.client.node.setLocalHeaders({ locale: 'fr-FR' })
store.client.start()
```

</details>
<details><summary>Vuex client</summary>

```js
store.client.node.setLocalHeaders({ locale: 'fr-FR' })
store.client.start()
```

</details>
<details><summary>Pure JS client</summary>

```js
client.node.setLocalHeaders({ locale: 'fr-FR' })
client.start()
```

</details>

During the session, you can change headers by calling this method again. If the next headers miss some keys from the previous call, these keys will be removed.

Note, that you should manually synchronize headers changes between browser tabs.

On the server, you can get the client’s headers during the authentication, action, or channel processing.

<details open><summary>Node.js</summary>

```js
  process (ctx, action, meta) {
    ctx.sendBack({
      type: 'notification',
      message: I18N[ctx.locale || 'en-US'].success
    })
  }
```

</details>

<details><summary>Django</summary>

```python
class AddLikesAction(ActionCommand):

    action_type = 'likes/add'

    def access(self, action: Action, meta: Meta) -> bool:
        if 'error' in self.headers:
            raise LoguxProxyException(self.headers['error'])
        return action['payload']['userId'] == meta.user_id
…
```

</details>
