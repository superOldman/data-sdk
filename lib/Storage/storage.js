export var _sessionStorage = {
  isSupport: function() {
    var supported = true;
    var supportName = '__session_storage_support__';
    var val = 'testIsSupportStorage';
    try {
      if (sessionStorage && sessionStorage.setItem) {
        sessionStorage.setItem(supportName, val);
        sessionStorage.removeItem(supportName, val);
        supported = true;
      } else {
        supported = false;
      }
    } catch (e) {
      supported = false;
    }
    return supported;
  }
};

export var _localStorage = {
  get: function(key) {
    return window.localStorage.getItem(key);
  },
  parse: function(key) {
    var storedValue;
    try {
      storedValue = JSON.parse(_localStorage.get(key)) || null;
    } catch (err) {
      logger.log(err);
    }
    return storedValue;
  },
  set: function(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      logger.log(err);
    }
  },
  remove: function(key) {
    window.localStorage.removeItem(key);
  },
  isSupport: function() {
    var supported = true;
    try {
      var supportName = '__local_store_support__';
      var val = 'testIsSupportStorage';
      _localStorage.set(supportName, val);
      if (_localStorage.get(supportName) !== val) {
        supported = false;
      }
      _localStorage.remove(supportName);
    } catch (err) {
      supported = false;
    }
    return supported;
  }
};