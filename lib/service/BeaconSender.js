import kit from './kit.js'

function getSendData(data) {
  return kit.encodeTrackData(data);
}

var BeaconSender = function(para) {
  this.callback = para.callback;
  this.server_url = para.server_url;
  this.data = getSendData(para.data);
};

BeaconSender.prototype.start = function() {
  var me = this;
  if (typeof navigator === 'object' && typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon(this.server_url, this.data);
  }
  setTimeout(function() {
    me.isEnd();
  }, 40);
};

export default BeaconSender