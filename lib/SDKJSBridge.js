function SDKJSBridge(callType) {
  var that = this;
  this.type = callType;
  this.resultCbs = {};
  this.timeoutCbs = {};
  this.timerId = null;
  this.appCallJsCallback = null;

  if (!window.sensorsdata_app_call_js) {
    window.sensorsdata_app_call_js = function(callType, data) {
      if (callType in window.sensorsdata_app_call_js.modules) {
        return window.sensorsdata_app_call_js.modules[callType](data);
      }
    };
  }
  window.sensorsdata_app_call_js.modules = window.sensorsdata_app_call_js.modules || {};
  window.sensorsdata_app_call_js.modules[this.type] = function(data) {
    try {
      var tmp = base64Decode(data) || data;
      try {
        tmp = JSON.parse(tmp);
      } catch (e) {}

      var messageId = tmp && tmp.message_id;
      if (messageId && that.resultCbs[messageId]) {
        data = tmp;
        if (that.timeoutCbs[messageId] && that.timeoutCbs[messageId].isTimeout) {
          that.resultCbs[messageId].callbacks.length = 0;
          return;
        }

        if (that.resultCbs[messageId]) {
          that.resultCbs[messageId].result = data;
          clearTimeout(that.timerId);
          that.timeoutCbs[messageId].callbacks.length = 0;

          for (var i in that.resultCbs[messageId].callbacks) {
            that.resultCbs[messageId].callbacks[i].call(null, data);
            that.resultCbs[messageId].callbacks.splice(i, 1);
          }
        }
        return;
      }

      return that.appCallJsCallback && that.appCallJsCallback.call(null, data);
    } catch (error) {
      console.log('app 回调 js 异常', data);
    }
  };
}

SDKJSBridge.prototype.call = function(callArg, timeout) {
  var that = this;
  var callId = new Date().getTime().toString(16) + String(getRandom()).replace('.', '').slice(1, 8);

  this.resultCbs[callId] = that.resultCbs[callId] || {
    result: null,
    callbacks: []
  };
  this.timeoutCbs[callId] = that.timeoutCbs[callId] || {
    isTimeout: false,
    callbacks: []
  };
  callArg = callArg.data ? callArg : {
    data: callArg
  };
  callArg.data.message_id = callId;
  var appData = extend({
    callType: this.type
  }, callArg);

  if (timeout) {
    this.timerId = setTimeout(function() {
      that.timeoutCbs[callId].isTimeout = true;
      for (var i in that.timeoutCbs[callId].callbacks) {
        that.timeoutCbs[callId].callbacks[i].call(null);
        that.timeoutCbs[callId].callbacks.splice(i, 1);
      }
    }, timeout);
  }

  handleCommands(appData);

  return {
    onResult: function(callback) {
      if (that.resultCbs[callId].result) {
        callback(that.resultCbs[callId].result);
        return this;
      }!that.timeoutCbs[callId].isTimeout && that.resultCbs[callId].callbacks.push(callback);
      return this;
    },
    onTimeout: function(callback) {
      if (that.timeoutCbs[callId].isTimeout) {
        callback();
        return this;
      }!that.resultCbs[callId].result && that.timeoutCbs[callId].callbacks.push(callback);
      return this;
    }
  };
};

SDKJSBridge.prototype.onAppNotify = function(callback) {
  this.appCallJsCallback = callback;
};

SDKJSBridge.prototype.notifyApp = function(callArg, message_id) {
  var appData = extend({
    callType: this.type
  }, callArg);
  if (message_id) {
    appData.message_id = message_id;
  }
  return handleCommands(appData);
};

export default SDKJSBridge