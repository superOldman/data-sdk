export function getDomBySelector(selector) {
  if (!isString(selector)) {
    return null;
  }
  var arr = selector.split('>');
  var el = null;

  function getDom(selector, parent) {
    selector = trim(selector);
    var node;
    if (selector === 'body') {
      return document.getElementsByTagName('body')[0];
    }
    if (selector.indexOf('#') === 0) {
      selector = selector.slice(1);
      node = document.getElementById(selector);
    } else if (selector.indexOf(':nth-of-type') > -1) {
      var arr = selector.split(':nth-of-type');
      if (!(arr[0] && arr[1])) {
        return null;
      }
      var tagname = arr[0];
      var indexArr = arr[1].match(/\(([0-9]+)\)/);
      if (!(indexArr && indexArr[1])) {
        return null;
      }
      var num = Number(indexArr[1]);
      if (!(isElement(parent) && parent.children && parent.children.length > 0)) {
        return null;
      }
      var child = parent.children;

      for (var i = 0; i < child.length; i++) {
        if (isElement(child[i])) {
          var name = child[i].tagName.toLowerCase();
          if (name === tagname) {
            num--;
            if (num === 0) {
              node = child[i];
              break;
            }
          }
        }
      }
      if (num > 0) {
        return null;
      }
    }
    if (!node) {
      return null;
    }
    return node;
  }

  function get(parent) {
    var tagSelector = arr.shift();
    var element;
    if (!tagSelector) {
      return parent;
    }
    try {
      element = getDom(tagSelector, parent);
    } catch (error) {
      logger.log(error);
    }
    if (!(element && isElement(element))) {
      return null;
    } else {
      return get(element);
    }
  }
  el = get();
  if (!(el && isElement(el))) {
    return null;
  } else {
    return el;
  }
}

export function getElementContent(element, tagName) {
  var textContent = '';
  var element_content = '';
  if (element.textContent) {
    textContent = trim(element.textContent);
  } else if (element.innerText) {
    textContent = trim(element.innerText);
  }
  if (textContent) {
    textContent = textContent
      .replace(/[\r\n]/g, ' ')
      .replace(/[ ]+/g, ' ')
      .substring(0, 255);
  }
  element_content = textContent || '';

  if (tagName === 'input' || tagName === 'INPUT') {
    element_content = element.value || '';
  }
  return element_content;
}

export function getHostname(url, defaultValue) {
  if (!defaultValue || typeof defaultValue !== 'string') {
    defaultValue = 'hostname解析异常';
  }
  var hostname = null;
  try {
    hostname = _URL(url).hostname;
  } catch (e) {
    logger.log('getHostname传入的url参数不合法！');
  }
  return hostname || defaultValue;
}

export function getIOSVersion() {
  try {
    var version = navigator.appVersion.match(/OS (\d+)[._](\d+)[._]?(\d+)?/);
    return version && version[1] ? Number.parseInt(version[1], 10) : '';
  } catch (e) {
    return '';
  }
}

export function getQueryParam(url, key) {
  key = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  url = _decodeURIComponent(url);
  var regexS = '[\\?&]' + key + '=([^&#]*)',
    regex = new RegExp(regexS),
    results = regex.exec(url);
  if (results === null || (results && typeof results[1] !== 'string' && results[1].length)) {
    return '';
  } else {
    return _decodeURIComponent(results[1]);
  }
}


export function getQueryParamsFromUrl(url) {
  var result = {};
  var arr = url.split('?');
  var queryString = arr[1] || '';
  if (queryString) {
    result = getURLSearchParams('?' + queryString);
  }
  return result;
}

export function mediaQueriesSupported() {
  return typeof window.matchMedia != 'undefined' || typeof window.msMatchMedia != 'undefined';
}

export function getScreenOrientation() {
  var screenOrientationAPI = screen.msOrientation || screen.mozOrientation || (screen.orientation || {}).type;
  var screenOrientation = '未取到值';
  if (screenOrientationAPI) {
    screenOrientation = screenOrientationAPI.indexOf('landscape') > -1 ? 'landscape' : 'portrait';
  } else if (mediaQueriesSupported()) {
    var matchMediaFunc = window.matchMedia || window.msMatchMedia;
    if (matchMediaFunc('(orientation: landscape)').matches) {
      screenOrientation = 'landscape';
    } else if (matchMediaFunc('(orientation: portrait)').matches) {
      screenOrientation = 'portrait';
    }
  }
  return screenOrientation;
}






export function listenPageState(obj) {
  var visibilystore = {
    visibleHandler: isFunction(obj.visible) ? obj.visible : function() {},
    hiddenHandler: isFunction(obj.hidden) ? obj.hidden : function() {},
    visibilityChange: null,
    hidden: null,
    isSupport: function() {
      return typeof document[this.hidden] !== 'undefined';
    },
    init: function() {
      if (typeof document.hidden !== 'undefined') {
        this.hidden = 'hidden';
        this.visibilityChange = 'visibilitychange';
      } else if (typeof document.mozHidden !== 'undefined') {
        this.hidden = 'mozHidden';
        this.visibilityChange = 'mozvisibilitychange';
      } else if (typeof document.msHidden !== 'undefined') {
        this.hidden = 'msHidden';
        this.visibilityChange = 'msvisibilitychange';
      } else if (typeof document.webkitHidden !== 'undefined') {
        this.hidden = 'webkitHidden';
        this.visibilityChange = 'webkitvisibilitychange';
      }
      this.listen();
    },
    listen: function() {
      if (!this.isSupport()) {
        addEvent(window, 'focus', this.visibleHandler);
        addEvent(window, 'blur', this.hiddenHandler);
      } else {
        var _this = this;
        addEvent(
          document,
          this.visibilityChange,
          function() {
            if (!document[_this.hidden]) {
              _this.visibleHandler();
            } else {
              _this.hiddenHandler();
            }
          },
          1
        );
      }
    }
  };
  visibilystore.init();
}


export function loadScript(para) {
  para = extend({
      success: function() {},
      error: function() {},
      appendCall: function(g) {
        document.getElementsByTagName('head')[0].appendChild(g);
      }
    },
    para
  );

  var g = null;
  if (para.type === 'css') {
    g = document.createElement('link');
    g.rel = 'stylesheet';
    g.href = para.url;
  }
  if (para.type === 'js') {
    g = document.createElement('script');
    g.async = 'async';
    g.setAttribute('charset', 'UTF-8');
    g.src = para.url;
    g.type = 'text/javascript';
  }
  g.onload = g.onreadystatechange = function() {
    if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
      para.success();
      g.onload = g.onreadystatechange = null;
    }
  };
  g.onerror = function() {
    para.error();
    g.onerror = null;
  };
  para.appendCall(g);
}

export function removeScriptProtocol(str) {
  if (typeof str !== 'string') return '';
  var _regex = /^\s*javascript/i;
  while (_regex.test(str)) {
    str = str.replace(_regex, '');
  }
  return str;
}

export function rot13obfs(str, key) {
  str = String(str);
  key = typeof key === 'number' ? key : 13;
  var n = 126;

  var chars = str.split('');

  for (var i = 0, len = chars.length; i < len; i++) {
    var c = chars[i].charCodeAt(0);

    if (c < n) {
      chars[i] = String.fromCharCode((chars[i].charCodeAt(0) + key) % n);
    }
  }

  return chars.join('');
}

export function rot13defs(str) {
  var key = 13,
    n = 126;
  str = String(str);

  return rot13obfs(str, n - key);
}

export function searchObjDate(o) {
  if (isObject(o)) {
    each(o, function(a, b) {
      if (isObject(a)) {
        searchObjDate(o[b]);
      } else {
        if (isDate(a)) {
          o[b] = formatDate(a);
        }
      }
    });
  }
}


