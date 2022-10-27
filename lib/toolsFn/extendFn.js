function addReferrerHost(data) {
  var isNotProfileType = !data.type || data.type.slice(0, 7) !== 'profile';
  var defaultHost = '取值异常';
  if (isObject(data.properties)) {
    if (data.properties.$first_referrer) {
      data.properties.$first_referrer_host = getHostname(data.properties.$first_referrer, defaultHost);
    }
    if (isNotProfileType) {
      if ('$referrer' in data.properties) {
        data.properties.$referrer_host = data.properties.$referrer === '' ? '' : getHostname(data.properties.$referrer, defaultHost);
      }
      if (sd.para.preset_properties.latest_referrer && sd.para.preset_properties.latest_referrer_host) {
        data.properties.$latest_referrer_host = data.properties.$latest_referrer === '' ? '' : getHostname(data.properties.$latest_referrer, defaultHost);
      }
    }
  }
}

function addPropsHook(data) {
  var isNotProfileType = !data.type || data.type.slice(0, 7) !== 'profile';
  var isSatisfy = sd.para.preset_properties && isNotProfileType;
  if (isSatisfy && sd.para.preset_properties.url && typeof data.properties.$url === 'undefined') {
    data.properties.$url = getURL();
  }
  if (isSatisfy && sd.para.preset_properties.title && typeof data.properties.$title === 'undefined') {
    data.properties.$title = document.title;
  }
}

import initPara from '@/core/initPara'

function setInitVar() {
  sd._t = sd._t || 1 * new Date();
  sd.lib_version = sdkversion_placeholder;
  sd.is_first_visitor = false;
  sd.source_channel_standard = source_channel_standard;
}

function enableLocalLog() {
  if (_sessionStorage.isSupport()) {
    try {
      sessionStorage.setItem('sensorsdata_jssdk_debug', 'true');
    } catch (e) {
      sd.log('enableLocalLog error: ' + e.message);
    } 
  }
}

function disableLocalLog() {
  if (_sessionStorage.isSupport()) {
    sessionStorage.removeItem('sensorsdata_jssdk_debug');
  }
}


//  shang
function getPresetProperties() {
  function getUtm() {
    var utms = pageInfo.campaignParams();
    var $utms = {};
    each(utms, function(v, i, utms) {
      if ((' ' + sd.source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
        $utms['$' + i] = utms[i];
      } else {
        $utms[i] = utms[i];
      }
    });
    return $utms;
  }

  var obj = {
    $is_first_day: isNewUser(),
    $is_first_time: saNewUser.is_page_first_visited,
    $referrer: pageInfo.pageProp.referrer || '',
    $referrer_host: pageInfo.pageProp.referrer ? getHostname(pageInfo.pageProp.referrer) : '',
    $url: getURL(),
    $url_path: getURLPath(),
    $title: document.title || '',
    _distinct_id: store.getDistinctId(),
    identities: JSON.parse(JSON.stringify(store._state.identities))
  };
  var result = extend({}, pageInfo.properties(), sd.store.getProps(), getUtm(), obj);
  if (sd.para.preset_properties.latest_referrer && sd.para.preset_properties.latest_referrer_host) {
    result.$latest_referrer_host = result.$latest_referrer === '' ? '' : getHostname(result.$latest_referrer);
  }
  return result;
}

function iOSWebClickPolyfill() {
  var iOS_other_tags_css = '';
  var default_cursor_css = ' { cursor: pointer; -webkit-tap-highlight-color: rgba(0,0,0,0); }';
  if (sd.heatmap && isArray(sd.heatmap.otherTags)) {
    each(sd.heatmap.otherTags, function(val) {
      iOS_other_tags_css += val + default_cursor_css;
    });
  }
  if (isIOS() && getIOSVersion() && getIOSVersion() < 13) {
    if (sd.para.heatmap && sd.para.heatmap.collect_tags && sd.para.heatmap.collect_tags.div) {
      setCssStyle('div, [data-sensors-click]' + default_cursor_css);
    }
    if (sd.para.heatmap && sd.para.heatmap.track_attr) {
      setCssStyle('[' + sd.para.heatmap.track_attr.join('], [') + ']' + default_cursor_css);
    }
    if (iOS_other_tags_css !== '') {
      setCssStyle(iOS_other_tags_css);
    }
  }
}
var readyState = {
  state: 0,
  historyState: [],
  stateType: {
    1: '1-init未开始',
    2: '2-init开始',
    3: '3-store完成'
  },
  getState: function() {
    return this.historyState.join('\n');
  },
  setState: function(n) {
    if (String(n) in this.stateType) {
      this.state = n;
    }
    this.historyState.push(this.stateType[n]);
  }
};


function eventEmitterFacade(event_type, callback) {
  var splitEvent = [];
  if (typeof event_type === 'string' && event_type in ee.EVENT_LIST) {
    splitEvent = ee.EVENT_LIST[event_type];
    ee[splitEvent[0]].on(splitEvent[1], callback);
  }
}

export var functions = {
  __proto__: null,
  addReferrerHost: addReferrerHost,
  addPropsHook: addPropsHook,
  initPara: initPara,
  setInitVar: setInitVar,
  enableLocalLog: enableLocalLog,
  disableLocalLog: disableLocalLog,
  quick: quick,
  use: use,
  track: track,
  bind: bind,
  unbind: unbind,
  trackLink: trackLink,
  trackLinks: trackLinks,
  setItem: setItem,
  deleteItem: deleteItem,
  setProfile: setProfile,
  setOnceProfile: setOnceProfile,
  appendProfile: appendProfile,
  incrementProfile: incrementProfile,
  deleteProfile: deleteProfile,
  unsetProfile: unsetProfile,
  identify: identify,
  trackSignup: trackSignup,
  // 
  registerPage: registerPage,
  clearAllRegister: clearAllRegister,
  clearPageRegister: clearPageRegister,
  register: register,
  registerOnce: registerOnce,
  registerSession: registerSession,
  registerSessionOnce: registerSessionOnce,
  // 
  login: login,
  loginWithKey: loginWithKey,
  logout: logout,
  getPresetProperties: getPresetProperties,
  iOSWebClickPolyfill: iOSWebClickPolyfill,
  readyState: readyState,
  para_default: defaultPara,
  // 
  log: sdLog,
  debug: debug,
  IDENTITY_KEY: IDENTITY_KEY,
  on: eventEmitterFacade
};

export var saEmpty = {
  track: function(e, p, c) {},
  quick: function(name, p, t, c) {},
  register: function(obj) {},
  registerPage: function(obj) {},
  registerOnce: function(obj) {},
  clearAllRegister: function(arr) {},
  trackSignup: function(id, e, p, c) {},
  setProfile: function(prop, c) {},
  setOnceProfile: function(prop, c) {},
  appendProfile: function(prop, c) {},
  incrementProfile: function(prop, c) {},
  deleteProfile: function(c) {},
  unsetProfile: function(prop, c) {},
  identify: function(id, isSave) {},
  login: function(id, callback) {},
  logout: function(isChangeId) {},
  trackLink: function(link, event_name, event_prop) {},
  deleteItem: function(type, id) {},
  setItem: function(type, id, p) {},
  getAppStatus: function(func) {},
  clearPageRegister: function(arr) {}
};