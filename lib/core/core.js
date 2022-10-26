import { formatData } from '../utils/index.js'
import { W, common, functions, saEmpty } from '../utils/extendFn.js'
var methods = ['setItem', 'deleteItem', 'getAppStatus', 'track', 'quick', 'register', 'registerPage', 'registerOnce', 'trackSignup', 'setProfile', 'setOnceProfile', 'appendProfile', 'incrementProfile', 'deleteProfile', 'unsetProfile', 'identify', 'login', 'logout', 'trackLink', 'clearAllRegister', 'clearPageRegister', 'bind', 'unbind', 'loginWithKey'];

export function checkState() {
  each(methods, function(method) {
    var oldFunc = sd[method];
    sd[method] = function() {
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

sd.init = function(para) {
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
