import check from '@/utils/check'
export var dataStageImpl = {
  stage: null,
  init: function (stage) {
    this.stage = stage;
  }
};

var saEvent = {};

saEvent.check = check;

saEvent.sendItem = function (p) {
  var data = {
    lib: {
      $lib: 'js',
      $lib_method: 'code',
      $lib_version: String(sd.lib_version)
    },
    time: new Date() * 1
  };

  extend(data, p);
  dataStageImpl.stage.process('formatData', data);

  sd.sendState.getSendCall(data);
};

saEvent.send = function (p, callback) {
  var data = sd.kit.buildData(p);
  sd.kit.sendData(data, callback);
};

saEvent.debugPath = function (data) {
  var _data = data;
  var url = '';
  if (sd.para.debug_mode_url.indexOf('?') !== -1) {
    url = sd.para.debug_mode_url + '&' + sd.kit.encodeTrackData(data);
  } else {
    url = sd.para.debug_mode_url + '?' + sd.kit.encodeTrackData(data);
  }

  ajax$1({
    url: url,
    type: 'GET',
    cors: true,
    header: {
      'Dry-Run': String(sd.para.debug_mode_upload)
    },
    success: function (data) {
      isEmptyObject(data) === true ? alert('debug数据发送成功' + _data) : alert('debug失败 错误原因' + JSON.stringify(data));
    }
  });
};

export default saEvent