function attachGetters(sync, target, vars, possibleVars) {
  for (var k in vars) {
    if (Object.hasOwnProperty.call(vars, k)) {
      (function(k) {
        Object.defineProperty(target, k, {get: function() { return sync(k) }})
      })(k)
    }
  }
  if (possibleVars) {
    possibleVars.forEach(function(k) {
      if (!Object.hasOwnProperty.call(vars, k)) {
        Object.defineProperty(target, k, {get: function() { return sync(k) }})
      }
    })
  }
}

module.exports = function(cmd, context, callback) {
  var possibleVars
    , stack = []
    , match = /\bsync\.([\w.]+)\b/g.exec(cmd)

  if (match) {
    possibleVars = match[1].split('.')
  }

  var sync = function() {
    Array.prototype.slice.call(arguments, 0).forEach(function(syncVar) {
      stack.push(syncVar)
    })
    sync.__called = true
    var asyncFunc = function() {
      var args = arguments

      if (stack.length > 0) {
        stack.forEach(function(syncVar, i) {
          if (syncVar) {
            context[syncVar] = args[i+1]
          }
        })
      }

      callback.apply(this, arguments)
    }

    attachGetters(sync, asyncFunc, context, possibleVars)

    return asyncFunc
  }

  attachGetters(sync, sync, context, possibleVars)

  sync.inspect = function() {
    return "Usage: pass sync() or sync.<varName> as the callback param."
  }

  return sync
}

module.exports.called = function(sync) {
  return sync.__called
}
