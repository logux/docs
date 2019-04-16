# Choosing Right Logux Architecture for Your Case

## Client

### Logux Redux

**When you should choose it:**

* You want to add WebSocket to Redux application.
* You are creating rich application on top of React or Angular.

**Benefits:**

* You should not worry of having different action order on different nodes.

*Under construction*


### Logux Client

**When you should choose it:**

* When you don’t care about the order of action. All your operations should
  have commutative.

**Benefits:**

* Better performance.

*Under construction*


## Server

### Proxy Server

**When you should choose it:**

* You want to use legacy back-end.
* You do not want to use Node.js.

**Benefits:**

* Works with back-end on any language.
* You can always improve performance in critical parts by moving
  to [Mixed Servers](#mixed-server).

*Under construction*


### Node.js Server

**When you should choose it:**

* You are starting new back-end and like Node.js.

**Benefits:**

* The best performance.
* You can still keep some logic in servers written on different languages.

*Under construction*


### Mixed Server

**When you should choose it:**

* You are starting new back-end and like Node.js.


*Under construction*


## Peer-to-peer

**When you should choose it:**

* When you do not fit classic client-server architecture.

*Under construction*
