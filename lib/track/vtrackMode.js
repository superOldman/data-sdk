import { _localStorage, _sessionStorage } from '@/Storage/storage'

function getSafeHttpProtocol() {
  var protocol = location.protocol;
  if (protocol === 'http:' || protocol === 'https:') {
    return protocol;
  } else {
    return 'http:';
  }
}

var vtrackMode = {
  isStorageHasKeyword: function() {
    return _sessionStorage.isSupport() && typeof sessionStorage.getItem('sensors-visual-mode') === 'string';
  },
  isSearchHasKeyword: function() {
    if (getFlagValue('sa-visual-mode') === true || getFlagValue('sa-visual-mode') === 'true') {
      if (typeof sessionStorage.getItem('sensors_heatmap_id') === 'string') {
        sessionStorage.removeItem('sensors_heatmap_id');
      }
      return true;
    } else {
      return false;
    }
  },
  loadVtrack: function() {
    loadScript({
      success: function() {},
      error: function() {},
      type: 'js',
      url: sd.para.vtrack_url ? sd.para.vtrack_url : getSafeHttpProtocol() + '//static.sensorsdata.cn/sdk/' + sd.lib_version + '/vtrack.min.js'
    });
  },
  messageListener: function(event) {
    function validUrl(value) {
      if (isHttpUrl(value)) {
        return removeScriptProtocol(value);
      } else {
        sd.log('可视化模式检测 URL 失败');
        return false;
      }
    }

    if (event.data.source !== 'sa-fe') {
      return false;
    }
    if (event.data.type === 'v-track-mode') {
      if (event.data.data && event.data.data.isVtrack) {
        if (_sessionStorage.isSupport()) {
          sessionStorage.setItem('sensors-visual-mode', 'true');
        }
        if (event.data.data.userURL && location.href.match(/sa-visual-mode=true/)) {
          var valid_url = validUrl(event.data.data.userURL);
          if (valid_url) {
            window.location.href = valid_url;
          }
        } else {
          vtrackMode.loadVtrack();
        }
      }
      window.removeEventListener('message', vtrackMode.messageListener, false);
    }
  },
  removeMessageHandle: function() {
    if (window.removeEventListener) {
      window.removeEventListener('message', vtrackMode.messageListener, false);
    }
  },
  verifyVtrackMode: function() {
    if (window.addEventListener) {
      window.addEventListener('message', vtrackMode.messageListener, false);
    }
    vtrackMode.postMessage();
  },
  postMessage: function() {
    try {
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({
            source: 'sa-web-sdk',
            type: 'v-is-vtrack',
            data: {
              sdkversion: '1.23.5'
            }
          },
          '*'
        );
      }
    } catch (e) {
      sd.log('浏览器版本过低，不支持 postMessage API');
    }
  },
  notifyUser: function() {
    var fn = function(event) {
      if (event.data.source !== 'sa-fe') {
        return false;
      }
      if (event.data.type === 'v-track-mode') {
        if (event.data.data && event.data.data.isVtrack) {
          alert('当前版本不支持，请升级部署神策数据治理');
        }
        window.removeEventListener('message', fn, false);
      }
    };
    if (window.addEventListener) {
      window.addEventListener('message', fn, false);
    }
    vtrackMode.postMessage();
  }
};
