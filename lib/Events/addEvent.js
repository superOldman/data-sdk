export function addEvent(target, eventName, eventHandler, useCapture) {
  function fixEvent(event) {
    if (event) {
      event.preventDefault = fixEvent.preventDefault;
      event.stopPropagation = fixEvent.stopPropagation;
      event._getPath = fixEvent._getPath;
    }
    return event;
  }
  fixEvent._getPath = function () {
    var ev = this;
    return this.path || (this.composedPath && this.composedPath()) || ry(ev.target).getParents();
  };

  fixEvent.preventDefault = function () {
    this.returnValue = false;
  };
  fixEvent.stopPropagation = function () {
    this.cancelBubble = true;
  };

  var register_event = function (element, type, handler) {
    if (useCapture === undefined && type === 'click') {
      useCapture = true;
    }
    if (element && element.addEventListener) {
      element.addEventListener(
        type,
        function (e) {
          e._getPath = fixEvent._getPath;
          handler.call(this, e);
        },
        useCapture
      );
    } else {
      var ontype = 'on' + type;
      var old_handler = element[ontype];
      element[ontype] = makeHandler(element, handler, old_handler, type);
    }
  };

  function makeHandler(element, new_handler, old_handlers, type) {
    var handler = function (event) {
      event = event || fixEvent(window.event);
      if (!event) {
        return undefined;
      }
      event.target = event.srcElement;

      var ret = true;
      var old_result, new_result;
      if (typeof old_handlers === 'function') {
        old_result = old_handlers(event);
      }
      new_result = new_handler.call(element, event);
      if (type !== 'beforeunload') {
        if (false === old_result || false === new_result) {
          ret = false;
        }
        return ret;
      }
    };
    return handler;
  }

  register_event.apply(null, arguments);
}

export function addHashEvent(callback) {
  var hashEvent = 'pushState' in window.history ? 'popstate' : 'hashchange';
  addEvent(window, hashEvent, callback);
}

export function addEvent$1(target, eventName, evenHandler) {
  var useCapture = isObject(sdPara.heatmap) && sdPara.heatmap.useCapture ? true : false;
  if (isObject(sdPara.heatmap) && typeof sdPara.heatmap.useCapture === 'undefined' && eventName === 'click') {
    useCapture = true;
  }
  return addEvent(target, eventName, evenHandler, useCapture);
}

export function addSinglePageEvent(callback) {
  var current_url = location.href;
  var historyPushState = window.history.pushState;
  var historyReplaceState = window.history.replaceState;

  if (isFunction(window.history.pushState)) {
    window.history.pushState = function() {
      historyPushState.apply(window.history, arguments);
      callback(current_url);
      current_url = location.href;
    };
  }

  if (isFunction(window.history.replaceState)) {
    window.history.replaceState = function() {
      historyReplaceState.apply(window.history, arguments);
      callback(current_url);
      current_url = location.href;
    };
  }

  var singlePageEvent;
  if (window.document.documentMode) {
    singlePageEvent = 'hashchange';
  } else {
    singlePageEvent = historyPushState ? 'popstate' : 'hashchange';
  }

  addEvent(window, singlePageEvent, function() {
    callback(current_url);
    current_url = location.href;
  });
}


