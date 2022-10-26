var bridge = {
  bridge_info: {
    touch_app_bridge: false,
    verify_success: false,
    platform: '',
    support_two_way_call: false
  },
  is_verify_success: false,
  initPara: function() {
    var app_js_bridge_default = {
      is_send: sd.para.use_app_track_is_send === false || sd.para.use_app_track === 'only' ? false : true,
      white_list: [],
      is_mui: sd.para.use_app_track === 'mui' ? true : false
    };

    if (typeof sd.para.app_js_bridge === 'object') {
      sd.para.app_js_bridge = extend({}, app_js_bridge_default, sd.para.app_js_bridge);
    } else if (sd.para.use_app_track === true || sd.para.app_js_bridge === true || sd.para.use_app_track === 'only' || sd.para.use_app_track === 'mui') {
      sd.para.app_js_bridge = extend({}, app_js_bridge_default);
    }

    if (sd.para.app_js_bridge.is_send === false) {
      sd.log('设置了 is_send:false,如果打通失败，数据将被丢弃!');
    }
  },
  app_js_bridge_v1: function() {
    var app_info = null;
    var todo = null;

    function setAppInfo(data) {
      app_info = data;
      if (isJSONString(app_info)) {
        app_info = JSON.parse(app_info);
      }
      if (todo) {
        todo(app_info);
        todo = null;
        app_info = null;
      }
    }

    function getAndroid() {
      if (typeof window.SensorsData_APP_JS_Bridge === 'object' && window.SensorsData_APP_JS_Bridge.sensorsdata_call_app) {
        app_info = SensorsData_APP_JS_Bridge.sensorsdata_call_app();
        if (isJSONString(app_info)) {
          app_info = JSON.parse(app_info);
        }
      }
    }
    window.sensorsdata_app_js_bridge_call_js = function(data) {
      setAppInfo(data);
    };

    function calliOS() {
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', 'sensorsanalytics://getAppInfo');
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
      }
    }
    sd.getAppStatus = function(func) {
      calliOS();
      getAndroid();
      if (!func) {
        return app_info;
      } else {
        if (app_info === null) {
          todo = func;
        } else {
          func(app_info);
          app_info = null;
        }
      }
    };
  },
  hasVisualModeBridge: function() {
    var vBridgeObj = window['SensorsData_App_Visual_Bridge'];
    var vMode = 'sensorsdata_visualized_mode';
    return isObject(vBridgeObj) && vBridgeObj[vMode] && (vBridgeObj[vMode] === true || vBridgeObj[vMode]());
  },
  validateAppUrl: validateAppUrl
};