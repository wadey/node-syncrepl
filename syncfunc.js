function attachGetters(sync, target, vars, possibleVars) {
  for (var k in vars) {
    if (Object.hasOwnProperty.call(vars, k)) {
      (function(k) {
        Object.defineProperty(target, k, {get: function() { return sync(k) }})
      })(k);
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
    , match = /\bsync\.([\w.]+)\b/g.exec(cmd);
  if (match) {
    possibleVars = match[1].split('.')
  }

  var sync = function(syncVar) {
    if (syncVar) {
      stack.push(syncVar)
    }
    var extraVars = Array.prototype.slice.call(arguments, 1)
    sync.__called = true
    var asyncFunc = function(e, ret) {
      if (e) return callback(e)

      var args = arguments;
      if (stack.length > 0) {
        stack.forEach(function(syncVar, i) {
          if (syncVar) {
            context[syncVar] = args[i+1];
          }
        })
      }
      if (extraVars.length > 0) {
        extraVars.forEach(function(extraVar, i) {
          if (extraVar) {
            context[extraVar] = args[i+1+stack.length]
          }
        })
      }

      callback.apply(this, arguments)
    }

    attachGetters(sync, asyncFunc, context, possibleVars)

    return asyncFunc
  }

  attachGetters(sync, sync, context, possibleVars)

  return sync
}

module.exports.called = function(sync) {
  return sync.__called
}
