import { cookie$1 } from '@/Storage/cookie.js'
import { isObject, each, getURL } from '@/utils/index'

function getNewUserFlagKey(name_prefix, url) {
  var sub = '';
  url = url || location.href;
  if (sdPara.cross_subdomain === false) {
    try {
      sub = _URL(url).hostname;
    } catch (e) {
      sdLog(e);
    }
    if (typeof sub === 'string' && sub !== '') {
      sub = 'sajssdk_2015_' + sdPara.sdk_id + name_prefix + '_' + sub.replace(/\./g, '_');
    } else {
      sub = 'sajssdk_2015_root_' + sdPara.sdk_id + name_prefix;
    }
  } else {
    sub = 'sajssdk_2015_cross_' + sdPara.sdk_id + name_prefix;
  }
  return sub;
}

cookie$1.getNewUser = isNewUser;

function isNewUser() {
  var prefix = 'new_user';
  if (cookie$1.isSupport()) {
    if (cookie$1.get('sensorsdata_is_new_user') !== null || cookie$1.get(getNewUserFlagKey(prefix)) !== null) {
      return true;
    }
    return false;
  } else {
    if (memory.get(memory.getNewUserFlagMemoryKey(prefix)) !== null) return true;
    return false;
  }
}

var memory = {
  data: {},

  get: function (name) {
    var value = this.data[name];
    if (value === undefined) return null;
    if (value._expirationTimestamp_ !== undefined) {
      if (new Date().getTime() > value._expirationTimestamp_) {
        return null;
      }
      return value.value;
    }
    return value;
  },

  set: function (name, value, days) {
    if (days) {
      var date = new Date();
      var expirationTimestamp;
      if (String(days).slice(-1) === 's') {
        expirationTimestamp = date.getTime() + Number(String(days).slice(0, -1)) * 1000;
      } else {
        expirationTimestamp = date.getTime() + days * 24 * 60 * 60 * 1000;
      }
      value = {
        value: value,
        _expirationTimestamp_: expirationTimestamp
      };
    }
    this.data[name] = value;
  },

  getNewUserFlagMemoryKey: function (name_prefix) {
    return 'sajssdk_2015_' + sdPara.sdk_id + name_prefix;
  }
};

export var saNewUser = {
  checkIsAddSign: function (data) {
    if (data.type === 'track') {
      if (isNewUser()) {
        data.properties.$is_first_day = true;
      } else {
        data.properties.$is_first_day = false;
      }
    }
  },
  is_first_visit_time: false,
  is_page_first_visited: false,
  checkIsFirstTime: function (data) {
    if (data.type === 'track' && data.event === '$pageview') {
      if (this.is_first_visit_time) {
        data.properties.$is_first_time = true;
        this.is_first_visit_time = false;
      } else {
        data.properties.$is_first_time = false;
      }
    }
  },
  setDeviceId: function (uuid) {
    var device_id = null;
    var ds = cookie$1.get('sensorsdata2015jssdkcross' + sd.para.sdk_id);
    ds = decryptIfNeeded(ds);
    var state = {};
    if (ds != null && isJSONString(ds)) {
      state = JSON.parse(ds);
      if (state.$device_id) {
        device_id = state.$device_id;
      }
    }

    device_id = device_id || uuid;

    if (sd.para.cross_subdomain === true) {
      sd.store.set('$device_id', device_id);
    } else {
      state.$device_id = device_id;
      state = JSON.stringify(state);
      if (sd.para.encrypt_cookie) {
        state = encrypt(state);
      }
      cookie$1.set('sensorsdata2015jssdkcross' + sd.para.sdk_id, state, null, true);
    }

    if (sd.para.is_track_device_id) {
      pageInfo.currentProps.$device_id = device_id;
    }
  },
  storeInitCheck: function () {
    if (sd.is_first_visitor) {
      var date = new Date();
      var obj = {
        h: 23 - date.getHours(),
        m: 59 - date.getMinutes(),
        s: 59 - date.getSeconds()
      };
      if (cookie$1.isSupport()) {
        cookie$1.set(getNewUserFlagKey('new_user'), '1', obj.h * 3600 + obj.m * 60 + obj.s + 's');
      } else {
        memory.set(memory.getNewUserFlagMemoryKey('new_user'), '1', obj.h * 3600 + obj.m * 60 + obj.s + 's');
      }
      this.is_first_visit_time = true;
      this.is_page_first_visited = true;
    } else {
      if (!isNewUser()) {
        this.checkIsAddSign = function (data) {
          if (data.type === 'track') {
            data.properties.$is_first_day = false;
          }
        };
      }
      this.checkIsFirstTime = function (data) {
        if (data.type === 'track' && data.event === '$pageview') {
          data.properties.$is_first_time = false;
        }
      };
    }
  },
  checkIsFirstLatest: function () {
    var url_domain = pageInfo.pageProp.url_domain;


    var latestObj = {};

    if (url_domain === '') {
      url_domain = 'url解析失败';
    }

    var baiduKey = getKeywordFromReferrer(document.referrer, true);
    if (sd.para.preset_properties.search_keyword_baidu) {
      if (isReferralTraffic(document.referrer)) {
        if (isBaiduTraffic() && !(isObject(baiduKey) && baiduKey.active)) {
          latestObj['$search_keyword_id'] = getBaiduKeyword.id();
          latestObj['$search_keyword_id_type'] = getBaiduKeyword.type();
          latestObj['$search_keyword_id_hash'] = hashCode53(latestObj['$search_keyword_id']);
        } else {
          if (sd.store._state && sd.store._state.props) {
            sd.store._state.props.$search_keyword_id && delete sd.store._state.props.$search_keyword_id;
            sd.store._state.props.$search_keyword_id_type && delete sd.store._state.props.$search_keyword_id_type;
            sd.store._state.props.$search_keyword_id_hash && delete sd.store._state.props.$search_keyword_id_hash;
          }
        }
      }
    } else {
      if (sd.store._state && sd.store._state.props) {
        sd.store._state.props.$search_keyword_id && delete sd.store._state.props.$search_keyword_id;
        sd.store._state.props.$search_keyword_id_type && delete sd.store._state.props.$search_keyword_id_type;
        sd.store._state.props.$search_keyword_id_hash && delete sd.store._state.props.$search_keyword_id_hash;
      }
    }

    sd.store.save();

    each(sd.para.preset_properties, function (value, key) {
      if (key.indexOf('latest_') === -1) {
        return false;
      }
      key = key.slice(7);
      if (value) {
        if (key === 'wx_ad_click_id' && value === 'not_collect') {
          return false;
        }
        if (key !== 'utm' && url_domain === 'url解析失败') {
          if (key === 'wx_ad_click_id') {
            latestObj['_latest_wx_ad_click_id'] = 'url的domain解析失败';
            latestObj['_latest_wx_ad_hash_key'] = 'url的domain解析失败';
            latestObj['_latest_wx_ad_callbacks'] = 'url的domain解析失败';
          } else {
            latestObj['$latest_' + key] = 'url的domain解析失败';
          }
        } else if (isReferralTraffic(document.referrer)) {
          switch (key) {
            case 'traffic_source_type':
              latestObj['$latest_traffic_source_type'] = getSourceFromReferrer();
              break;
            case 'referrer':
              latestObj['$latest_referrer'] = pageInfo.pageProp.referrer;
              break;
            case 'search_keyword':
              if (getKeywordFromReferrer()) {
                latestObj['$latest_search_keyword'] = getKeywordFromReferrer();
              } else if (isObject(sd.store._state) && isObject(sd.store._state.props) && sd.store._state.props.$latest_search_keyword) {
                delete sd.store._state.props.$latest_search_keyword;
              }
              break;
            case 'landing_page':
              latestObj['$latest_landing_page'] = getURL();
              break;
            case 'wx_ad_click_id':
              var adObj = getWxAdIdFromUrl(location.href);
              latestObj['_latest_wx_ad_click_id'] = adObj.click_id;
              latestObj['_latest_wx_ad_hash_key'] = adObj.hash_key;
              latestObj['_latest_wx_ad_callbacks'] = adObj.callbacks;
              break;
          }
        }
      } else {
        if (key === 'utm' && sd.store._state && sd.store._state.props) {
          for (var key1 in sd.store._state.props) {
            if (key1.indexOf('$latest_utm') === 0 || (key1.indexOf('_latest_') === 0 && key1.indexOf('_latest_wx_ad_') < 0)) {
              delete sd.store._state.props[key1];
            }
          }
        } else if (sd.store._state && sd.store._state.props && '$latest_' + key in sd.store._state.props) {
          delete sd.store._state.props['$latest_' + key];
        } else if (key == 'wx_ad_click_id' && sd.store._state && sd.store._state.props && value === false) {
          var wxPro = ['_latest_wx_ad_click_id', '_latest_wx_ad_hash_key', '_latest_wx_ad_callbacks'];
          each(wxPro, function (value) {
            if (value in sd.store._state.props) {
              delete sd.store._state.props[value];
            }
          });
        }
      }
    });

    sd.register(latestObj);

    if (sd.para.preset_properties.latest_utm) {
      var allUtms = pageInfo.campaignParamsStandard('$latest_', '_latest_');
      var $utms = allUtms.$utms;
      var otherUtms = allUtms.otherUtms;
      if (!isEmptyObject($utms)) {
        sd.register($utms);
      }
      if (!isEmptyObject(otherUtms)) {
        sd.register(otherUtms);
      }
    }
  }
};