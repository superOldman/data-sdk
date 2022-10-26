import { formatData } from '@/utils/index.js'
import { W } from '@/toolsFn/defaultFn'
import { common } from '@/toolsFn/commonFn'
import { functions, saEmpty } from '@/toolsFn/extendFn'

var methods = ['setItem', 'deleteItem', 'getAppStatus', 'track', 'quick', 'register', 'registerPage', 'registerOnce', 'trackSignup', 'setProfile', 'setOnceProfile', 'appendProfile', 'incrementProfile', 'deleteProfile', 'unsetProfile', 'identify', 'login', 'logout', 'trackLink', 'clearAllRegister', 'clearPageRegister', 'bind', 'unbind', 'loginWithKey'];

export function checkState() {
  each(methods, function (method) {
    var oldFunc = sd[method];
    sd[method] = function () {
      if (sd.readyState.state < 3) {
        if (!isArray(sd._q)) {
          sd._q = [];
        }
        sd._q.push([method, arguments]);
        return false;
      }
      if (!sd.readyState.getState()) {
        try {
          console.error('请先初始化神策JS SDK');
        } catch (e) {
          sd.log(e);
        }
        return;
      }
      return oldFunc.apply(sd, arguments);
    };
  });
}


var sd = {};

sd.init = function (para) {
  ee.sdk.emit('beforeInit');
  if (sd.readyState && sd.readyState.state && sd.readyState.state >= 2) {
    return false;
  }

  if (is_compliance_enabled) {
    implementCore(true);
  }

  ee.initSystemEvent();

  sd.setInitVar();
  sd.readyState.setState(2);
  sd.initPara(para);
  ee.sdk.emit('afterInitPara');
  sd.detectMode();
  sd.iOSWebClickPolyfill();
  ee.sdk.emit('afterInit');
};



var dataStageImpl$1 = {
  init: function () { },
  interceptor: {
    formatData: {
      priority: 0,
      entry: function (data) {
        formatData(data);
        return data;
      }
    }
  }
};


function DataFormatFeature() {
  this.dataStage = dataStageImpl$1;
}

var preCfg = window['sensors_data_pre_config'];
var is_compliance_enabled = isObject(preCfg) ? preCfg.is_compliance_enabled : false;

var batchSend = new BatchSend();

function CoreFeature(sd) {
  sd.kit = kit;
  sd.saEvent = saEvent;
  this.dataStage = dataStageImpl;
  this.sendStage = sendStageImpl;
  this.businessStage = businessStageImpl;
}

var processDef = {
  addCustomProps: null,
  formatData: null
};

var dataStage = new Stage(processDef);

var processDef$1 = {
  beforeSend: 'send',
  send: 'afterSend',
  afterSend: null
};

var sendStage = new Stage(processDef$1);

var processDef$2 = {
  getUtmData: null
};

var businessStage = new Stage(processDef$2);


var interceptorRegisters = {
  dataStage: function registerDataStageInterceptor(interceptor) {
    interceptor && dataStage.registerInterceptor(interceptor);
  },
  businessStage: function registerBusinessInterceptor(interceptor) {
    interceptor && businessStage.registerInterceptor(interceptor);
  },
  sendStage: function registerSendStageInterceptor(interceptor) {
    interceptor && sendStage.registerInterceptor(interceptor);
  }
};

function registerFeature(feature) {
  feature && feature.dataStage && dataStage.registerStageImplementation(feature.dataStage);
  feature && feature.businessStage && businessStage.registerStageImplementation(feature.businessStage);
  feature && feature.sendStage && sendStage.registerStageImplementation(feature.sendStage);
}

function registerInterceptor(stage, interceptor) {
  if (interceptorRegisters[stage]) {
    interceptorRegisters[stage](interceptor);
  }
}

import { addSinglePageEvent } from '@/Events/addEvent.js'

var spa = new EventEmitter();
var sdk = new EventEmitter();
var ee = {};

ee.spa = spa;

ee.sdk = sdk;

ee.initSystemEvent = function () {
  addSinglePageEvent(function (url) {
    spa.emit('switch', url);
  });
};

ee.EVENT_LIST = {
  spaSwitch: ['spa', 'switch'],
  sdkAfterInitPara: ['sdk', 'afterInitPara'],
  sdkBeforeInit: ['sdk', 'beforeInit'],
  sdkAfterInit: ['sdk', 'afterInit']
};

var businessStageImpl = {
  stage: null,
  init: function (stage) {
    this.stage = stage;
  }
};

function processGetUtmData() {
  return businessStageImpl.stage && businessStageImpl.stage.process('getUtmData');
}


function getRealtimeInstance(data) {
  var obj = getSender(data);
  var start = obj.start;
  obj.start = function () {
    var me = this;
    start.apply(this, arguments);
    setTimeout(function () {
      me.isEnd(true);
    }, sd.para.callback_timeout);
  };
  obj.end = function () {
    this.callback && this.callback();
    var self = this;
    setTimeout(function () {
      self.lastClear && self.lastClear();
    }, sd.para.datasend_timeout - sd.para.callback_timeout);
  };
  obj.isEnd = function () {
    if (!this.received) {
      this.received = true;
      this.end();
    }
  };
  return obj;
}

var sendStageImpl = {
  stage: null,
  init: function (stage) {
    this.stage = stage;
  },
  interceptor: {
    send: {
      entry: function (data, context) {
        var sd = context.sensors;
        var callback = data.callback;

        if (!sd.para.app_js_bridge) {
          sd.debug.apph5({
            data: data.data,
            step: '1',
            output: 'code'
          });
          sd.sendState.prepareServerUrl(data);
          return data;
        }

        if (!sd.para.app_js_bridge.is_mui) {
          if (sd.para.app_js_bridge.is_send === true) {
            sd.debug.apph5({
              data: data.data,
              step: '2',
              output: 'all'
            });
            sd.sendState.prepareServerUrl(data);
            return data;
          }
          sd._.isFunction(callback) && callback();
          return data;
        }

        if (sd.para.app_js_bridge.is_mui) {
          if (window.plus && window.plus.SDAnalytics && window.plus.SDAnalytics.trackH5Event) {
            window.plus.SDAnalytics.trackH5Event(data);
            sd._.isFunction(callback) && callback();
            return data;
          }

          if (sd.para.app_js_bridge.is_send === true) {
            sd.sendState.prepareServerUrl(data);
            return data;
          }

          sd._.isFunction(callback) && callback();
          return data;
        }
      }
    }
  }
};



function handleCommands(appData) {
  try {
    if (sd.bridge.activeBridge && isFunction(sd.bridge.activeBridge.handleCommand)) {
      return sd.bridge.activeBridge.handleCommand(appData);
    }
  } catch (e) {
    sd.log('Error: handle command exception:' + e);
  }
  sd.log('数据发往App失败，App没有暴露bridge,type:' + appData.callType);
  return false;
}

function validateAppUrl(appUrl) {
  function resolveUrl(url) {
    var obj = {
      hostname: '',
      project: ''
    };
    try {
      url = _URL(url);
      obj.hostname = url.hostname;
      obj.project = url.searchParams.get('project') || 'default';
    } catch (e) {
      sd.log(e);
    }
    return obj;
  }

  var appObj = resolveUrl(appUrl);
  var H5Obj = resolveUrl(sd.para.server_url);
  if (appObj.hostname === H5Obj.hostname && appObj.project === H5Obj.project) {
    return true;
  }

  if (isArray(sd.para.app_js_bridge.white_list)) {
    for (var i = 0; i < sd.para.app_js_bridge.white_list.length; i++) {
      var urlobj = resolveUrl(sd.para.app_js_bridge.white_list[i]);
      if (urlobj.hostname === appObj.hostname && urlobj.project === appObj.project) {
        return true;
      }
    }
  }

  return false;
}


function getFlagValue(param) {
  var result = null;
  try {
    var nameParams = JSON.parse(window.name);
    result = nameParams[param] ? _decodeURIComponent(nameParams[param]) : null;
  } catch (e) {
    result = null;
  }
  if (result === null) {
    result = getQueryParam(location.href, param) || null;
  }
  return result;
}

function defineMode(isLoaded) {
  var bridgeObj = sd.bridge.bridge_info;

  function getAndPostDebugInfo() {
    var arr = [];
    if (!bridgeObj.touch_app_bridge) {
      arr.push(sd.debug.defineMode('1'));
    }
    if (!isObject(sd.para.app_js_bridge)) {
      arr.push(sd.debug.defineMode('2'));
      bridgeObj.verify_success = false;
    }
    if (!(isObject(sd.para.heatmap) && sd.para.heatmap.clickmap == 'default')) {
      arr.push(sd.debug.defineMode('3'));
    }
    if (bridgeObj.verify_success === 'fail') {
      arr.push(sd.debug.defineMode('4'));
    }

    new sd.SDKJSBridge('app_alert').notifyApp({
      data: arr
    });
  }

  if (sd.bridge.hasVisualModeBridge()) {
    if (isObject(sd.para.heatmap) && sd.para.heatmap.clickmap == 'default') {
      if (isObject(sd.para.app_js_bridge) && bridgeObj.verify_success === 'success') {
        if (!isLoaded) {
          var protocol = location.protocol;
          var protocolArr = ['http:', 'https:'];
          protocol = indexOf(protocolArr, protocol) > -1 ? protocol : 'https:';
          loadScript({
            success: function () {
              setTimeout(function () {
                if (typeof sa_jssdk_app_define_mode !== 'undefined') {
                  sa_jssdk_app_define_mode(sd, isLoaded);
                }
              }, 0);
            },
            error: function () { },
            type: 'js',
            url: protocol + '//static.sensorsdata.cn/sdk/' + sd.lib_version + '/vapph5define.min.js'
          });
        } else {
          sa_jssdk_app_define_mode(sd, isLoaded);
        }
      } else {
        getAndPostDebugInfo();
      }
    } else {
      getAndPostDebugInfo();
    }
  }
}




function listenSinglePage() {
  if (sd.para.is_track_single_page) {
    spa.on('switch', function (last_url) {
      var sendData = function (extraData) {
        extraData = extraData || {};
        if (last_url !== location.href) {
          pageInfo.pageProp.referrer = getURL(last_url);
          sd.quick('autoTrack', extend({
            $url: getURL(),
            $referrer: getURL(last_url)
          }, extraData));
        }
      };
      if (typeof sd.para.is_track_single_page === 'boolean') {
        sendData();
      } else if (typeof sd.para.is_track_single_page === 'function') {
        var returnValue = sd.para.is_track_single_page();
        if (isObject(returnValue)) {
          sendData(returnValue);
        } else if (returnValue === true) {
          sendData();
        }
      }
    });
  }
}
function enterFullTrack() {
  if (sd._q && isArray(sd._q) && sd._q.length > 0) {
    each(sd._q, function (content) {
      sd[content[0]].apply(sd, Array.prototype.slice.call(content[1]));
    });
  }

  if (isObject(sd.para.heatmap)) {
    heatmap.initHeatmap();
    heatmap.initScrollmap();
  }
}



function trackMode() {
  sd.readyState.setState(3);

  new sd.SDKJSBridge('visualized').onAppNotify(function () {
    if (typeof sa_jssdk_app_define_mode !== 'undefined') {
      defineMode(true);
    } else {
      defineMode(false);
    }
  });

  defineMode(false);

  sd.bridge.app_js_bridge_v1();
  pageInfo.initPage();

  listenSinglePage();

  if (!sd.para.app_js_bridge && sd.para.batch_send && _localStorage.isSupport()) {
    sd.batchSend.batchInterval();
  }
  sd.store.init();

  sd.vtrackBase.init();

  sd.readyState.setState(4);


  enterFullTrack();
}


function detectMode() {
  if (heatmapMode.isSeachHasKeyword()) {
    heatmapMode.hasKeywordHandle();
  } else if (window.parent !== self && vtrackMode.isSearchHasKeyword()) {
    vtrackMode.verifyVtrackMode();
  } else if (heatmapMode.isWindowNameHasKeyword()) {
    heatmapMode.windowNameHasKeywordHandle();
  } else if (heatmapMode.isStorageHasKeyword()) {
    heatmapMode.storageHasKeywordHandle();
  } else if (window.parent !== self && vtrackMode.isStorageHasKeyword()) {
    vtrackMode.verifyVtrackMode();
  } else {
    trackMode();
    vtrackMode.notifyUser();
  }
}

// 核心注入
export function implementCore(isRealImp) {
  if (isRealImp) {
    logger.setup(sdLog);
    sd._ = extend(W, common);
    sd.ee = ee;
    sd.sendState = sendState;
    sd.events = new sd._.EventEmitterSa();
    sd.batchSend = batchSend;
    sd.bridge = bridge;
    sd.SDKJSBridge = SDKJSBridge;
    sd.JSBridge = DeprecatedJSBridge;
    sd.store = store;
    sd.vtrackBase = vtrackBase;
    sd.unlimitedDiv = unlimitedDiv;
    sd.customProp = customProp;
    sd.vtrackcollect = vtrackcollect;
    sd.vapph5collect = vapph5collect;
    sd.heatmap = heatmap;
    sd.detectMode = detectMode;
    sd.registerFeature = registerFeature;
    sd.registerInterceptor = registerInterceptor;
    registerFeature(new CoreFeature(sd));
    registerFeature(new DataFormatFeature(sd));
  }

  var imp = isRealImp ? functions : saEmpty;
  for (var f in imp) {
    sd[f] = imp[f];
  }
  sd.on = eventEmitterFacade;
  sd.ee = ee;
  sd.use = use;
}
