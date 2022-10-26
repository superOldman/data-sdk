export function isFunction(arg) {
  if (!arg) {
    return false;
  }
  var type = Object.prototype.toString.call(arg);
  return type == '[object Function]' || type == '[object AsyncFunction]';
}

export function now() {
  if (Date.now && isFunction(Date.now)) {
    return Date.now();
  }
  return new Date().getTime();
}

export function isObject(arg) {
  if (arg == null) {
    return false;
  } else {
    return Object.prototype.toString.call(arg) == '[object Object]';
  }
}

var getRandomBasic = (function () {
  var today = new Date();
  var seed = today.getTime();

  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
  }
  return function rand(number) {
    return Math.ceil(rnd() * number);
  };
})();

export getRandomBasic


export function getRandom() {
  if (typeof Uint32Array === 'function') {
    var cry = '';
    if (typeof crypto !== 'undefined') {
      cry = crypto;
    } else if (typeof msCrypto !== 'undefined') {
      cry = msCrypto;
    }
    if (isObject(cry) && cry.getRandomValues) {
      var typedArray = new Uint32Array(1);
      var randomNumber = cry.getRandomValues(typedArray)[0];
      var integerLimit = Math.pow(2, 32);
      return randomNumber / integerLimit;
    }
  }
  return getRandomBasic(10000000000000000000) / 10000000000000000000;
}

export function safeJSONParse(str) {
  var val = null;
  try {
    val = JSON.parse(str);
  } catch (e) { }
  return val;
}


export function isValidListener(listener) {
  if (typeof listener === 'function') {
    return true;
  } else if (listener && typeof listener === 'object') {
    return isValidListener(listener.listener);
  } else {
    return false;
  }
}

export function _decodeURIComponent(uri) {
  var result = uri;
  try {
    result = decodeURIComponent(uri);
  } catch (e) {
    result = uri;
  }
  return result;
}

export function getURLSearchParams(queryString) {
  queryString = queryString || '';
  var args = {};
  var query = queryString.substring(1);
  var pairs = query.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pos = pairs[i].indexOf('=');
    if (pos === -1) continue;
    var name = pairs[i].substring(0, pos);
    var value = pairs[i].substring(pos + 1);
    name = _decodeURIComponent(name);
    value = _decodeURIComponent(value);
    args[name] = value;
  }
  return args;
}
export function isString(arg) {
  return Object.prototype.toString.call(arg) == '[object String]';
}
export function trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}
export function _URL(url) {
  var result = {};
  var isURLAPIWorking = function () {
    var url;
    try {
      url = new URL('http://modernizr.com/');
      return url.href === 'http://modernizr.com/';
    } catch (e) {
      return false;
    }
  };
  if (typeof window.URL === 'function' && isURLAPIWorking()) {
    result = new URL(url);
    if (!result.searchParams) {
      result.searchParams = (function () {
        var params = getURLSearchParams(result.search);
        return {
          get: function (searchParam) {
            return params[searchParam];
          }
        };
      })();
    }
  } else {
    if (!isString(url)) {
      url = String(url);
    }
    url = trim(url);
    var _regex = /^https?:\/\/.+/;
    if (_regex.test(url) === false) {
      logger.log('Invalid URL');
      return;
    }
    var instance = urlParse(url);
    result.hash = instance._values.Fragment;
    result.host = instance._values.Host ? instance._values.Host + (instance._values.Port ? ':' + instance._values.Port : '') : '';
    result.href = instance._values.URL;
    result.password = instance._values.Password;
    result.pathname = instance._values.Path;
    result.port = instance._values.Port;
    result.search = instance._values.QueryString ? '?' + instance._values.QueryString : '';
    result.username = instance._values.Username;
    result.hostname = instance._values.Hostname;
    result.protocol = instance._values.Protocol ? instance._values.Protocol + ':' : '';
    result.origin = instance._values.Origin ? instance._values.Origin + (instance._values.Port ? ':' + instance._values.Port : '') : '';
    result.searchParams = (function () {
      var params = getURLSearchParams('?' + instance._values.QueryString);
      return {
        get: function (searchParam) {
          return params[searchParam];
        }
      };
    })();
  }
  return result;
}
export var UUID = (function () {
  var T = function () {
    var d = 1 * new Date(),
      i = 0;
    while (d == 1 * new Date()) {
      i++;
    }
    return d.toString(16) + i.toString(16);
  };
  var R = function () {
    return getRandom().toString(16).replace('.', '');
  };
  var UA = function () {
    var ua = navigator.userAgent,
      i,
      ch,
      buffer = [],
      ret = 0;

    function xor(result, byte_array) {
      var j,
        tmp = 0;
      for (j = 0; j < byte_array.length; j++) {
        tmp |= buffer[j] << (j * 8);
      }
      return result ^ tmp;
    }

    for (i = 0; i < ua.length; i++) {
      ch = ua.charCodeAt(i);
      buffer.unshift(ch & 0xff);
      if (buffer.length >= 4) {
        ret = xor(ret, buffer);
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      ret = xor(ret, buffer);
    }

    return ret.toString(16);
  };

  return function () {
    var se = String(screen.height * screen.width);
    if (se && /\d{5,}/.test(se)) {
      se = se.toString(16);
    } else {
      se = String(getRandom() * 31242)
        .replace('.', '')
        .slice(0, 8);
    }
    var val = T() + '-' + R() + '-' + UA() + '-' + se + '-' + T();
    if (val) {
      return val;
    } else {
      return (String(getRandom()) + String(getRandom()) + String(getRandom())).slice(2, 15);
    }
  };
})();
export function isElement(arg) {
  return !!(arg && arg.nodeType === 1);
}
export function isUndefined(arg) {
  return arg === void 0;
}
export function isArray(arg) {
  if (Array.isArray && isFunction(isArray)) {
    return Array.isArray(arg);
  }
  return Object.prototype.toString.call(arg) === '[object Array]';
}
export function siblings(n, elem) {
  var matched = [];

  for (; n; n = n.nextSibling) {
    if (n.nodeType === 1 && n !== elem) {
      matched.push(n);
    }
  }

  return matched;
}; 

export function xhr(cors) {
  if (cors) {
    if (typeof window.XMLHttpRequest !== 'undefined' && 'withCredentials' in new XMLHttpRequest()) {
      return new XMLHttpRequest();
    } else if (typeof XDomainRequest !== 'undefined') {
      return new XDomainRequest();
    } else {
      return null;
    }
  } else {
    if (typeof window.XMLHttpRequest !== 'undefined') {
      return new XMLHttpRequest();
    }
    if (window.ActiveXObject) {
      try {
        return new ActiveXObject('Msxml2.XMLHTTP');
      } catch (d) {
        try {
          return new ActiveXObject('Microsoft.XMLHTTP');
        } catch (d) {
          logger.log(d);
        }
      }
    }
  }
}

var nativeForEach = Array.prototype.forEach;
var hasOwnProperty$2 = Object.prototype.hasOwnProperty;


export function each(obj, iterator, context) {
  if (obj == null) {
    return false;
  }
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (isArray(obj)) {
    for (var i = 0, l = obj.length; i < l; i++) {
      i in obj && iterator.call(context, obj[i], i, obj);
    }
  } else {
    for (var key in obj) {
      if (hasOwnProperty$2.call(obj, key)) {
        iterator.call(context, obj[key], key, obj);
      }
    }
  }
}


var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

export function extend(obj) {
  each(Array.prototype.slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (hasOwnProperty$1.call(source, prop) && source[prop] !== void 0) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}
export function ajax(para) {
  para.timeout = para.timeout || 20000;

  para.credentials = typeof para.credentials === 'undefined' ? true : para.credentials;

  function getJSON(data) {
    if (!data) {
      return '';
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }

  var g = xhr(para.cors);

  if (!g) {
    return false;
  }

  if (!para.type) {
    para.type = para.data ? 'POST' : 'GET';
  }
  para = extend({
      success: function() {},
      error: function() {}
    },
    para
  );

  var oldsuccess = para.success;
  var olderror = para.error;
  var errorTimer;

  function abort() {
    try {
      if (g && typeof g === 'object' && g.abort) {
        g.abort();
      }
    } catch (error) {
      logger.log(error);
    }

    if (errorTimer) {
      clearTimeout(errorTimer);
      errorTimer = null;
      para.error && para.error();
      g.onreadystatechange = null;
      g.onload = null;
      g.onerror = null;
    }
  }

  para.success = function(data) {
    oldsuccess(data);
    if (errorTimer) {
      clearTimeout(errorTimer);
      errorTimer = null;
    }
  };
  para.error = function(err) {
    olderror(err);
    if (errorTimer) {
      clearTimeout(errorTimer);
      errorTimer = null;
    }
  };
  errorTimer = setTimeout(function() {
    abort();
  }, para.timeout);

  if (typeof XDomainRequest !== 'undefined' && g instanceof XDomainRequest) {
    g.onload = function() {
      para.success && para.success(getJSON(g.responseText));
      g.onreadystatechange = null;
      g.onload = null;
      g.onerror = null;
    };
    g.onerror = function() {
      para.error && para.error(getJSON(g.responseText), g.status);
      g.onreadystatechange = null;
      g.onerror = null;
      g.onload = null;
    };
  }
  g.onreadystatechange = function() {
    try {
      if (g.readyState == 4) {
        if ((g.status >= 200 && g.status < 300) || g.status == 304) {
          para.success(getJSON(g.responseText));
        } else {
          para.error(getJSON(g.responseText), g.status);
        }
        g.onreadystatechange = null;
        g.onload = null;
      }
    } catch (e) {
      g.onreadystatechange = null;
      g.onload = null;
    }
  };

  g.open(para.type, para.url, true);

  try {
    if (para.credentials) {
      g.withCredentials = true;
    }
    if (isObject(para.header)) {
      each(para.header, function(v, i) {
        g.setRequestHeader && g.setRequestHeader(i, v);
      });
    }

    if (para.data) {
      if (!para.cors) {
        g.setRequestHeader && g.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      }
      if (para.contentType === 'application/json') {
        g.setRequestHeader && g.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
      } else {
        g.setRequestHeader && g.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      }
    }
  } catch (e) {
    logger.log(e);
  }

  g.send(para.data || null);
}
export function map(obj, iterator) {
  var results = [];
  if (obj == null) {
    return results;
  }
  if (Array.prototype.map && obj.map === Array.prototype.map) {
    return obj.map(iterator);
  }
  each(obj, function(value, index, list) {
    results.push(iterator(value, index, list));
  });
  return results;
}

export function base64Decode(str) {
  var arr = [];
  try {
    arr = map(atob(str).split(''), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    });
  } catch (e) {
    arr = [];
  }

  try {
    return decodeURIComponent(arr.join(''));
  } catch (e) {
    return arr.join('');
  }
}
export function base64Encode(str) {
  var result = '';
  try {
    result = btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
      })
    );
  } catch (e) {
    result = str;
  }
  return result;
}
export function bindReady(fn, win) {
  win = win || window;
  var done = false,
    top = true,
    doc = win.document,
    root = doc.documentElement,
    modern = doc.addEventListener,
    add = modern ? 'addEventListener' : 'attachEvent',
    rem = modern ? 'removeEventListener' : 'detachEvent',
    pre = modern ? '' : 'on',
    init = function(e) {
      if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
      (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
      if (!done && (done = true)) fn.call(win, e.type || e);
    },
    poll = function() {
      try {
        root.doScroll('left');
      } catch (e) {
        setTimeout(poll, 50);
        return;
      }
      init('poll');
    };

  if (doc.readyState == 'complete') fn.call(win, 'lazy');
  else {
    if (!modern && root.doScroll) {
      try {
        top = !win.frameElement;
      } catch (e) {
        logger.log(e);
      }
      if (top) poll();
    }
    doc[add](pre + 'DOMContentLoaded', init, false);
    doc[add](pre + 'readystatechange', init, false);
    win[add](pre + 'load', init, false);
  }
}
export function coverExtend(obj) {
  each(Array.prototype.slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (source[prop] !== void 0 && obj[prop] === void 0) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}
export function _decodeURI(uri) {
  var result = uri;
  try {
    result = decodeURI(uri);
  } catch (e) {
    result = uri;
  }
  return result;
}

function strip_sa_properties(p) {
  if (!isObject(p)) {
    return p;
  }
  each(p, function(v, k) {
    if (isArray(v)) {
      var temp = [];
      each(v, function(arrv) {
        if (isString(arrv)) {
          temp.push(arrv);
        } else {
          sdLog('您的数据-', k, v, '的数组里的值必须是字符串,已经将其删除');
        }
      });
      p[k] = temp;
    }
    if (!(isString(v) || isNumber(v) || isDate(v) || isBoolean(v) || isArray(v) || isFunction(v) || k === '$option')) {
      sdLog('您的数据-', k, v, '-格式不满足要求，我们已经将其删除');
      delete p[k];
    }
  });
  return p;
}

function formatString(str, maxLen) {
  if (isNumber(maxLen) && str.length > maxLen) {
    sdLog('字符串长度超过限制，已经做截取--' + str);
    return str.slice(0, maxLen);
  } else {
    return str;
  }
}



function formatProperties(p) {
  each(p, function(val, key) {
    var onComplete = function(status, value, rule_type) {
      if (!status && rule_type !== 'keyLength') {
        delete p[key];
      }
      return true;
    };
    check({
      propertyKey: key
    }, onComplete);
  });
}

function formatItem(data) {
  if ('item_type' in data) {
    var item_type = data['item_type'];

    var typeOnComplete = function(status) {
      if (!status) {
        delete data['item_type'];
      }
      return true;
    };

    check({
      item_type: item_type
    }, typeOnComplete);
  }
  if ('item_id' in data) {
    var item_id = data['item_id'];
    var idOnComplete = function(status, val, rule) {
      if (!status && rule === 'string') {
        delete data['item_id'];
      }
      return true;
    };
    check({
      item_id: item_id
    }, idOnComplete);
  }
}

function searchZZAppStyle(data) {
  if (typeof data.properties.$project !== 'undefined') {
    data.project = data.properties.$project;
    delete data.properties.$project;
  }
  if (typeof data.properties.$token !== 'undefined') {
    data.token = data.properties.$token;
    delete data.properties.$token;
  }
}

function searchObjString(o) {
  var white_list = ['$element_selector', '$element_path'];
  var infinite_list = ['sensorsdata_app_visual_properties'];
  if (isObject(o)) {
    each(o, function(a, b) {
      if (isObject(a)) {
        searchObjString(o[b]);
      } else {
        if (isString(a)) {
          if (indexOf(infinite_list, b) > -1) {
            return;
          }
          o[b] = formatString(a, indexOf(white_list, b) > -1 ? 1024 : sdPara.max_string_length);
        }
      }
    });
  }
}

function filterReservedProperties(obj) {
  var reservedFields = ['distinct_id', 'user_id', 'id', 'date', 'datetime', 'event', 'events', 'first_id', 'original_id', 'device_id', 'properties', 'second_id', 'time', 'users'];
  if (!isObject(obj)) {
    return;
  }
  each(reservedFields, function(key, index) {
    if (!(key in obj)) {
      return;
    }
    if (index < 3) {
      delete obj[key];
      sdLog('您的属性- ' + key + '是保留字段，我们已经将其删除');
    } else {
      sdLog('您的属性- ' + key + '是保留字段，请避免其作为属性名');
    }
  });
}

export function formatData(data) {
  var p = data.properties;

  if (isObject(p)) {
    strip_sa_properties(p);

    filterReservedProperties(p);

    searchZZAppStyle(data);

    formatProperties(p);

    searchObjString(p);
  } else if ('properties' in data) {
    data.properties = {};
  }

  searchObjDate(data);

  formatItem(data);
}
export function isDate(arg) {
  return Object.prototype.toString.call(arg) == '[object Date]';
}
export function formatDate(date) {
  function pad(n) {
    return n < 10 ? '0' + n : n;
  }
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()) + '.' + pad(date.getMilliseconds());
}
export function dfmapping(str) {
  var dfk = 't6KJCZa5pDdQ9khoEM3Tj70fbP2eLSyc4BrsYugARqFIw1mzlGNVXOHiWvxUn8';
  var len = dfk.length - 1;
  var relation = {};
  var i = 0;
  for (i = 0; i < dfk.length; i++) {
    relation[dfk.charAt(i)] = dfk.charAt(len - i);
  }
  var newStr = '';
  for (i = 0; i < str.length; i++) {
    if (str.charAt(i) in relation) {
      newStr += relation[str.charAt(i)];
    } else {
      newStr += str.charAt(i);
    }
  }
  return newStr;
}


export function isHttpUrl(str) {
  if (typeof str !== 'string') return false;
  var _regex = /^https?:\/\/.+/;
  if (_regex.test(str) === false) {
    logger.log('Invalid URL');
    return false;
  }
  return true;
}
export function isEmptyObject(arg) {
  if (isObject(arg)) {
    for (var key in arg) {
      if (Object.prototype.hasOwnProperty.call(arg, key)) {
        return false;
      }
    }
    return true;
  }
  return false;
}
export function isIOS() {
  return !!navigator.userAgent.match(/iPhone|iPad|iPod/i);
}
export function isJSONString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
export function isNumber(arg) {
  return Object.prototype.toString.call(arg) == '[object Number]' && /[\d\.]+/.test(String(arg));
}
export function isSupportBeaconSend() {
  var supported = false;
  if (typeof navigator !== 'object' || typeof navigator.sendBeacon !== 'function') {
    return supported;
  }

  var Sys = getUA();
  var ua = navigator.userAgent.toLowerCase();
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    var reg = /os [\d._]*/gi;
    var verinfo = ua.match(reg);
    var version = (verinfo + '').replace(/[^0-9|_.]/gi, '').replace(/_/gi, '.');
    var ver = version.split('.');
    if (typeof Sys.safari === 'undefined') {
      Sys.safari = ver[0];
    }
    if (ver[0] && (Sys.qqBuildinBrowser || Sys.qqBrowser)) {
      supported = false;
    } else if (ver[0] && ver[0] < 13) {
      if (Sys.chrome > 41 || Sys.firefox > 30 || Sys.opera > 25 || Sys.safari > 12) {
        supported = true;
      }
    } else if (Sys.chrome > 41 || Sys.firefox > 30 || Sys.opera > 25 || Sys.safari > 11.3) {
      supported = true;
    }
  } else {
    if (Sys.chrome > 38 || Sys.edge > 13 || Sys.firefox > 30 || Sys.opera > 25 || Sys.safari > 11.0) {
      supported = true;
    }
  }
  return supported;
}


var logFn;
export var logger = {
  setup: function(logger) {
    logFn = logger;
  },
  log: function() {
    (logFn || (console && console.log) || function() {}).apply(null, arguments);
  }
};

export function isArguments(arg) {
  return !!(arg && hasOwnProperty.call(arg, 'callee'));
}


export function isBoolean(arg) {
  return Object.prototype.toString.call(arg) == '[object Boolean]';
}

export function filter(arr, fn, context) {
  var hasOwn = Object.prototype.hasOwnProperty;
  if (arr.filter) {
    return arr.filter(fn);
  }
  var ret = [];
  for (var i = 0; i < arr.length; i++) {
    if (!hasOwn.call(arr, i)) {
      continue;
    }
    var val = arr[i];
    if (fn.call(context, val, i, arr)) {
      ret.push(val);
    }
  }
  return ret;
}
export function extend2Lev(obj) {
  each(Array.prototype.slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (source[prop] !== void 0) {
        if (isObject(source[prop]) && isObject(obj[prop])) {
          extend(obj[prop], source[prop]);
        } else {
          obj[prop] = source[prop];
        }
      }
    }
  });
  return obj;
}
export function encodeDates(obj) {
  each(obj, function(v, k) {
    if (isDate(v)) {
      obj[k] = formatDate(v);
    } else if (isObject(v)) {
      obj[k] = encodeDates(v);
    }
  });
  return obj;
}

export function formatJsonString(obj) {
  try {
    return JSON.stringify(obj, null, '  ');
  } catch (e) {
    return JSON.stringify(obj);
  }
}


export function getSafeHostname(hostname) {
  if (typeof hostname === 'string' && hostname.match(/^[a-zA-Z0-9\u4e00-\u9fa5\-\.]+$/)) {
    return hostname;
  } else {
    return '';
  }
}

export function getCookieTopLevelDomain(hostname, testFlag) {
  hostname = hostname || location.hostname;
  testFlag = testFlag || 'domain_test';

  var new_hostname = getSafeHostname(hostname);

  var splitResult = new_hostname.split('.');
  if (isArray(splitResult) && splitResult.length >= 2 && !/^(\d+\.)+\d+$/.test(new_hostname)) {
    var domainStr = '.' + splitResult.splice(splitResult.length - 1, 1);
    while (splitResult.length > 0) {
      domainStr = '.' + splitResult.splice(splitResult.length - 1, 1) + domainStr;
      document.cookie = testFlag + '=true; path=/; domain=' + domainStr;

      if (document.cookie.indexOf(testFlag + '=true') !== -1) {
        var nowDate = new Date();
        nowDate.setTime(nowDate.getTime() - 1000);

        document.cookie = testFlag + '=true; expires=' + nowDate.toGMTString() + '; path=/; SameSite=Lax; domain=' + domainStr;

        return domainStr;
      }
    }
  }
  return '';
}

export function indexOf(arr, target) {
  var indexof = arr.indexOf;
  if (indexof) {
    return indexof.call(arr, target);
  } else {
    for (var i = 0; i < arr.length; i++) {
      if (target === arr[i]) {
        return i;
      }
    }
    return -1;
  }
}

export function getUA() {
  var Sys = {};
  var ua = navigator.userAgent.toLowerCase();
  var s;
  if ((s = ua.match(/ qq\/([\d.]+)/))) {
    Sys.qqBuildinBrowser = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/mqqbrowser\/([\d.]+)/))) {
    Sys.qqBrowser = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/opera.([\d.]+)/))) {
    Sys.opera = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/msie ([\d.]+)/))) {
    Sys.ie = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/edge.([\d.]+)/))) {
    Sys.edge = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/firefox\/([\d.]+)/))) {
    Sys.firefox = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/chrome\/([\d.]+)/))) {
    Sys.chrome = Number(s[1].split('.')[0]);
  } else if ((s = ua.match(/version\/([\d.]+).*safari/))) {
    Sys.safari = Number(s[1].match(/^\d*.\d*/));
  } else if ((s = ua.match(/trident\/([\d.]+)/))) {
    Sys.ie = 11;
  }
  return Sys;
}

export function getURL(url) {
  if (isString(url)) {
    url = trim(url);
    return _decodeURI(url);
  } else {
    return _decodeURI(location.href);
  }
}

export function getURLPath(url_path) {
  if (isString(url_path)) {
    url_path = trim(url_path);
    return _decodeURI(url_path);
  } else {
    return _decodeURI(location.pathname);
  }
}

export function hasAttribute(ele, attrName) {
  if (ele.hasAttribute) {
    return ele.hasAttribute(attrName);
  } else if (ele.attributes) {
    return !!(ele.attributes[attrName] && ele.attributes[attrName].specified);
  }
}

export function hasAttributes(ele, attrNames) {
  if (typeof attrNames === 'string') {
    return hasAttribute(ele, attrNames);
  } else if (isArray(attrNames)) {
    var result = false;
    for (var i = 0; i < attrNames.length; i++) {
      var testResult = hasAttribute(ele, attrNames[i]);
      if (testResult) {
        result = true;
        break;
      }
    }
    return result;
  }
}

export function hashCode(str) {
  if (typeof str !== 'string') {
    return 0;
  }
  var hash = 0;
  var char = null;
  if (str.length == 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

export function hashCode53(str) {
  var max53 = 9007199254740992;
  var min53 = -9007199254740992;
  var factor = 31;
  var hash = 0;
  if (str.length > 0) {
    var val = str.split('');
    for (var i = 0; i < val.length; i++) {
      var aVal = val[i].charCodeAt();
      var nextHash = factor * hash + aVal;
      if (nextHash > max53) {
        hash = min53 + hash;
        while (((nextHash = factor * hash + aVal), nextHash < min53)) {
          hash = hash / 2 + aVal;
        }
      }
      if (nextHash < min53) {
        hash = max53 + hash;
        while (((nextHash = factor * hash + aVal), nextHash > max53)) {
          hash = hash / 2 + aVal;
        }
      }
      hash = factor * hash + aVal;
    }
  }
  return hash;
}

export function strToUnicode(str) {
  if (typeof str !== 'string') {
    logger.log('转换unicode错误', str);
    return str;
  }
  var nstr = '';
  for (var i = 0; i < str.length; i++) {
    nstr += '\\' + str.charCodeAt(i).toString(16);
  }
  return nstr;
}

export function setCssStyle(css) {
  var style = document.createElement('style');
  style.type = 'text/css';
  try {
    style.appendChild(document.createTextNode(css));
  } catch (e) {
    style.styleSheet.cssText = css;
  }
  var head = document.getElementsByTagName('head')[0];
  var firstScript = document.getElementsByTagName('script')[0];
  if (head) {
    if (head.children.length) {
      head.insertBefore(style, head.children[0]);
    } else {
      head.appendChild(style);
    }
  } else {
    firstScript.parentNode.insertBefore(style, firstScript);
  }
}
export function toArray(iterable) {
  if (!iterable) {
    return [];
  }
  if (iterable.toArray) {
    return iterable.toArray();
  }
  if (isArray(iterable) || isArguments(iterable)) {
    return Array.prototype.slice.call(iterable);
  }
  return values(iterable);
}
export
export
export
export