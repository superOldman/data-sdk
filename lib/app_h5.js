import vtrackBase from '@/track/vtrackBase'
import { isObject, each } from '@/utils/index'
export var vapph5CustomProp = {
  events: [],
  getAssignConfigs: vtrackBase.getAssignConfigs,
  filterConfig: vtrackBase.filterConfig,
  getProp: vtrackBase.getProp,
  initUrl: vtrackBase.initUrl,
  updateEvents: function(events) {
    if (!isArray(events)) {
      return;
    }
    this.events = events;
  },
  init: function() {
    this.initAppGetPropsBridge();
  },
  geth5Props: function(data) {
    var props = {};
    var name_arr = [];
    var that = this;
    if (!this.events.length) {
      return {};
    }
    if (data.event === '$WebClick') {
      var events = this.filterConfig(data, this.events);
      if (!events.length) {
        return {};
      } else {
        each(events, function(event) {
          if (!isObject(event)) {
            return;
          }
          if (isArray(event.properties) && event.properties.length > 0) {
            each(event.properties, function(propConf) {
              if (!isObject(propConf)) {
                return;
              }
              if (propConf.h5 === false) {
                if (!isArray(props.sensorsdata_app_visual_properties)) {
                  props.sensorsdata_app_visual_properties = [];
                }
                props.sensorsdata_app_visual_properties.push(propConf);
              } else {
                var prop = that.getProp(propConf, data);
                if (isObject(prop)) {
                  props = extend(props, prop);
                }
              }
            });
          }
          if (isString(event.event_name)) {
            name_arr.push(event.event_name);
          }
        });

        if (sd.bridge.hasVisualModeBridge()) {
          props.sensorsdata_web_visual_eventName = name_arr;
        }
      }
    }
    if (props.sensorsdata_app_visual_properties) {
      props.sensorsdata_app_visual_properties = base64Encode(JSON.stringify(props.sensorsdata_app_visual_properties));
    }

    return props;
  },

  initAppGetPropsBridge: function() {
    var that = this;
    var bridgeCall = new sd.SDKJSBridge('getJSVisualProperties');

    bridgeCall.onAppNotify(function(data) {
      var props = {};
      try {
        data = JSON.parse(base64Decode(data));
      } catch (error) {
        sd.log('getJSVisualProperties data parse error!');
      }
      if (isObject(data)) {
        var confs = data.sensorsdata_js_visual_properties;
        var url_info = that.initUrl();
        if (url_info) {
          url_info = url_info.page_url;
          if (isArray(confs) && confs.length > 0) {
            each(confs, function(propConf) {
              if (!isObject(propConf)) {
                return;
              }
              if (propConf.url_host === url_info.host && propConf.url_path === url_info.pathname) {
                if (propConf.h5) {
                  var prop = that.getProp(propConf);
                  if (isObject(prop)) {
                    props = extend(props, prop);
                  }
                }
              }
            });
          }
        }
      }
      var platform = sd.bridge.bridge_info.platform;
      if (platform === 'android') {
        bridgeCall.notifyApp({
          data: props
        }, data.message_id);
      }
      return props;
    });

    return bridgeCall;
  }
};

export var vapph5collect = {
  events: [],
  customProp: vapph5CustomProp,
  getAssignConfigs: vtrackBase.getAssignConfigs,
  initUrl: vtrackBase.initUrl,
  init: function() {
    if (!this.initUrl()) {
      return;
    }
    var result = this.getConfigFromApp();
    if (result) {
      this.updateConfigs(result);
    }
    this.customProp.init();
    this.initAppUpdateConfigBridge();
  },
  initAppUpdateConfigBridge: function() {
    var _this = this;
    return new sd.SDKJSBridge('updateH5VisualConfig').onAppNotify(function(data) {
      if (data) {
        try {
          data = JSON.parse(base64Decode(data));
        } catch (error) {
          sd.log('updateH5VisualConfig result parse error！');
          return;
        }
        _this.updateConfigs(data);
      }
    });
  },
  getConfigFromApp: function() {
    var result = new sd.SDKJSBridge('sensorsdata_get_app_visual_config').notifyApp();
    if (result) {
      try {
        result = JSON.parse(base64Decode(result));
      } catch (error) {
        result = null;
        sd.log('getAppVisualConfig result parse error！');
      }
    }
    return result;
  },
  updateConfigs: function(config) {
    this.events = this.filterConfigs(config);
    this.customProp.updateEvents(this.events);
  },
  filterConfigs: function(config) {
    return this.getAssignConfigs(function(event) {
      if (isObject(event) && event.h5 !== false) {
        return true;
      } else {
        return false;
      }
    }, config);
  }
};