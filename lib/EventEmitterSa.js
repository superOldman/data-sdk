var EventEmitterSa = function() {
  this._events = [];
  this.pendingEvents = [];
};

EventEmitterSa.prototype = {
  emit: function(type) {
    var args = [].slice.call(arguments, 1);

    each(this._events, function(val) {
      if (val.type !== type) {
        return;
      }
      val.callback.apply(val.context, args);
    });

    this.pendingEvents.push({
      type: type,
      data: args
    });
    this.pendingEvents.length > 20 ? this.pendingEvents.shift() : null;
  },
  on: function(event, callback, context, replayAll) {
    if (typeof callback !== 'function') {
      return;
    }
    this._events.push({
      type: event,
      callback: callback,
      context: context || this
    });

    replayAll = replayAll === false ? false : true;
    if (this.pendingEvents.length > 0 && replayAll) {
      each(this.pendingEvents, function(val) {
        if (val.type === event) {
          callback.apply(context, val.data);
        }
      });
    }
  },
  tempAdd: function(event, data) {
    if (!data || !event) {
      return;
    }
    return this.emit(event, data);
  },
  isReady: function() {}
};

export default EventEmitterSa