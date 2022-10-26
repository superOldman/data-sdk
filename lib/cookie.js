export var cookie = {
  get: function(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) == 0) {
        return _decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  },
  set: function(name, value, days, cross_subdomain, cookie_samesite, is_secure, domain) {
    var cdomain = domain,
      expires = '',
      secure = '',
      samesite = '';
    days = days == null ? 73000 : days;

    if (days !== 0) {
      var date = new Date();
      if (String(days).slice(-1) === 's') {
        date.setTime(date.getTime() + Number(String(days).slice(0, -1)) * 1000);
      } else {
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      }

      expires = '; expires=' + date.toGMTString();
    }
    if (isString(cookie_samesite) && cookie_samesite !== '') {
      samesite = '; SameSite=' + cookie_samesite;
    }
    if (is_secure) {
      secure = '; secure';
    }

    function getValid(data) {
      if (data) {
        return data.replace(/\r\n/g, '');
      } else {
        return false;
      }
    }
    var valid_name = '';
    var valid_value = '';
    var valid_domain = '';
    if (name) {
      valid_name = getValid(name);
    }
    if (value) {
      valid_value = getValid(value);
    }
    if (cdomain) {
      valid_domain = getValid(cdomain);
    }
    if (valid_name && valid_value) {
      document.cookie = valid_name + '=' + encodeURIComponent(valid_value) + expires + '; path=/' + valid_domain + samesite + secure;
    }
  },
  remove: function(name, cross_subdomain) {
    this.set(name, '1', -1, cross_subdomain);
  },
  isSupport: function(testKey, testValue) {
    testKey = testKey || 'cookie_support_test';
    testValue = testValue || '1';
    var self = this;

    function accessNormal() {
      self.set(testKey, testValue);
      var val = self.get(testKey);
      if (val !== testValue) return false;
      self.remove(testKey);
      return true;
    }
    return navigator.cookieEnabled && accessNormal();
  }
};