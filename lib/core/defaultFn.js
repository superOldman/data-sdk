

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
import { logger } from "@/utils/debugger";
import { ry } from "@/utils/DomElementInfo";
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



