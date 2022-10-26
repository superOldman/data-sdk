 var heatmapMode = {
  isSeachHasKeyword: function() {
    if (getQueryParam(location.href, 'sa-request-id') !== '') {
      if (typeof sessionStorage.getItem('sensors-visual-mode') === 'string') {
        sessionStorage.removeItem('sensors-visual-mode');
      }
      return true;
    } else {
      return false;
    }
  },
  hasKeywordHandle: function() {
    var url = location.href;
    var id = getQueryParam(url, 'sa-request-id') || null;
    var type = getQueryParam(url, 'sa-request-type') || null;
    var web_url = getQueryParam(url, 'sa-request-url') || null;
    heatmap.setNotice(web_url);
    if (_sessionStorage.isSupport()) {
      if (web_url !== null) {
        sessionStorage.setItem('sensors_heatmap_url', web_url);
      }
      sessionStorage.setItem('sensors_heatmap_id', id);
      if (type !== null) {
        if (type === '1' || type === '2' || type === '3') {
          sessionStorage.setItem('sensors_heatmap_type', type);
        } else {
          type = null;
        }
      } else {
        var session_type = sessionStorage.getItem('sensors_heatmap_type');
        if (session_type !== null) {
          type = session_type;
        } else {
          type = null;
        }
      }
    }
    this.isReady(id, type);
  },
  isReady: function(data, type, url) {
    if (sd.para.heatmap_url) {
      loadScript({
        success: function() {
          setTimeout(function() {
            if (typeof sa_jssdk_heatmap_render !== 'undefined') {
              sa_jssdk_heatmap_render(sd, data, type, url);
              if (typeof console === 'object' && typeof console.log === 'function') {
                if (!(sd.heatmap_version && sd.heatmap_version === sd.lib_version)) {
                  console.log('heatmap.js与sensorsdata.js版本号不一致，可能存在风险!');
                }
              }
            }
          }, 0);
        },
        error: function() {},
        type: 'js',
        url: sd.para.heatmap_url
      });
    } else {
      sd.log('没有指定heatmap_url的路径');
    }
  },
  isStorageHasKeyword: function() {
    return _sessionStorage.isSupport() && typeof sessionStorage.getItem('sensors_heatmap_id') === 'string';
  },
  storageHasKeywordHandle: function() {
    heatmap.setNotice();
    heatmapMode.isReady(sessionStorage.getItem('sensors_heatmap_id'), sessionStorage.getItem('sensors_heatmap_type'), location.href);
  },
  isWindowNameHasKeyword: function() {
    try {
      var nameParams = JSON.parse(window.name);
      var page_url = isString(nameParams['sa-request-page-url']) ? _decodeURIComponent(nameParams['sa-request-page-url']) : null;
      return nameParams['sa-request-id'] && isString(nameParams['sa-request-id']) && page_url === location.href;
    } catch (e) {
      return false;
    }
  },
  windowNameHasKeywordHandle: function() {
    var nameParams = JSON.parse(window.name);

    function getDecode(key) {
      var value = nameParams[key];
      return isString(value) ? _decodeURIComponent(value) : null;
    }
    var id = getDecode('sa-request-id');
    var type = getDecode('sa-request-type');
    var web_url = getDecode('sa-request-url');
    heatmap.setNotice(web_url);
    if (_sessionStorage.isSupport()) {
      if (web_url !== null) {
        sessionStorage.setItem('sensors_heatmap_url', web_url);
      }
      sessionStorage.setItem('sensors_heatmap_id', id);
      if (type !== null) {
        if (type === '1' || type === '2' || type === '3') {
          sessionStorage.setItem('sensors_heatmap_type', type);
        } else {
          type = null;
        }
      } else {
        if (sessionStorage.getItem('sensors_heatmap_type') !== null) {
          type = sessionStorage.getItem('sensors_heatmap_type');
        } else {
          type = null;
        }
      }
    }
    heatmapMode.isReady(id, type);
  }
};

export default heatmapMode