export var unlimitedDiv = {
  events: [],
  init: function(data) {
    this.filterWebClickEvents(data);
  },
  filterWebClickEvents: function(data) {
    this.events = sd.vtrackcollect.getAssignConfigs(function(event) {
      if (isObject(event) && event.event.unlimited_div === true && event.event_type === 'webclick') {
        return true;
      } else {
        return false;
      }
    }, data);
  },
  isTargetEle: function(ele) {
    var prop = sd.heatmap.getEleDetail(ele);

    if (!isObject(prop) || !isString(prop.$element_path)) {
      return false;
    }

    for (var i = 0; i < this.events.length; i++) {
      if (isObject(this.events[i]) && isObject(this.events[i].event) && sd.vtrackcollect.configIsMatch(prop, this.events[i].event)) {
        return true;
      }
    }

    return false;
  }
};

export var customProp = {
  events: [],
  configSwitch: false,
  collectAble: function() {
    return this.configSwitch && isObject(sd.para.heatmap) && sd.para.heatmap.get_vtrack_config;
  },
  updateEvents: function(data) {
    this.events = sd.vtrackcollect.getAssignConfigs(function(event) {
      if (isObject(event) && isArray(event.properties) && event.properties.length > 0) {
        return true;
      } else {
        return false;
      }
    }, data);
    if (this.events.length) {
      this.configSwitch = true;
    } else {
      this.configSwitch = false;
    }
  },
  getVtrackProps: function(data) {
    var props = {};
    if (!this.collectAble()) {
      return {};
    }
    if (data.event === '$WebClick') {
      props = this.clickCustomPropMaker(data, this.events);
    }
    return props;
  },
  clickCustomPropMaker: function(data, events, configs) {
    var _this = this;
    configs = configs || this.filterConfig(data, events, sd.vtrackcollect.url_info.page_url);
    var props = {};
    if (!configs.length) {
      return {};
    }
    each(configs, function(config) {
      if (isArray(config.properties) && config.properties.length > 0) {
        each(config.properties, function(propConf) {
          var prop = _this.getProp(propConf, data);
          if (isObject(prop)) {
            extend(props, prop);
          }
        });
      }
    });
    return props;
  },
  getProp: vtrackBase.getProp,
  getPropElInLi: vtrackBase.getPropElInLi,

  filterConfig: vtrackBase.filterConfig
};

export var vtrackcollect = {
  unlimitedDiv: unlimitedDiv,
  config: {},
  storageEnable: true,
  storage_name: 'webjssdkvtrackcollect',
  para: {
    session_time: 30 * 60 * 1000,
    timeout: 5000,
    update_interval: 30 * 60 * 1000
  },
  url_info: {},
  timer: null,
  update_time: null,
  customProp: customProp,
  initUrl: function() {
    var info = vtrackBase.initUrl();
    if (info) {
      var apiParse;
      try {
        apiParse = new urlParse(sd.para.server_url);
        apiParse._values.Path = '/config/visualized/Web.conf';
        info.api_url = apiParse.getUrl();
      } catch (error) {
        sd.log('----vtrackcollect---API地址解析异常', error);
        return false;
      }
      this.url_info = info;
    }
    return info;
  },
  init: function() {
    if (!(isObject(sd.para.heatmap) && sd.para.heatmap.get_vtrack_config)) {
      return false;
    }

    if (!_localStorage.isSupport()) {
      this.storageEnable = false;
    }
    if (!this.initUrl()) {
      sd.log('----vtrackcustom----初始化失败，url信息解析失败');
      return false;
    }

    if (!this.storageEnable) {
      this.getConfigFromServer();
    } else {
      var data = sd.store.readObjectVal(this.storage_name);
      if (!(isObject(data) && isObject(data.data))) {
        this.getConfigFromServer();
      } else if (!this.serverUrlIsSame(data.serverUrl)) {
        this.getConfigFromServer();
      } else {
        this.config = data.data;
        this.update_time = data.updateTime;
        this.updateConfig(data.data);
        var now_time = new Date().getTime();
        var duration = now_time - this.update_time;
        if (!(isNumber(duration) && duration > 0 && duration < this.para.session_time)) {
          this.getConfigFromServer();
        } else {
          var next_time = this.para.update_interval - duration;
          this.setNextFetch(next_time);
        }
      }
    }
    this.pageStateListenner();
  },
  serverUrlIsSame: function(obj) {
    if (!isObject(obj)) {
      return false;
    }
    if (obj.host === this.url_info.server_url.host && obj.project === this.url_info.server_url.project) {
      return true;
    }
    return false;
  },
  getConfigFromServer: function() {
    var _this = this;
    var success = function(code, data) {
      _this.update_time = new Date().getTime();
      var serverData = {};
      if (code === 200) {
        if (data && isObject(data) && data.os === 'Web') {
          serverData = data;
          _this.updateConfig(serverData);
        }
      } else if (code === 205) {
        _this.updateConfig(serverData);
      } else if (code === 304) {
        serverData = _this.config;
      } else {
        sd.log('----vtrackcustom----数据异常', code);
        _this.updateConfig(serverData);
      }
      _this.updateStorage(serverData);
      _this.setNextFetch();
    };
    var error = function(err) {
      _this.update_time = new Date().getTime();
      sd.log('----vtrackcustom----配置拉取失败', err);
      _this.setNextFetch();
    };
    this.sendRequest(success, error);
  },
  setNextFetch: function(time) {
    var _this = this;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    time = time || this.para.update_interval;
    this.timer = setTimeout(function() {
      _this.getConfigFromServer();
    }, time);
  },
  pageStateListenner: function() {
    var _this = this;
    listenPageState({
      visible: function() {
        var time = new Date().getTime();
        var duration = time - _this.update_time;
        if (isNumber(duration) && duration > 0 && duration < _this.para.update_interval) {
          var next_time = _this.para.update_interval - duration;
          _this.setNextFetch(next_time);
        } else {
          _this.getConfigFromServer();
        }
      },
      hidden: function() {
        if (_this.timer) {
          clearTimeout(_this.timer);
          _this.timer = null;
        }
      }
    });
  },
  updateConfig: function(data) {
    if (!isObject(data)) {
      return false;
    }
    this.config = data;
    this.customProp.updateEvents(data);
    this.unlimitedDiv.init(data);
  },
  updateStorage: function(data) {
    if (!this.storageEnable) {
      return false;
    }
    if (!isObject(data)) {
      return false;
    }
    var server_url;
    if (!this.url_info.server_url) {
      var urlinfo = sd.vtrackcollect.initUrl();
      if (!urlinfo) {
        return false;
      } else {
        server_url = urlinfo.server_url;
      }
    } else {
      server_url = this.url_info.server_url;
    }
    var obj = {
      updateTime: new Date().getTime(),
      data: data,
      serverUrl: server_url
    };
    sd.store.saveObjectVal(this.storage_name, obj);
  },
  sendRequest: function(suc, err) {
    var _this = this;
    var data = {
      app_id: this.url_info.page_url.host
    };
    if (this.config.version) {
      data.v = this.config.version;
    }
    jsonp({
      url: _this.url_info.api_url,
      callbackName: 'saJSSDKVtrackCollectConfig',
      data: data,
      timeout: _this.para.timeout,
      success: function(code, data) {
        suc(code, data);
      },
      error: function(error) {
        err(error);
      }
    });
  },

  getAssignConfigs: vtrackBase.getAssignConfigs,

  configIsMatch: vtrackBase.configIsMatch
};


