# node-syncrepl

Calling asynchronous functions from the node REPL can be annoying at best. This
module is an attempt at adding some sugar to make this a lot easier.

## Installation

There are versions available for both Node v0.2 and v0.4.

    npm install syncrepl

## Usage

To run from the command line:

    node-syncrepl

You can also use syncrepl just like you use the built-in `repl` module for node.
Just replace `require('repl')` with `require('syncrepl')`.

## Showcase example

First, an example that makes use of all of the features:

    > require('child_process').exec('uptime', sync.stdout.stderr)
    '12:16  up 9 days, 10:42, 17 users, load averages: 1.22 1.58 1.61\n'
    > stdout
    '12:16  up 9 days, 10:42, 17 users, load averages: 1.22 1.58 1.61\n'
    > stderr
    ''

## The `sync` helper

The syncrepl module acts exactly like the standard node REPL until you make use
of the special `sync` helper. The sync helper will return a callback, and the
REPL will wait until this callback fires.

It is important to note that the sync helper assumes that the first argument to
the callback is an error. If an error is present, it will show the stack trace
instead of capturing it to any variables.

The first way to use the sync helper is to call it like a function. If you
don't pass any arguments it will display the first non-error argument and store it to `_`

    > setTimeout(function(callback) { callback(null, 42) }, 1000, sync())
    42
    > _
    42

If an error occurs:

    > setTimeout(function(callback) { callback(new Error('err')) }, 1000, sync())
    Error: err
        at Object.<anonymous> ([object Context]:1:43)
        at Object._onTimeout (timers.js:152:16)
        at Timer.callback (timers.js:62:39)

You can pass string arguments into the sync function and it will assign the non-error arguments to those variables in the REPL.

    > setTimeout(function(callback) { callback(null, 1, 2, 3) }, 1000, sync('a', 'b', 'c'))
    1
    > [a, b, c]
    [ 1, 2, 3 ]

To make this easier to type quickly in the REPL, magic attributes are assigned to the sync helper. These magic attributes also support chaining. `sync('a', 'b', 'c')` is equivalent to  `sync.a.b.c`.

    > setTimeout(function(callback) { callback(null, 1, 2, 3) }, 1000, sync.a.b.c)
    1
    > [a, b, c]
    [ 1, 2, 3 ]

## More examples

An example using Mikeal's [request](https://github.com/mikeal/request) module:

    > require('request').get({uri: 'http://nodejs.org/'}, sync.res.body)
    [Request Object]
    > res.statusCode
    200
    > body.length
    8230
