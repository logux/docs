# Using Logux Concepts in Practice

Logux architecture was designed to be peer-to-peer and flexible.
You can build different architecture on top of core concepts depends
on your needs. But in this docs we will show how to use
[Logux core concepts](./core.md) for the most popular standard case
with web clients and several servers.


## Connecting

Logux client keeps only one Web Socket connection even if user open
an application in multiple browser’s tabs. To do this, Logux clients
detects other browser’s tab with the same web site
and **tabs elect one leader**. Only leader will keep connection.
If user will close leader tab, other tabs will re-elect leader.

*You can try this election system in [online demo].
Just open it in several tabs.*

[online demo]: https://logux.github.io/client/

When Logux client will open Web Socket connection, it sends user ID
and user token to the server.

Logux server is written in JS. There are two ways to use it:

1. The first way is to use Logux server as framework and write application
  on top of **Logux JS API**. In this mode you can use any database
  to store data.

    ```js
    server.auth(async (userId, token) => {
      let user = findUser(userId)
      return user.token === token
    })
    ```
2. The second way is to use Logux server as a proxy. In this mode Logux will
   convert all Web Sockets events to HTTP request to your web server.
   It is the perfect case if you want keep your back-end on PHP, Ruby on Rails
   or any other non-JS environment.

When server will authenticate user, server will calculate **time different**
between client and server. It is useful when client has wrong time settings.


## Subscriptions
