import kit from './kit.js'

function getSendUrl(url, data) {
  var dataStr = kit.encodeTrackData(data);
  if (url.indexOf('?') !== -1) {
    return url + '&' + dataStr;
  }
  return url + '?' + dataStr;
}

var ImageSender = function(para) {
  this.callback = para.callback;
  this.img = document.createElement('img');
  this.img.width = 1;
  this.img.height = 1;
  if (sd.para.img_use_crossorigin) {
    this.img.crossOrigin = 'anonymous';
  }
  this.data = para.data;
  this.server_url = getSendUrl(para.server_url, para.data);
};

ImageSender.prototype.start = function() {
  var me = this;
  if (sd.para.ignore_oom) {
    this.img.onload = function() {
      this.onload = null;
      this.onerror = null;
      this.onabort = null;
      me.isEnd();
    };
    this.img.onerror = function() {
      this.onload = null;
      this.onerror = null;
      this.onabort = null;
      me.isEnd();
    };
    this.img.onabort = function() {
      this.onload = null;
      this.onerror = null;
      this.onabort = null;
      me.isEnd();
    };
  }
  this.img.src = this.server_url;
};

ImageSender.prototype.lastClear = function() {
  var sys = getUA();
  if (sys.ie !== undefined) {
    this.img.src = 'about:blank';
  } else {
    this.img.src = '';
  }
};

export ImageSender