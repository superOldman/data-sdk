
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