var dataStoragePrefix = 'sawebjssdk-';
var tabStoragePrefix = 'tab-sawebjssdk-';

function BatchSend() {
  this.sendTimeStamp = 0;
  this.timer = null;
  this.serverUrl = '';
  this.hasTabStorage = false;
}

BatchSend.prototype = {
  batchInterval: function() {
    if (this.serverUrl === '') this.getServerUrl();
    if (!this.hasTabStorage) {
      this.generateTabStorage();
      this.hasTabStorage = true;
    }
    var self = this;
    self.timer = setTimeout(function() {
      self.updateExpireTime();
      self.recycle();
      self.send();
      clearTimeout(self.timer);
      self.batchInterval();
    }, sd.para.batch_send.send_interval);
  },

  getServerUrl: function() {
    if ((isString(sd.para.server_url) && sd.para.server_url !== '') || (isArray(sd.para.server_url) && sd.para.server_url.length)) {
      this.serverUrl = isArray(sd.para.server_url) ? sd.para.server_url[0] : sd.para.server_url;
    } else {
      return sd.log('当前 server_url 为空或不正确，只在控制台打印日志，network 中不会发数据，请配置正确的 server_url！');
    }
  },

  send: function() {
    if (this.sendTimeStamp && now() - this.sendTimeStamp < sd.para.batch_send.datasend_timeout) return;
    var tabStorage = _localStorage.get(this.tabKey);
    if (tabStorage) {
      this.sendTimeStamp = now();
      tabStorage = safeJSONParse(tabStorage) || this.generateTabStorageVal();
      if (tabStorage.data.length) {
        var data = [];
        for (var i = 0; i < tabStorage.data.length; i++) {
          data.push(sd.store.readObjectVal(tabStorage.data[i]));
        }
        this.request(data, tabStorage.data);
      }
    }
  },

  updateExpireTime: function() {
    var tabStorage = _localStorage.get(this.tabKey);
    if (tabStorage) {
      tabStorage = safeJSONParse(tabStorage) || this.generateTabStorageVal();
      tabStorage.expireTime = now() + sd.para.batch_send.send_interval * 2;
      tabStorage.serverUrl = this.serverUrl;
      _localStorage.set(this.tabKey, JSON.stringify(tabStorage));
    }
  },

  request: function(data, dataKeys) {
    var self = this;
    ajax({
      url: this.serverUrl,
      type: 'POST',
      data: 'data_list=' + encodeURIComponent(base64Encode(JSON.stringify(data))),
      credentials: false,
      timeout: sd.para.batch_send.datasend_timeout,
      cors: true,
      success: function() {
        self.remove(dataKeys);
        self.sendTimeStamp = 0;
      },
      error: function() {
        self.sendTimeStamp = 0;
      }
    });
  },

  remove: function(dataKeys) {
    var tabStorage = _localStorage.get(this.tabKey);
    if (tabStorage) {
      var tabStorageData = (safeJSONParse(tabStorage) || this.generateTabStorageVal()).data;
      for (var i = 0; i < dataKeys.length; i++) {
        var idx = indexOf(tabStorageData, dataKeys[i]);
        if (idx > -1) {
          tabStorageData.splice(idx, 1);
        }
        _localStorage.remove(dataKeys[i]);
      }
      _localStorage.set(this.tabKey, JSON.stringify(this.generateTabStorageVal(tabStorageData)));
    }
  },

  add: function(data) {
    var dataKey = dataStoragePrefix + String(getRandom());
    var tabStorage = _localStorage.get(this.tabKey);
    if (tabStorage === null) {
      this.tabKey = tabStoragePrefix + String(getRandom());
      tabStorage = this.generateTabStorageVal();
    } else {
      tabStorage = safeJSONParse(tabStorage) || this.generateTabStorageVal();
    }
    tabStorage.data.push(dataKey);
    tabStorage.expireTime = now() + sd.para.batch_send.send_interval * 2;
    _localStorage.set(this.tabKey, JSON.stringify(tabStorage));
    sd.store.saveObjectVal(dataKey, data);
    if (data.type === 'track_signup' || data.event === '$pageview') {
      this.sendImmediately();
    }
  },

  generateTabStorage: function() {
    this.tabKey = tabStoragePrefix + String(getRandom());
    _localStorage.set(this.tabKey, JSON.stringify(this.generateTabStorageVal()));
  },

  generateTabStorageVal: function(data) {
    data = data || [];
    return {
      data: data,
      expireTime: now() + sd.para.batch_send.send_interval * 2,
      serverUrl: this.serverUrl
    };
  },

  sendImmediately: function() {
    this.send();
  },

  recycle: function() {
    var notSendMap = {},
      lockTimeout = 10000,
      lockPrefix = 'sajssdk-lock-get-';
    for (var i = 0; i < localStorage.length; i++) {
      var item = localStorage.key(i),
        self = this;
      if (item.indexOf(tabStoragePrefix) === 0) {
        var tabStorage = safeJSONParse(_localStorage.get(item)) || this.generateTabStorageVal();
        for (var j = 0; j < tabStorage.data.length; j++) {
          notSendMap[tabStorage.data[j]] = true;
        }
        if (now() > tabStorage.expireTime && this.serverUrl === tabStorage.serverUrl) {
          var concurrentStorage = new ConcurrentStorage(lockPrefix);
          concurrentStorage.get(item, lockTimeout, 1000, function(data) {
            if (data) {
              if (_localStorage.get(self.tabKey) === null) {
                self.generateTabStorage();
              }
              var recycleData = safeJSONParse(data) || self.generateTabStorageVal();
              _localStorage.set(self.tabKey, JSON.stringify(self.generateTabStorageVal((safeJSONParse(_localStorage.get(self.tabKey)) || this.generateTabStorageVal()).data.concat(recycleData.data))));
            }
          });
        }
      } else if (item.indexOf(lockPrefix) === 0) {
        var lock = safeJSONParse(_localStorage.get(item)) || {
          expireTime: 0
        };
        if (now() - lock.expireTime > lockTimeout) {
          _localStorage.remove(item);
        }
      }
    }
    for (var n = 0; n < localStorage.length; n++) {
      var key1 = localStorage.key(n);
      if (key1.indexOf(dataStoragePrefix) === 0 && !notSendMap[key1]) {
        _localStorage.remove(key1);
      }
    }
  }
};


export default BatchSend