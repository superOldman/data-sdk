import SDKJSBridge from './SDKJSBridge'
import { isFunction } from "@/utils/index";
function DeprecatedJSBridge(arg) {
  this.bridge = new SDKJSBridge(arg.type);
}

DeprecatedJSBridge.prototype = {
  double: function() {},
  getAppData: function() {},
  hasAppBridge: function() {
    return sd.bridge.bridge_info.support_two_way_call;
  },
  init: function() {},
  jsCallApp: function() {},
  requestToApp: function(e) {
    this.bridge
      .call(e, e.timeout.time)
      .onResult(function(data) {
        isFunction(e.callback) && e.callback(data);
      })
      .onTimeout(function() {
        isFunction(e.timeout.callback) && e.timeout.callback();
      });
  }
};
export default DeprecatedJSBridge