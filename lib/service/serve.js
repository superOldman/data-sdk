export function jsonp(obj) {
  if (!(isObject(obj) && isString(obj.callbackName))) {
    logger.log('JSONP 请求缺少 callbackName');
    return false;
  }
  obj.success = isFunction(obj.success) ? obj.success : function() {};
  obj.error = isFunction(obj.error) ? obj.error : function() {};
  obj.data = obj.data || '';
  var script = document.createElement('script');
  var head = document.getElementsByTagName('head')[0];
  var timer = null;
  var isError = false;
  head.appendChild(script);
  if (isNumber(obj.timeout)) {
    timer = setTimeout(function() {
      if (isError) {
        return false;
      }
      obj.error('timeout');
      window[obj.callbackName] = function() {
        logger.log('call jsonp error');
      };
      timer = null;
      head.removeChild(script);
      isError = true;
    }, obj.timeout);
  }
  window[obj.callbackName] = function() {
    clearTimeout(timer);
    timer = null;
    obj.success.apply(null, arguments);
    window[obj.callbackName] = function() {
      logger.log('call jsonp error');
    };
    head.removeChild(script);
  };
  if (obj.url.indexOf('?') > -1) {
    obj.url += '&callbackName=' + obj.callbackName;
  } else {
    obj.url += '?callbackName=' + obj.callbackName;
  }
  if (isObject(obj.data)) {
    var arr = [];
    each(obj.data, function(value, key) {
      arr.push(key + '=' + value);
    });
    obj.data = arr.join('&');
    obj.url += '&' + obj.data;
  }
  script.onerror = function(err) {
    if (isError) {
      return false;
    }
    window[obj.callbackName] = function() {
      logger.log('call jsonp error');
    };
    clearTimeout(timer);
    timer = null;
    head.removeChild(script);
    obj.error(err);
    isError = true;
  };
  script.src = obj.url;
}

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