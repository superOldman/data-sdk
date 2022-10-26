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
