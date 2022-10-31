import { isObject } from '@/utils/index'
import { _localStorage, _sessionStorage } from '@/Storage/storage'

var sendState = {};

sendState.getSendCall = function(data, config, callback) {
  if (sd.is_heatmap_render_mode) {
    return false;
  }

  if (sd.readyState.state < 3) {
    sd.log('初始化没有完成');
    return false;
  }

  data._track_id = Number(String(getRandom()).slice(2, 5) + String(getRandom()).slice(2, 4) + String(new Date().getTime()).slice(-4));
  data._flush_time = new Date().getTime();

  var originData = data;

  data = JSON.stringify(data);

  var requestData = {
    data: originData,
    config: config,
    callback: callback
  };

  sd.events.tempAdd('send', originData);

  if (!sd.para.app_js_bridge && sd.para.batch_send && _localStorage.isSupport() && localStorage.length < 100) {
    sd.log(originData);
    sd.batchSend.add(requestData.data);
    return false;
  }
  if (originData.type === 'item_set' || originData.type === 'item_delete') {
    this.prepareServerUrl(requestData);
  } else {
    sendStageImpl.stage.process('beforeSend', requestData);
  }

  sd.log(originData);
};

sendState.prepareServerUrl = function(requestData) {
  if (typeof requestData.config === 'object' && requestData.config.server_url) {
    this.sendCall(requestData, requestData.config.server_url, requestData.callback);
  } else if (isArray(sd.para.server_url) && sd.para.server_url.length) {
    for (var i = 0; i < sd.para.server_url.length; i++) {
      this.sendCall(requestData, sd.para.server_url[i]);
    }
  } else if (typeof sd.para.server_url === 'string' && sd.para.server_url !== '') {
    this.sendCall(requestData, sd.para.server_url, requestData.callback);
  } else {
    sd.log('当前 server_url 为空或不正确，只在控制台打印日志，network 中不会发数据，请配置正确的 server_url！');
  }
};

sendState.sendCall = function(requestData, server_url, callback) {
  var data = {
    server_url: server_url,
    data: JSON.stringify(requestData.data),
    callback: callback,
    config: requestData.config
  };
  if (isObject(sd.para.jsapp) && !sd.para.jsapp.isOnline && typeof sd.para.jsapp.setData === 'function') {
    delete data.callback;
    data = JSON.stringify(data);
    sd.para.jsapp.setData(data);
  } else {
    this.realtimeSend(data);
  }
};

sendState.realtimeSend = function(data) {
  var instance = getRealtimeInstance(data);
  instance.start();
};

export default sendState