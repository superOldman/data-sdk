export function sdLog() {
  if ((_sessionStorage.isSupport() && sessionStorage.getItem('sensorsdata_jssdk_debug') === 'true') || sdPara.show_log) {
    if (isObject(arguments[0]) && (sdPara.show_log === true || sdPara.show_log === 'string' || sdPara.show_log === false)) {
      arguments[0] = formatJsonString(arguments[0]);
    }

    if (typeof console === 'object' && console.log) {
      try {
        return console.log.apply(console, arguments);
      } catch (e) {
        console.log(arguments[0]);
      }
    }
  }
}

export var debug = {
  distinct_id: function() {},
  jssdkDebug: function() {},
  _sendDebug: function(debugString) {},
  apph5: function(obj) {
    var name = 'app_h5打通失败-';
    var relation = {
      1: name + 'use_app_track为false',
      2: name + 'Android或者iOS，没有暴露相应方法',
      3.1: name + 'Android校验server_url失败',
      3.2: name + 'iOS校验server_url失败',
      4.1: name + 'H5 校验 iOS server_url 失败',
      4.2: name + 'H5 校验 Android server_url 失败'
    };
    var output = obj.output;
    var step = obj.step;
    var data = obj.data || '';
    if (output === 'all' || output === 'console') {
      sdLog(relation[step]);
    }
    if ((output === 'all' || output === 'code') && isObject(sdPara.is_debug) && sdPara.is_debug.apph5) {
      if (!data.type || data.type.slice(0, 7) !== 'profile') {
        data.properties._jssdk_debug_info = 'apph5-' + String(step);
      }
    }
  },
  defineMode: function(type) {
    var debugList = {
      1: {
        title: '当前页面无法进行可视化全埋点',
        message: 'App SDK 与 Web JS SDK 没有进行打通，请联系贵方技术人员修正 App SDK 的配置，详细信息请查看文档。',
        link_text: '配置文档',
        link_url: 'https://manual.sensorsdata.cn/sa/latest/tech_sdk_client_link-1573913.html'
      },
      2: {
        title: '当前页面无法进行可视化全埋点',
        message: 'App SDK 与 Web JS SDK 没有进行打通，请联系贵方技术人员修正 Web JS SDK 的配置，详细信息请查看文档。',
        link_text: '配置文档',
        link_url: 'https://manual.sensorsdata.cn/sa/latest/tech_sdk_client_link-1573913.html'
      },
      3: {
        title: '当前页面无法进行可视化全埋点',
        message: 'Web JS SDK 没有开启全埋点配置，请联系贵方工作人员修正 SDK 的配置，详细信息请查看文档。',
        link_text: '配置文档',
        link_url: 'https://manual.sensorsdata.cn/sa/latest/tech_sdk_client_web_all-1573964.html'
      },
      4: {
        title: '当前页面无法进行可视化全埋点',
        message: 'Web JS SDK 配置的数据校验地址与 App SDK 配置的数据校验地址不一致，请联系贵方工作人员修正 SDK 的配置，详细信息请查看文档。',
        link_text: '配置文档',
        link_url: 'https://manual.sensorsdata.cn/sa/latest/tech_sdk_client_link-1573913.html'
      }
    };
    if (type && debugList[type]) {
      return debugList[type];
    } else {
      return false;
    }
  },
  protocol: {
    protocolIsSame: function(url1, url2) {
      try {
        if (_URL(url1).protocol !== _URL(url2).protocol) {
          return false;
        }
      } catch (error) {
        sdLog('不支持 _.URL 方法');
        return false;
      }
      return true;
    },
    serverUrl: function() {
      if (isString(sdPara.server_url) && sdPara.server_url !== '' && !this.protocolIsSame(sdPara.server_url, location.href)) {
        sdLog('SDK 检测到您的数据发送地址和当前页面地址的协议不一致，建议您修改成一致的协议。\n因为：1、https 下面发送 http 的图片请求会失败。2、http 页面使用 https + ajax 方式发数据，在 ie9 及以下会丢失数据。');
      }
    },
    ajax: function(url) {
      if (url === sdPara.server_url) {
        return false;
      }
      if (isString(url) && url !== '' && !this.protocolIsSame(url, location.href)) {
        sdLog('SDK 检测到您的数据发送地址和当前页面地址的协议不一致，建议您修改成一致的协议。因为 http 页面使用 https + ajax 方式发数据，在 ie9 及以下会丢失数据。');
      }
    }
  }
};