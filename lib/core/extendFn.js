import commonWays from '@/core/commonWays'
import { saNewUser } from '@/saNewUser'
import initPara from '@/core/initPara'
import { isObject, isFunction, isString,isArray,isIOS,isEmptyObject, getURL, getURLPath,each, UUID, extend } from '@/utils/index'

import { addEvent$1 } from '@/Events/addEvent.js'
import saEvent from '@/Events/saEvent'
import { source_channel_standard, sdkversion_placeholder } from '@/constant'
import ee from '@/Events/ee'
import { _localStorage, _sessionStorage } from '@/Storage/storage'


import { getHostname } from "@/utils/tools";
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
    each(utms, function (v, i, utms) {
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
    each(sd.heatmap.otherTags, function (val) {
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
  getState: function () {
    return this.historyState.join('\n');
  },
  setState: function (n) {
    if (String(n) in this.stateType) {
      this.state = n;
    }
    this.historyState.push(this.stateType[n]);
  }
};


export function eventEmitterFacade(event_type, callback) {
  var splitEvent = [];
  if (typeof event_type === 'string' && event_type in ee.EVENT_LIST) {
    splitEvent = ee.EVENT_LIST[event_type];
    ee[splitEvent[0]].on(splitEvent[1], callback);
  }
}




export function quick() {
  var arg = Array.prototype.slice.call(arguments);
  var arg0 = arg[0];
  var arg1 = arg.slice(1);
  if (typeof arg0 === 'string' && commonWays[arg0]) {
    return commonWays[arg0].apply(commonWays, arg1);
  } else if (typeof arg0 === 'function') {
    arg0.apply(sd, arg1);
  } else {
    sd.log('quick方法中没有这个功能' + arg[0]);
  }
}

export function use(name, option) {
  if (!isString(name)) {
    sd.log('use插件名称必须是字符串！');
    return false;
  }

  if (isObject(window.SensorsDataWebJSSDKPlugin) && isObject(window.SensorsDataWebJSSDKPlugin[name]) && isFunction(window.SensorsDataWebJSSDKPlugin[name].init)) {
    window.SensorsDataWebJSSDKPlugin[name].init(sd, option);
    return window.SensorsDataWebJSSDKPlugin[name];
  } else if (isObject(sd.modules) && isObject(sd.modules[name]) && isFunction(sd.modules[name].init)) {
    sd.modules[name].init(sd, option);
    return sd.modules[name];
  } else {
    sd.log(name + '没有获取到,请查阅文档，调整' + name + '的引入顺序！');
  }
}

export function track(e, p, c) {
  if (saEvent.check({
    event: e,
    properties: p
  })) {
    saEvent.send({
      type: 'track',
      event: e,
      properties: p
    },
      c
    );
  }
}

export function bind(itemName, itemValue) {
  if (!saEvent.check({
    bindKey: itemName,
    bindValue: itemValue
  })) {
    return false;
  }

  sd.store._state.identities[itemName] = itemValue;
  sd.store.save();

  saEvent.send({
    type: 'track_id_bind',
    event: '$BindID',
    properties: {}
  });
}

export function unbind(itemName, itemValue) {
  if (!saEvent.check({
    unbindKey: itemName,
    bindValue: itemValue
  })) {
    return false;
  }

  if (isObject(sd.store._state.identities) && sd.store._state.identities.hasOwnProperty(itemName) && sd.store._state.identities[itemName] === itemValue) {
    var loginID = sd.store.getUnionId().login_id;
    if (loginID && itemName + '+' + itemValue === loginID) {
      sd.store._state.distinct_id = sd.store._state.first_id;
      sd.store._state.first_id = '';
      sd.store.set('history_login_id', {
        name: '',
        value: ''
      });
    }

    if (itemName !== '$identity_cookie_id') {
      delete sd.store._state.identities[itemName];
      sd.store.save();
    }
  }

  var identities = {};
  identities[itemName] = itemValue;

  saEvent.send({
    identities: identities,
    type: 'track_id_unbind',
    event: '$UnbindID',
    properties: {}
  });
}

export function trackLink(link, event_name, event_prop) {
  function _trackLink(obj, event_name, event_prop) {
    obj = obj || {};
    var link = null;
    if (obj.ele) {
      link = obj.ele;
    }
    if (obj.event) {
      if (obj.target) {
        link = obj.target;
      } else {
        link = obj.event.target;
      }
    }

    event_prop = event_prop || {};
    if (!link || typeof link !== 'object') {
      return false;
    }
    if (!link.href || /^javascript/.test(link.href) || link.target || link.download || link.onclick) {
      sd.track(event_name, event_prop);
      return false;
    }

    function linkFunc(e) {
      e.stopPropagation();
      e.preventDefault();
      var hasCalled = false;

      function track_a_click() {
        if (!hasCalled) {
          hasCalled = true;
          location.href = link.href;
        }
      }
      setTimeout(track_a_click, 1000);
      sd.track(event_name, event_prop, track_a_click);
    }
    if (obj.event) {
      linkFunc(obj.event);
    }
    if (obj.ele) {
      addEvent$1(obj.ele, 'click', function (e) {
        linkFunc(e);
      });
    }
  }

  if (typeof link === 'object' && link.tagName) {
    _trackLink({
      ele: link
    }, event_name, event_prop);
  } else if (typeof link === 'object' && link.target && link.event) {
    _trackLink(link, event_name, event_prop);
  }
}

export function trackLinks(link, event_name, event_prop) {
  event_prop = event_prop || {};
  if (!link || typeof link !== 'object') {
    return false;
  }
  if (!link.href || /^javascript/.test(link.href) || link.target) {
    return false;
  }
  addEvent$1(link, 'click', function (e) {
    e.preventDefault();
    var hasCalled = false;
    setTimeout(track_a_click, 1000);

    function track_a_click() {
      if (!hasCalled) {
        hasCalled = true;
        location.href = link.href;
      }
    }
    sd.track(event_name, event_prop, track_a_click);
  });
}

export function setItem(type, id, p) {
  if (saEvent.check({
    item_type: type,
    item_id: id,
    properties: p
  })) {
    saEvent.sendItem({
      type: 'item_set',
      item_type: type,
      item_id: id,
      properties: p || {}
    });
  }
}

export function deleteItem(type, id) {
  if (saEvent.check({
    item_type: type,
    item_id: id
  })) {
    saEvent.sendItem({
      type: 'item_delete',
      item_type: type,
      item_id: id
    });
  }
}

export function setProfile(p, c) {
  if (saEvent.check({ propertiesMust: p })) {
    saEvent.send({
      type: 'profile_set',
      properties: p
    }, c);
  }
}

export function setOnceProfile(p, c) {
  if (saEvent.check({
    propertiesMust: p
  })) {
    saEvent.send({
      type: 'profile_set_once',
      properties: p
    },
      c
    );
  }
}

export function appendProfile(p, c) {
  if (saEvent.check({
    propertiesMust: p
  })) {
    each(p, function (value, key) {
      if (isString(value)) {
        p[key] = [value];
      } else if (isArray(value)) {
        p[key] = value;
      } else {
        delete p[key];
        sd.log('appendProfile属性的值必须是字符串或者数组');
      }
    });
    if (!isEmptyObject(p)) {
      saEvent.send({
        type: 'profile_append',
        properties: p
      },
        c
      );
    }
  }
}

export function incrementProfile(p, c) {
  var str = p;
  if (isString(p)) {
    p = {};
    p[str] = 1;
  }

  function isChecked(p) {
    for (var i in p) {
      if (Object.prototype.hasOwnProperty.call(p, i) && !/-*\d+/.test(String(p[i]))) {
        return false;
      }
    }
    return true;
  }

  if (saEvent.check({
    propertiesMust: p
  })) {
    if (isChecked(p)) {
      saEvent.send({
        type: 'profile_increment',
        properties: p
      },
        c
      );
    } else {
      sd.log('profile_increment的值只能是数字');
    }
  }
}

export function deleteProfile(c) {
  saEvent.send({
    type: 'profile_delete'
  },
    c
  );
  store.set('distinct_id', UUID());
  store.set('first_id', '');
}

export function unsetProfile(p, c) {
  var str = p;
  var temp = {};
  if (isString(p)) {
    p = [];
    p.push(str);
  }
  if (isArray(p)) {
    each(p, function (v) {
      if (isString(v)) {
        temp[v] = true;
      } else {
        sd.log('profile_unset给的数组里面的值必须时string,已经过滤掉', v);
      }
    });
    saEvent.send({
      type: 'profile_unset',
      properties: temp
    },
      c
    );
  } else {
    sd.log('profile_unset的参数是数组');
  }
}

export function identify(id, isSave) {
  if (typeof id === 'number') {
    id = String(id);
  }

  function saveIdentities(id) {
    sd.store._state.identities.$identity_anonymous_id = id;
    sd.store.save();
  }

  var firstId = store.getFirstId();
  if (typeof id === 'undefined') {
    var uuid = UUID();
    if (firstId) {
      store.set('first_id', uuid);
    } else {
      store.set('distinct_id', uuid);
    }
    saveIdentities(uuid);
  } else if (saEvent.check({
    distinct_id: id
  })) {
    if (isSave === true) {
      if (firstId) {
        store.set('first_id', id);
      } else {
        store.set('distinct_id', id);
      }
    } else {
      if (firstId) {
        store.change('first_id', id);
      } else {
        store.change('distinct_id', id);
      }
    }
    saveIdentities(id);
  }
}

export function sendSignup(id, e, p, c) {
  var original_id = store.getFirstId() || store.getDistinctId();
  store.set('distinct_id', id);
  saEvent.send({
    original_id: original_id,
    distinct_id: sd.store.getDistinctId(),
    type: 'track_signup',
    event: e,
    properties: p
  },
    c
  );
}

export function trackSignup(id, e, p, c) {
  if (typeof id === 'number') {
    id = String(id);
  }
  if (saEvent.check({
    distinct_id: id,
    event: e,
    properties: p
  })) {
    sendSignup(id, e, p, c);
  }
}

import {
  registerPage, clearAllRegister,
  clearPageRegister, register, registerOnce,
  registerSession, registerSessionOnce,
} from "@/utils/register";

import { login, loginWithKey, logout } from '@/utils/login'

import { defaultPara } from '@/core/initPara'
import { sdLog, debug } from '@/utils/debugger'

import { IDENTITY_KEY } from '@/constant'
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
  track: function (e, p, c) { },
  quick: function (name, p, t, c) { },
  register: function (obj) { },
  registerPage: function (obj) { },
  registerOnce: function (obj) { },
  clearAllRegister: function (arr) { },
  trackSignup: function (id, e, p, c) { },
  setProfile: function (prop, c) { },
  setOnceProfile: function (prop, c) { },
  appendProfile: function (prop, c) { },
  incrementProfile: function (prop, c) { },
  deleteProfile: function (c) { },
  unsetProfile: function (prop, c) { },
  identify: function (id, isSave) { },
  login: function (id, callback) { },
  logout: function (isChangeId) { },
  trackLink: function (link, event_name, event_prop) { },
  deleteItem: function (type, id) { },
  setItem: function (type, id, p) { },
  getAppStatus: function (func) { },
  clearPageRegister: function (arr) { }
};