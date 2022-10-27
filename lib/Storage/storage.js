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



function ConcurrentStorage(lockGetPrefix, lockSetPrefix) {
  this.lockGetPrefix = lockGetPrefix || 'lock-get-prefix';
  this.lockSetPrefix = lockSetPrefix || 'lock-set-prefix';
}

ConcurrentStorage.prototype.get = function (key, lockTimeout, checkTime, callback) {
  if (!key) throw new Error('key is must');
  lockTimeout = lockTimeout || 10000;
  checkTime = checkTime || 1000;
  callback = callback || function () { };
  var lockKey = this.lockGetPrefix + key;
  var lock = _localStorage.get(lockKey);
  var randomNum = String(getRandom());
  if (lock) {
    lock = safeJSONParse(lock) || {
      randomNum: 0,
      expireTime: 0
    };
    if (lock.expireTime > now()) {
      return callback(null);
    }
  }
  _localStorage.set(lockKey, JSON.stringify({
    randomNum: randomNum,
    expireTime: now() + lockTimeout
  }));
  setTimeout(function () {
    lock = safeJSONParse(_localStorage.get(lockKey)) || {
      randomNum: 0,
      expireTime: 0
    };
    if (lock && lock.randomNum === randomNum) {
      callback(_localStorage.get(key));
      _localStorage.remove(key);
      _localStorage.remove(lockKey);
    } else {
      callback(null);
    }
  }, checkTime);
};

ConcurrentStorage.prototype.set = function (key, val, lockTimeout, checkTime, callback) {
  if (!key || !val) throw new Error('key and val is must');
  lockTimeout = lockTimeout || 10000;
  checkTime = checkTime || 1000;
  callback = callback || function () { };
  var lockKey = this.lockSetPrefix + key;
  var lock = _localStorage.get(lockKey);
  var randomNum = String(getRandom());
  if (lock) {
    lock = safeJSONParse(lock) || {
      randomNum: 0,
      expireTime: 0
    };
    if (lock.expireTime > now()) {
      return callback({
        status: 'fail',
        reason: 'This key is locked'
      });
    }
  }
  _localStorage.set(lockKey, JSON.stringify({
    randomNum: randomNum,
    expireTime: now() + lockTimeout
  }));
  setTimeout(function () {
    lock = safeJSONParse(_localStorage.get(lockKey)) || {
      randomNum: 0,
      expireTime: 0
    };
    if (lock.randomNum === randomNum) {
      _localStorage.set(key, val) && callback({
        status: 'success'
      });
    } else {
      callback({
        status: 'fail',
        reason: 'This key is locked'
      });
    }
  }, checkTime);
};


export default ConcurrentStorage