import { isObject, isSupportCors, extend, isArray, indexOf, each,trim } from '@/utils/index'
import { _localStorage, _sessionStorage } from '@/Storage/storage'

// TODO
var sdPara = window.sdPara = {};

export var defaultPara = {
  preset_properties: {
    search_keyword_baidu: false,
    latest_utm: true,
    latest_traffic_source_type: true,
    latest_search_keyword: true,
    latest_referrer: true,
    latest_referrer_host: false,
    latest_landing_page: false,
    latest_wx_ad_click_id: undefined,
    url: true,
    title: true
  },
  encrypt_cookie: false,
  enc_cookie: false,
  img_use_crossorigin: false,

  name: 'sa',
  max_referrer_string_length: 200,
  max_string_length: 500,
  max_id_length: 255,
  max_key_length: 100,
  cross_subdomain: true,
  show_log: false,
  is_debug: false,
  debug_mode: false,
  debug_mode_upload: false,

  source_channel: [],
  sdk_id: '',

  send_type: 'image',

  vtrack_ignore: {},

  auto_init: true,

  is_track_single_page: false,

  is_single_page: false,

  batch_send: false,

  source_type: {},
  callback_timeout: 200,
  datasend_timeout: 8000,
  is_track_device_id: false,
  ignore_oom: true,
  app_js_bridge: false
};


export default function initPara(para) {
  extend(sdPara, para || sd.para || {});

  sd.para = sdPara;

  var latestObj = {};
  if (isObject(sd.para.is_track_latest)) {
    for (var latestProp in sd.para.is_track_latest) {
      latestObj['latest_' + latestProp] = sd.para.is_track_latest[latestProp];
    }
  }
  sd.para.preset_properties = extend({}, sd.para_default.preset_properties, latestObj, sd.para.preset_properties || {});

  var i;
  for (i in sd.para_default) {
    if (sd.para[i] === void 0) {
      sd.para[i] = sd.para_default[i];
    }
  }
  if (typeof sd.para.server_url === 'string') {
    sd.para.server_url = trim(sd.para.server_url);
    if (sd.para.server_url) {
      if (sd.para.server_url.slice(0, 3) === '://') {
        sd.para.server_url = location.protocol.slice(0, -1) + sd.para.server_url;
      } else if (sd.para.server_url.slice(0, 2) === '//') {
        sd.para.server_url = location.protocol + sd.para.server_url;
      } else if (sd.para.server_url.slice(0, 4) !== 'http') {
        sd.para.server_url = '';
      }
    }
  }

  if (typeof sd.para.web_url === 'string' && (sd.para.web_url.slice(0, 3) === '://' || sd.para.web_url.slice(0, 2) === '//')) {
    if (sd.para.web_url.slice(0, 3) === '://') {
      sd.para.web_url = location.protocol.slice(0, -1) + sd.para.web_url;
    } else {
      sd.para.web_url = location.protocol + sd.para.web_url;
    }
  }

  if (sd.para.send_type !== 'image' && sd.para.send_type !== 'ajax' && sd.para.send_type !== 'beacon') {
    sd.para.send_type = 'image';
  }

  sd.debug.protocol.serverUrl();

  sd.bridge.initPara();

  var batch_send_default = {
    datasend_timeout: 6000,
    send_interval: 6000
  };

  if (_localStorage.isSupport() && isSupportCors() && typeof localStorage === 'object') {
    if (sd.para.batch_send === true) {
      sd.para.batch_send = extend({}, batch_send_default);
    } else if (typeof sd.para.batch_send === 'object') {
      sd.para.batch_send = extend({}, batch_send_default, sd.para.batch_send);
    }
  } else {
    sd.para.batch_send = false;
  }

  var utm_type = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var search_type = ['www.baidu.', 'm.baidu.', 'm.sm.cn', 'so.com', 'sogou.com', 'youdao.com', 'google.', 'yahoo.com/', 'bing.com/', 'ask.com/'];
  var social_type = ['weibo.com', 'renren.com', 'kaixin001.com', 'douban.com', 'qzone.qq.com', 'zhihu.com', 'tieba.baidu.com', 'weixin.qq.com'];
  var search_keyword = {
    baidu: ['wd', 'word', 'kw', 'keyword'],
    google: 'q',
    bing: 'q',
    yahoo: 'p',
    sogou: ['query', 'keyword'],
    so: 'q',
    sm: 'q'
  };

  if (typeof sd.para.source_type === 'object') {
    sd.para.source_type.utm = isArray(sd.para.source_type.utm) ? sd.para.source_type.utm.concat(utm_type) : utm_type;
    sd.para.source_type.search = isArray(sd.para.source_type.search) ? sd.para.source_type.search.concat(search_type) : search_type;
    sd.para.source_type.social = isArray(sd.para.source_type.social) ? sd.para.source_type.social.concat(social_type) : social_type;
    sd.para.source_type.keyword = isObject(sd.para.source_type.keyword) ? extend(search_keyword, sd.para.source_type.keyword) : search_keyword;
  }
  var collect_tags_default = {
    div: false
  };
  var ignore_tags_default = ['mark', '/mark', 'strong', 'b', 'em', 'i', 'u', 'abbr', 'ins', 'del', 's', 'sup'];
  if (sd.para.heatmap && !isObject(sd.para.heatmap)) {
    sd.para.heatmap = {};
  }
  if (isObject(sd.para.heatmap)) {
    sd.para.heatmap.clickmap = sd.para.heatmap.clickmap || 'default';
    sd.para.heatmap.scroll_notice_map = sd.para.heatmap.scroll_notice_map || 'default';
    sd.para.heatmap.scroll_delay_time = sd.para.heatmap.scroll_delay_time || 4000;
    sd.para.heatmap.scroll_event_duration = sd.para.heatmap.scroll_event_duration || 18000;
    sd.para.heatmap.renderRefreshTime = sd.para.heatmap.renderRefreshTime || 1000;
    sd.para.heatmap.loadTimeout = sd.para.heatmap.loadTimeout || 1000;

    if (sd.para.heatmap.get_vtrack_config !== true) {
      sd.para.heatmap.get_vtrack_config = false;
    }

    var trackAttrs = isArray(sd.para.heatmap.track_attr) ?
      filter(sd.para.heatmap.track_attr, function (v) {
        return v && typeof v === 'string';
      }) : [];
    trackAttrs.push('data-sensors-click');
    sd.para.heatmap.track_attr = trackAttrs;

    if (isObject(sd.para.heatmap.collect_tags)) {
      if (sd.para.heatmap.collect_tags.div === true) {
        sd.para.heatmap.collect_tags.div = {
          ignore_tags: ignore_tags_default,
          max_level: 1
        };
      } else if (isObject(sd.para.heatmap.collect_tags.div)) {
        if (sd.para.heatmap.collect_tags.div.ignore_tags) {
          if (!isArray(sd.para.heatmap.collect_tags.div.ignore_tags)) {
            sd.log('ignore_tags 参数必须是数组格式');
            sd.para.heatmap.collect_tags.div.ignore_tags = ignore_tags_default;
          }
        } else {
          sd.para.heatmap.collect_tags.div.ignore_tags = ignore_tags_default;
        }
        if (sd.para.heatmap.collect_tags.div.max_level) {
          var supportedDivLevel = [1, 2, 3];
          if (indexOf(supportedDivLevel, sd.para.heatmap.collect_tags.div.max_level) === -1) {
            sd.para.heatmap.collect_tags.div.max_level = 1;
          }
        }
      } else {
        sd.para.heatmap.collect_tags.div = false;
      }
    } else {
      sd.para.heatmap.collect_tags = collect_tags_default;
    }
  }
  if (isArray(sd.para.server_url) && sd.para.server_url.length) {
    for (i = 0; i < sd.para.server_url.length; i++) {
      if (!/sa\.gif[^\/]*$/.test(sd.para.server_url[i])) {
        sd.para.server_url[i] = sd.para.server_url[i].replace(/\/sa$/, '/sa.gif').replace(/(\/sa)(\?[^\/]+)$/, '/sa.gif$2');
      }
    }
  } else if (!/sa\.gif[^\/]*$/.test(sd.para.server_url) && typeof sd.para.server_url === 'string') {
    sd.para.server_url = sd.para.server_url.replace(/\/sa$/, '/sa.gif').replace(/(\/sa)(\?[^\/]+)$/, '/sa.gif$2');
  }
  if (typeof sd.para.server_url === 'string') {
    sd.para.debug_mode_url = sd.para.debug_mode_url || sd.para.server_url.replace('sa.gif', 'debug');
  }
  if (sd.para.noCache === true) {
    sd.para.noCache = '?' + new Date().getTime();
  } else {
    sd.para.noCache = '';
  }

  if (sd.para.callback_timeout > sd.para.datasend_timeout) {
    sd.para.datasend_timeout = sd.para.callback_timeout;
  }

  if (sd.para.heatmap && sd.para.heatmap.collect_tags && isObject(sd.para.heatmap.collect_tags)) {
    each(sd.para.heatmap.collect_tags, function (val, key) {
      if (key !== 'div' && val) {
        sd.heatmap.otherTags.push(key);
      }
    });
  }
  if (sd.para.heatmap && sd.para.heatmap.clickmap === 'default') {
    sd.heatmap.initUnlimitedTags();
  }
}