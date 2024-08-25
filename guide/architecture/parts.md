# Logux Parts

We split Logux into many projects.

* **[Logux Docs]:** guides and references about all other Logux parts. You are reading it right now.
* **[Logux Core]:** low-level core component to build Logux node on JavaScript. Most of the users will use some high-level wrapper around this core (like Logux Server or Logux Redux). You may use it directly to load components for app’s tests like `TestTime` or `TestPair`. Also, you may use it directly to build some non-standard architecture.
* **[Logux Client]:** components to build Logux web client. It adds to the Core high-level APIs, subprotocols, subscriptions, and cross-tab communication. It contains few UI components, like synchronization status widget, different favicon for online/offline, and prompt to close browser tab with unsaved changes.
* **[Logux Vue Devtools]:** Vue devtools plugin for debugging Logux applications. It adds a timeline with all Logux events and Logux Client to the component inspector.
* **[Logux Server]:** high-level components to build your Logux Server on JavaScript.
* **Logux Server Pro:** closed source additional features for Logux Server for monitoring and scaling. Write to [`logux@evilmartians.com`] for access.

[`logux@evilmartians.com`]: mailto:logux@evilmartians.com
[Logux Vue Devtools]: https://github.com/logux/vue-devtools
[Logux Client]: https://github.com/logux/client
[Logux Server]: https://github.com/logux/server
[Logux Core]: https://github.com/logux/core
[Logux Docs]: https://github.com/logux/docs

[Next chapter](../concepts/node.md)
