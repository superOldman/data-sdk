import './utils/runInContext.js'
import './core/core.js'

if (is_compliance_enabled) {
  implementCore(false);
} else {
  implementCore(true);
  checkState();
}


var _sd = sd;
try {
  sd.modules = {};
  sd.modules['AndroidBridge'] = (function () {
    'use strict';

    var vbridge = window.SensorsData_App_Visual_Bridge;
    var vmode = vbridge && vbridge.sensorsdata_visualized_mode;
    var valert = vbridge && vbridge.sensorsdata_visualized_alert_info;
    var vhover = vbridge && vbridge.sensorsdata_hover_web_nodes;

    function alertApp(request) {
      return valert && valert.call(vbridge, JSON.stringify(request));
    }

    function hoverNode(request) {
      return vmode.call(vbridge) && vhover && vhover.call(vbridge, JSON.stringify(request));
    }

    function callBridge(request, bridge) {
      return bridge && typeof bridge[request.callType] === 'function' && bridge[request.callType]();
    }

    var vbridge$1 = {
      isVerify: function () {
        return vmode && (vmode === true || vmode.call(vbridge));
      },
      commands: {
        app_alert: alertApp,
        visualized_track: hoverNode,
        page_info: hoverNode,
        sensorsdata_get_app_visual_config: callBridge
      }
    };

    var anBridge;
    var anTrack;
    var anServerUrl;
    var sd, _, log;

    var AndroidBridge = {
      init: function (sensors) {
        sd = sensors;
        _ = sd && sd._;
        log = (sd && sd.log) || (console && console.log) || function () { };
        sd.on && sd.on('sdkAfterInitPara', initBridge);
      },
      handleCommand: handleCommand
    };

    function initBridge() {
      anBridge = window.SensorsData_APP_New_H5_Bridge;
      anTrack = anBridge && anBridge.sensorsdata_track;
      anServerUrl = anTrack && anBridge.sensorsdata_get_server_url && anBridge.sensorsdata_get_server_url();

      if (!sd || sd.bridge.activeBridge || !anServerUrl) {
        return;
      }

      sd.bridge.activeBridge = AndroidBridge;

      if (sd.para.app_js_bridge && !sd.para.app_js_bridge.is_mui) {
        sd.bridge.is_verify_success = anServerUrl && sd.bridge.validateAppUrl(anServerUrl);
      }

      sd.bridge.bridge_info = {
        touch_app_bridge: true,
        platform: 'android',
        verify_success: sd.bridge.is_verify_success ? 'success' : 'fail',
        support_two_way_call: anBridge.sensorsdata_js_call_app ? true : false
      };

      if (!sd.para.app_js_bridge) {
        log('app_js_bridge is not configured, data will not be sent by android bridge.');
        return;
      }

      sd.registerInterceptor('sendStage', {
        send: {
          priority: 0,
          entry: sendData
        }
      });

      log('Android bridge inits succeed.');
    }

    function sendData(rqData, ctx) {
      if (sd.para.app_js_bridge.is_mui) {
        return rqData;
      }

      var callback = rqData.callback;
      if (sd.bridge.is_verify_success) {
        anTrack && anTrack.call(anBridge, JSON.stringify(_.extend({
          server_url: sd.para.server_url
        }, rqData.data)));
        _.isFunction(callback) && callback();
        ctx.cancellationToken.cancel();
        return rqData;
      }

      if (sd.para.app_js_bridge.is_send) {
        sd.debug.apph5({
          data: rqData.data,
          step: '4.2',
          output: 'all'
        });
        return rqData;
      }

      _.isFunction(callback) && callback();
      ctx.cancellationToken.cancel();
      return rqData;
    }

    function handleCommand(request) {
      var callType = request.callType;
      if (callType in vbridge$1.commands) {
        return vbridge$1.commands[callType](request, anBridge);
      }
      if (anBridge && _.isFunction(anBridge.sensorsdata_js_call_app)) {
        anBridge.sensorsdata_js_call_app(JSON.stringify(request));
      }
    }

    if (window.SensorsDataWebJSSDKPlugin && Object.prototype.toString.call(window.SensorsDataWebJSSDKPlugin) === '[object Object]') {
      window.SensorsDataWebJSSDKPlugin.AndroidBridge = window.SensorsDataWebJSSDKPlugin.AndroidBridge || AndroidBridge;
    } else {
      window.SensorsDataWebJSSDKPlugin = {
        AndroidBridge: AndroidBridge
      };
    }

    return AndroidBridge;

  }());

  sd.modules['AndroidObsoleteBridge'] = (function () {
    'use strict';

    var vbridge = window.SensorsData_App_Visual_Bridge;
    var vmode = vbridge && vbridge.sensorsdata_visualized_mode;
    var valert = vbridge && vbridge.sensorsdata_visualized_alert_info;
    var vhover = vbridge && vbridge.sensorsdata_hover_web_nodes;

    function alertApp(request) {
      return valert && valert.call(vbridge, JSON.stringify(request));
    }

    function hoverNode(request) {
      return vmode.call(vbridge) && vhover && vhover.call(vbridge, JSON.stringify(request));
    }

    function callBridge(request, bridge) {
      return bridge && typeof bridge[request.callType] === 'function' && bridge[request.callType]();
    }

    var vbridge$1 = {
      isVerify: function () {
        return vmode && (vmode === true || vmode.call(vbridge));
      },
      commands: {
        app_alert: alertApp,
        visualized_track: hoverNode,
        page_info: hoverNode,
        sensorsdata_get_app_visual_config: callBridge
      }
    };

    var anBridge;
    var anTrack;
    var anVerify;
    var anVisualVerify;
    var sd, _, log;

    var AndroidObsoleteBridge = {
      init: function (sensors) {
        sd = sensors;
        _ = sd && sd._;
        log = (sd && sd.log) || (console && console.log) || function () { };
        sd.on && sd.on('sdkAfterInitPara', initBridge);
      },
      handleCommand: handleCommand
    };

    function initBridge() {
      anBridge = window.SensorsData_APP_JS_Bridge;
      anTrack = anBridge && anBridge.sensorsdata_track;
      anVerify = anBridge && anBridge.sensorsdata_verify;
      anVisualVerify = anBridge && anBridge.sensorsdata_visual_verify;

      if (!sd || sd.bridge.activeBridge || !(anVerify || anTrack || anVisualVerify)) {
        return;
      }

      sd.bridge.activeBridge = AndroidObsoleteBridge;

      var verifyOk = anVerify || anTrack;
      if (anVisualVerify) {
        verifyOk = anVisualVerify.call(anBridge, JSON.stringify({
          server_url: sd.para.server_url
        })) ? true : false;
      }

      sd.bridge.bridge_info = {
        touch_app_bridge: true,
        platform: 'android',
        verify_success: verifyOk ? 'success' : 'fail'
      };

      if (!sd.para.app_js_bridge) {
        log('app_js_bridge is not configured, data will not be sent by android obsolete bridge.');
        return;
      }

      sd.registerInterceptor('sendStage', {
        send: {
          priority: 0,
          entry: sendData
        }
      });

      log('Android obsolete bridge inits succeed.');
    }

    function sendData(rqData, ctx) {
      if (sd.para.app_js_bridge.is_mui) {
        return rqData;
      }
      var callback = rqData.callback;
      if (anVerify) {
        var success = anVerify && anVerify.call(anBridge, JSON.stringify(_.extend({
          server_url: sd.para.server_url
        }, rqData.data)));
        if (success) {
          _.isFunction(callback) && callback();
          ctx.cancellationToken.cancel();
          return rqData;
        }
        if (sd.para.app_js_bridge.is_send) {
          sd.debug.apph5({
            data: rqData.data,
            step: '3.1',
            output: 'all'
          });
          return rqData;
        }
        _.isFunction(callback) && callback();
        ctx.cancellationToken.cancel();
        return rqData;
      }

      anTrack && anTrack.call(anBridge, JSON.stringify(_.extend({
        server_url: sd.para.server_url
      }, rqData.data)));
      _.isFunction(callback) && callback();
      ctx.cancellationToken.cancel();
      return rqData;
    }

    function handleCommand(request) {
      var callType = request.callType;
      if (callType in vbridge$1.commands) {
        return vbridge$1.commands[callType](request, anBridge);
      }
      if (anBridge && _.isFunction(anBridge.sensorsdata_js_call_app)) {
        return anBridge.sensorsdata_js_call_app(JSON.stringify(request));
      }
    }

    if (window.SensorsDataWebJSSDKPlugin && Object.prototype.toString.call(window.SensorsDataWebJSSDKPlugin) === '[object Object]') {
      window.SensorsDataWebJSSDKPlugin.AndroidObsoleteBridge = window.SensorsDataWebJSSDKPlugin.AndroidObsoleteBridge || AndroidObsoleteBridge;
    } else {
      window.SensorsDataWebJSSDKPlugin = {
        AndroidObsoleteBridge: AndroidObsoleteBridge
      };
    }

    return AndroidObsoleteBridge;

  }());

  sd.modules['IosBridge'] = (function () {
    'use strict';

    var iosServerUrl;
    var iosTracker;

    var sd, _, log;
    var IOSBridge = {
      init: function (sensors) {
        sd = sensors;
        _ = sd && sd._;
        log = (sd && sd.log) || (console && console.log) || function () { };
        sd.on && sd.on('sdkAfterInitPara', initBridge);
      },
      handleCommand: handleCommand
    };

    function initBridge() {
      iosServerUrl = window.SensorsData_iOS_JS_Bridge && window.SensorsData_iOS_JS_Bridge.sensorsdata_app_server_url;
      iosTracker = function () {
        return window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.sensorsdataNativeTracker;
      };

      if (!sd || sd.bridge.activeBridge || !iosTracker() || !iosTracker().postMessage) {
        return;
      }

      sd.bridge.activeBridge = IOSBridge;
      if (sd.para.app_js_bridge && !sd.para.app_js_bridge.is_mui) {
        sd.bridge.is_verify_success = iosServerUrl && sd.bridge.validateAppUrl(iosServerUrl);
      }

      sd.bridge.bridge_info = {
        touch_app_bridge: true,
        platform: 'ios',
        verify_success: sd.bridge.is_verify_success ? 'success' : 'fail',
        support_two_way_call: true
      };

      if (!sd.para.app_js_bridge) {
        log('app_js_bridge is not configured, data will not be sent by iOS bridge.');
        return;
      }

      sd.registerInterceptor('sendStage', {
        send: {
          priority: 0,
          entry: sendData
        }
      });

      log('IOS bridge inits succeed.');
    }

    function sendData(rqData, ctx) {
      if (sd.para.app_js_bridge.is_mui) {
        return rqData;
      }
      var callback = rqData.callback;
      if (sd.bridge.is_verify_success) {
        iosTracker() &&
          iosTracker().postMessage(
            JSON.stringify({
              callType: 'app_h5_track',
              data: _.extend({
                server_url: sd.para.server_url
              }, rqData.data)
            })
          );
        _.isFunction(callback) && callback();
        ctx.cancellationToken.cancel();
        return rqData;
      }

      if (sd.para.app_js_bridge.is_send) {
        sd.debug.apph5({
          data: rqData.data,
          step: '4.1',
          output: 'all'
        });
        return rqData;
      }

      _.isFunction(callback) && callback();
      ctx.cancellationToken.cancel();
      return rqData;
    }

    function handleCommand(request) {
      var callType = request.callType;
      if ((callType === 'page_info' || callType === 'visualized_track') && !sd.bridge.hasVisualModeBridge()) {
        return null;
      }

      if (callType === 'sensorsdata_get_app_visual_config') {
        return _.isObject(window.SensorsData_APP_New_H5_Bridge) && window.SensorsData_APP_New_H5_Bridge[callType];
      }

      return iosTracker() && iosTracker().postMessage(JSON.stringify(request));
    }

    if (window.SensorsDataWebJSSDKPlugin && Object.prototype.toString.call(window.SensorsDataWebJSSDKPlugin) === '[object Object]') {
      window.SensorsDataWebJSSDKPlugin.IOSBridge = window.SensorsDataWebJSSDKPlugin.IOSBridge || IOSBridge;
    } else {
      window.SensorsDataWebJSSDKPlugin = {
        IOSBridge: IOSBridge
      };
    }

    return IOSBridge;

  }());

  sd.modules['IosObsoleteBridge'] = (function () {
    'use strict';

    var sd, _, log;
    var IOSObsoleteBridge = {
      init: function (sensors) {
        sd = sensors;
        _ = sd && sd._;
        log = (sd && sd.log) || (console && console.log) || function () { };
        sd.on && sd.on('sdkAfterInitPara', initBridge);
      }
    };

    function initBridge() {
      if (!sd || sd.bridge.activeBridge || !hasBridge()) {
        return;
      }

      sd.bridge.activeBridge = IOSObsoleteBridge;
      sd.bridge.bridge_info = {
        touch_app_bridge: true,
        platform: 'ios',
        verify_success: verifyIOSObsoleteBridge() ? 'success' : 'fail'
      };

      if (!sd.para.app_js_bridge) {
        log('app_js_bridge is not configured, data will not be sent by iOS obsolete bridge.');
        return;
      }

      sd.registerInterceptor('sendStage', {
        send: {
          priority: 0,
          entry: sendData
        }
      });

      log('IOS obsolete bridge inits succeed.');
    }

    function hasBridge() {
      return (/sensors-verify/.test(navigator.userAgent) || /sa-sdk-ios/.test(navigator.userAgent)) && !window.MSStream;
    }

    function verifyIOSObsoleteBridge() {
      if (/sensors-verify/.test(navigator.userAgent)) {
        var match = navigator.userAgent.match(/sensors-verify\/([^\s]+)/);
        if (match && match[0] && typeof match[1] === 'string' && match[1].split('?').length === 2) {
          match = match[1].split('?');
          var hostname = null;
          var project = null;
          try {
            hostname = _.URL(sd.para.server_url).hostname;
            project = _.URL(sd.para.server_url).searchParams.get('project') || 'default';
          } catch (e) {
            sd.log(e);
          }
          if (hostname && hostname === match[0] && project && project === match[1]) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else if (/sa-sdk-ios/.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    }

    function sendData(rqData, ctx) {
      if (sd.para.app_js_bridge.is_mui) {
        return rqData;
      }
      var callback = rqData.callback;

      function checkURL(originData) {
        var data = JSON.stringify(_.extend({
          server_url: sd.para.server_url
        }, originData));
        data = data.replace(/\r\n/g, '');
        data = encodeURIComponent(data);
        return 'sensorsanalytics://trackEvent?event=' + data;
      }

      if (sd.bridge.bridge_info.verify_success) {
        var iframe = document.createElement('iframe');
        var newurl = checkURL(rqData.data);
        iframe.setAttribute('src', newurl);
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
        _.isFunction(callback) && callback();
        ctx.cancellationToken.cancel();
        return true;
      }

      if (sd.para.app_js_bridge.is_send) {
        sd.debug.apph5({
          data: rqData.data,
          step: '3.2',
          output: 'all'
        });
        return rqData;
      }

      _.isFunction(callback) && callback();
      ctx.cancellationToken.cancel();
      return rqData;
    }

    if (window.SensorsDataWebJSSDKPlugin && Object.prototype.toString.call(window.SensorsDataWebJSSDKPlugin) === '[object Object]') {
      window.SensorsDataWebJSSDKPlugin.IOSObsoleteBridge = window.SensorsDataWebJSSDKPlugin.IOSObsoleteBridge || IOSObsoleteBridge;
    } else {
      window.SensorsDataWebJSSDKPlugin = {
        IOSObsoleteBridge: IOSObsoleteBridge
      };
    }

    return IOSObsoleteBridge;

  }());

  sd.modules['Utm'] = (function () {
    'use strict';

    var source_channel_standard = 'utm_source utm_medium utm_campaign utm_content utm_term';

    var sd;
    var utm = {
      init: function (sa) {
        if (!sa || sd) {
          return;
        }
        sd = sa;
        sd.on &&
          sd.on('sdkAfterInitPara', function () {
            sd.registerInterceptor('businessStage', {
              getUtmData: {
                priority: 0,
                entry: function () {
                  return getUtm();
                }
              }
            });
          });

        function getUtm() {
          var campaign_keywords = source_channel_standard.split(' '),
            kw = '',
            params = {};
          if (sd._.isArray(sd.para.source_channel) && sd.para.source_channel.length > 0) {
            campaign_keywords = campaign_keywords.concat(sd.para.source_channel);
            campaign_keywords = sd._.unique(campaign_keywords);
          }
          sd._.each(campaign_keywords, function (kwkey) {
            kw = sd._.getQueryParam(location.href, kwkey);
            if (kw.length) {
              params[kwkey] = kw;
            }
          });
          return params;
        }
      }
    };

    if (window.SensorsDataWebJSSDKPlugin && Object.prototype.toString.call(window.SensorsDataWebJSSDKPlugin) === '[object Object]') {
      window.SensorsDataWebJSSDKPlugin.Utm = window.SensorsDataWebJSSDKPlugin.Utm || utm;
    } else {
      window.SensorsDataWebJSSDKPlugin = {
        Utm: utm
      };
    }

    return utm;

  }());


  sd.use('AndroidBridge');
  sd.use('IOSBridge');
  sd.use('AndroidObsoleteBridge');
  sd.use('IOSObsoleteBridge');

  sd.use('Utm');
  if (typeof window['sensorsDataAnalytic201505'] === 'string') {
    sd.para = window[sensorsDataAnalytic201505].para;
    sd._q = window[sensorsDataAnalytic201505]._q;

    window[sensorsDataAnalytic201505] = sd;
    window['sensorsDataAnalytic201505'] = sd;
    sd.init();
  } else if (typeof window['sensorsDataAnalytic201505'] === 'undefined') {
    window['sensorsDataAnalytic201505'] = sd;
  } else {
    _sd = window['sensorsDataAnalytic201505'];
  }
} catch (err) {
  if (typeof console === 'object' && console.log) {
    try {
      console.log(err);
    } catch (e) {
      sd.log(e);
    }
  }
}
