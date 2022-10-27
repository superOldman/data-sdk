import { addEvent$1 } from '@/Events/addEvent.js'


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
  if (saEvent.check({
    propertiesMust: p
  })) {
    saEvent.send({
      type: 'profile_set',
      properties: p
    },
      c
    );
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

function inherit(subclass, superclass) {
  subclass.prototype = new superclass();
  subclass.prototype.constructor = subclass;
  subclass.superclass = superclass.prototype;
  return subclass;
}


function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function () {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function () {
    var nowtime = now();
    if (!previous && options.leading === false) previous = nowtime;
    var remaining = wait - (nowtime - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = nowtime;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

function values(obj) {
  var results = [];
  if (obj == null) {
    return results;
  }
  each(obj, function (value) {
    results[results.length] = value;
  });
  return results;
}

function unique(arr) {
  var temp,
    n = [],
    o = {};
  for (var i = 0; i < arr.length; i++) {
    temp = arr[i];
    if (!(temp in o)) {
      o[temp] = true;
      n.push(temp);
    }
  }
  return n;
}

var ENC = {
  '+': '-',
  '/': '_',
  '=': '.'
};
var DEC = {
  '-': '+',
  _: '/',
  '.': '='
};

var urlSafeBase64 = {
  encode: function (base64) {
    return base64.replace(/[+/=]/g, function (m) {
      return ENC[m];
    });
  },

  decode: function (safe) {
    return safe.replace(/[-_.]/g, function (m) {
      return DEC[m];
    });
  },

  trim: function (string) {
    return string.replace(/[.=]{1,2}$/, '');
  },

  isBase64: function (string) {
    return /^[A-Za-z0-9+/]*[=]{0,2}$/.test(string);
  },

  isUrlSafeBase64: function (string) {
    return /^[A-Za-z0-9_-]*[.]{0,2}$/.test(string);
  }
};

import EventEmitter from '@/Events/EventEmitter.js'
import { addEvent, addHashEvent } from '@/Events/addEvent.js'
import { base64Decode, base64Encode, hashCode, hashCode53, strToUnicode } from "@/utils/encryption";
import { cookie } from '@/Storage/cookie.js'
import {
  _URL, UUID, bindReady,
  coverExtend, _decodeURI, _decodeURIComponent,
  dfmapping, each, encodeDates, extend, extend2Lev,
  filter, formatDate, formatJsonString, getCookieTopLevelDomain,
  getRandom, getRandomBasic, getUA, getURL, getURLPath, getURLSearchParams,
  hasAttribute, hasAttributes, indexOf,
  isArguments, isArray, isBoolean, isDate, isElement, isEmptyObject, isFunction, isHttpUrl, isIOS, isJSONString, isNumber, isObject, isString,
  isSupportBeaconSend, isSupportCors, isUndefined, map, now, safeJSONParse,
  toArray, trim
} from '@/utils/index'

import {
  getDomBySelector, getElementContent, getHostname, getIOSVersion,
  getQueryParam, getQueryParamsFromUrl, getScreenOrientation,
  listenPageState, loadScript, mediaQueriesSupported, removeScriptProtocol,
  rot13defs, rot13obfs, searchObjDate, setCssStyle
} from "@/utils/tools";

import { ajax, jsonp, xhr } from "@/service/serve";

import { _localStorage, _sessionStorage, ConcurrentStorage } from '@/Storage/storage'

import { urlParse } from '@/utils/URLParser'
import { logger } from "@/toolsFn/debugger";
import { ry } from "@/toolsFn/DomElementInfo";
export var W = {
  __proto__: null,
  ConcurrentStorage: ConcurrentStorage,
  EventEmitter: EventEmitter,
  URL: _URL,
  UUID: UUID,
  addEvent: addEvent,
  addHashEvent: addHashEvent,
  ajax: ajax,
  base64Decode: base64Decode,
  base64Encode: base64Encode,
  bindReady: bindReady,
  cookie: cookie,
  coverExtend: coverExtend,
  decodeURI: _decodeURI,
  decodeURIComponent: _decodeURIComponent,
  dfmapping: dfmapping,
  each: each,
  encodeDates: encodeDates,
  extend: extend,
  extend2Lev: extend2Lev,
  filter: filter,
  formatDate: formatDate,
  formatJsonString: formatJsonString,
  getCookieTopLevelDomain: getCookieTopLevelDomain,
  getDomBySelector: getDomBySelector,
  getElementContent: getElementContent,
  getHostname: getHostname,
  getIOSVersion: getIOSVersion,
  getQueryParam: getQueryParam,
  getQueryParamsFromUrl: getQueryParamsFromUrl,
  getRandom: getRandom,
  getRandomBasic: getRandomBasic,
  getScreenOrientation: getScreenOrientation,
  getUA: getUA,
  getURL: getURL,
  getURLPath: getURLPath,
  getURLSearchParams: getURLSearchParams,
  hasAttribute: hasAttribute,
  hasAttributes: hasAttributes,
  hashCode: hashCode,
  hashCode53: hashCode53,
  indexOf: indexOf,
  inherit: inherit,
  isArguments: isArguments,
  isArray: isArray,
  isBoolean: isBoolean,
  isDate: isDate,
  isElement: isElement,
  isEmptyObject: isEmptyObject,
  isFunction: isFunction,
  isHttpUrl: isHttpUrl,
  isIOS: isIOS,
  isJSONString: isJSONString,
  isNumber: isNumber,
  isObject: isObject,
  isString: isString,
  isSupportBeaconSend: isSupportBeaconSend,
  isSupportCors: isSupportCors,
  isUndefined: isUndefined,
  jsonp: jsonp,
  listenPageState: listenPageState,
  loadScript: loadScript,
  localStorage: _localStorage,
  logger: logger,
  map: map,
  mediaQueriesSupported: mediaQueriesSupported,
  now: now,
  removeScriptProtocol: removeScriptProtocol,
  rot13defs: rot13defs,
  rot13obfs: rot13obfs,
  ry: ry,
  safeJSONParse: safeJSONParse,
  searchObjDate: searchObjDate,
  sessionStorage: _sessionStorage,
  setCssStyle: setCssStyle,
  strToUnicode: strToUnicode,
  throttle: throttle,
  toArray: toArray,
  trim: trim,
  unique: unique,
  urlParse: urlParse,
  urlSafeBase64: urlSafeBase64,
  values: values,
  xhr: xhr
};



