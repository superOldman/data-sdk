import kit from './kit.js'
import { ajax$1 } from '@/service/serve'

function getSendData(data) {
  return kit.encodeTrackData(data);
}

var AjaxSender = function(para) {
  this.callback = para.callback;
  this.server_url = para.server_url;
  this.data = getSendData(para.data);
};

AjaxSender.prototype.start = function() {
  var me = this;
  ajax$1({
    url: this.server_url,
    type: 'POST',
    data: this.data,
    credentials: false,
    timeout: sd.para.datasend_timeout,
    cors: true,
    success: function() {
      me.isEnd();
    },
    error: function() {
      me.isEnd();
    }
  });
};
export default AjaxSender