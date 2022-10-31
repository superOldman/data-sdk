import { isObject, isFunction,isEmptyObject, each,isString,isArray, getURLPath, isJSONString,getURL, extend } from '@/utils/index'
import { _localStorage, _sessionStorage } from '@/Storage/storage'
import { getKeywordFromReferrer,isReferralTraffic,getReferrer } from '@/core/commonFn'

var commonWays = {
  setOnlineState: function (state) {
    if (state === true && isObject(sd.para.jsapp) && typeof sd.para.jsapp.getData === 'function') {
      sd.para.jsapp.isOnline = true;
      var arr = sd.para.jsapp.getData();
      if (isArray(arr) && arr.length > 0) {
        each(arr, function (str) {
          if (isJSONString(str)) {
            sd.sendState.realtimeSend(JSON.parse(str));
          }
        });
      }
    } else {
      sd.para.jsapp.isOnline = false;
    }
  },
  autoTrackIsUsed: false,
  isReady: function (callback) {
    callback();
  },
  getUtm: function () {
    return pageInfo.campaignParams();
  },
  getStayTime: function () {
    return (new Date() - sd._t) / 1000;
  },
  setProfileLocal: function (obj) {
    if (!_localStorage.isSupport()) {
      sd.setProfile(obj);
      return false;
    }
    if (!isObject(obj) || isEmptyObject(obj)) {
      return false;
    }
    var saveData = sd.store.readObjectVal('sensorsdata_2015_jssdk_profile');
    var isNeedSend = false;
    if (isObject(saveData) && !isEmptyObject(saveData)) {
      for (var i in obj) {
        if ((i in saveData && saveData[i] !== obj[i]) || !(i in saveData)) {
          saveData[i] = obj[i];
          isNeedSend = true;
        }
      }
      if (isNeedSend) {
        sd.store.saveObjectVal('sensorsdata_2015_jssdk_profile', saveData);
        sd.setProfile(obj);
      }
    } else {
      sd.store.saveObjectVal('sensorsdata_2015_jssdk_profile', obj);
      sd.setProfile(obj);
    }
  },
  setInitReferrer: function () {
    var _referrer = getReferrer();
    sd.setOnceProfile({
      _init_referrer: _referrer,
      _init_referrer_host: pageInfo.pageProp.referrer_host
    });
  },
  setSessionReferrer: function () {
    var _referrer = getReferrer();
    sd.store.setSessionPropsOnce({
      _session_referrer: _referrer,
      _session_referrer_host: pageInfo.pageProp.referrer_host
    });
  },
  setDefaultAttr: function () {
    pageInfo.register({
      _current_url: location.href,
      _referrer: getReferrer(),
      _referring_host: pageInfo.pageProp.referrer_host
    });
  },
  trackHeatMap: function (target, props, callback) {
    if (typeof target === 'object' && target.tagName) {
      var tagName = target.tagName.toLowerCase();
      var parent_ele = target.parentNode.tagName.toLowerCase();
      var trackAttrs = sd.para.heatmap && sd.para.heatmap.track_attr ? sd.para.heatmap.track_attr : ['data-sensors-click'];
      if (tagName !== 'button' && tagName !== 'a' && parent_ele !== 'a' && parent_ele !== 'button' && tagName !== 'input' && tagName !== 'textarea' && !hasAttributes(target, trackAttrs)) {
        heatmap.start(null, target, tagName, props, callback);
      }
    }
  },
  trackAllHeatMap: function (target, props, callback) {
    if (typeof target === 'object' && target.tagName) {
      var tagName = target.tagName.toLowerCase();
      heatmap.start(null, target, tagName, props, callback);
    }
  },
  autoTrackSinglePage: function (para, callback) {
    var url;
    if (this.autoTrackIsUsed) {
      url = pageInfo.pageProp.url;
    } else {
      url = pageInfo.pageProp.referrer;
    }
    para = isObject(para) ? para : {};

    function getUtm() {
      var utms = pageInfo.campaignParams();
      var $utms = {};
      each(utms, function (v, i, utms) {
        if ((' ' + sd.source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
          $utms['$' + i] = utms[i];
        } else {
          $utms[i] = utms[i];
        }
      });
      return $utms;
    }

    var is_set_profile = !para.not_set_profile;
    if (para.not_set_profile) {
      delete para.not_set_profile;
    }

    function closure(p, c) {
      sd.track(
        '$pageview',
        extend({
          $referrer: url,
          $url: getURL(),
          $url_path: getURLPath(),
          $title: document.title
        },
          p,
          getUtm()
        ),
        c
      );
      url = getURL();
    }
    closure(para, callback);
    this.autoTrackSinglePage = closure;

    if (sd.is_first_visitor && is_set_profile) {
      var eqidObj = {};

      if (sd.para.preset_properties.search_keyword_baidu && isReferralTraffic(document.referrer) && isBaiduTraffic()) {
        eqidObj['$search_keyword_id'] = getBaiduKeyword.id();
        eqidObj['$search_keyword_id_type'] = getBaiduKeyword.type();
        eqidObj['$search_keyword_id_hash'] = hashCode53(eqidObj['$search_keyword_id']);
      }

      sd.setOnceProfile(
        extend({
          $first_visit_time: new Date(),
          $first_referrer: getReferrer(),
          $first_browser_language: isString(navigator.language) ? navigator.language.toLowerCase() : '取值异常',
          $first_browser_charset: typeof document.charset === 'string' ? document.charset.toUpperCase() : '取值异常',
          $first_traffic_source_type: getSourceFromReferrer(),
          $first_search_keyword: getKeywordFromReferrer()
        },
          getUtm(),
          eqidObj
        )
      );

      sd.is_first_visitor = false;
    }
  },
  autoTrackWithoutProfile: function (para, callback) {
    para = isObject(para) ? para : {};
    this.autoTrack(extend(para, {
      not_set_profile: true
    }), callback);
  },
  autoTrack: function (para, callback) {
    para = isObject(para) ? para : {};

    var utms = pageInfo.campaignParams();
    var $utms = {};
    each(utms, function (v, i, utms) {
      if ((' ' + sd.source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
        $utms['$' + i] = utms[i];
      } else {
        $utms[i] = utms[i];
      }
    });

    var is_set_profile = !para.not_set_profile;
    if (para.not_set_profile) {
      delete para.not_set_profile;
    }

    var current_page_url = location.href;

    if (sd.para.is_single_page) {
      addHashEvent(function () {
        var referrer = getReferrer(current_page_url, true);
        sd.track(
          '$pageview',
          extend({
            $referrer: referrer,
            $url: getURL(),
            $url_path: getURLPath(),
            $title: document.title
          },
            $utms,
            para
          ),
          callback
        );
        current_page_url = getURL();
      });
    }
    sd.track(
      '$pageview',
      extend({
        $referrer: getReferrer(null, true),
        $url: getURL(),
        $url_path: getURLPath(),
        $title: document.title
      },
        $utms,
        para
      ),
      callback
    );

    if (sd.is_first_visitor && is_set_profile) {
      var eqidObj = {};

      if (sd.para.preset_properties.search_keyword_baidu && isReferralTraffic(document.referrer) && isBaiduTraffic()) {
        eqidObj['$search_keyword_id'] = getBaiduKeyword.id();
        eqidObj['$search_keyword_id_type'] = getBaiduKeyword.type();
        eqidObj['$search_keyword_id_hash'] = hashCode53(eqidObj['$search_keyword_id']);
      }

      sd.setOnceProfile(
        extend({
          $first_visit_time: new Date(),
          $first_referrer: getReferrer(null, true),
          $first_browser_language: isString(navigator.language) ? navigator.language.toLowerCase() : '取值异常',
          $first_browser_charset: typeof document.charset === 'string' ? document.charset.toUpperCase() : '取值异常',
          $first_traffic_source_type: getSourceFromReferrer(),
          $first_search_keyword: getKeywordFromReferrer()
        },
          $utms,
          eqidObj
        )
      );

      sd.is_first_visitor = false;
    }

    this.autoTrackIsUsed = true;
  },
  getAnonymousID: function () {
    if (isEmptyObject(sd.store._state)) {
      return '请先初始化SDK';
    } else {
      return sd.store._state._first_id || sd.store._state.first_id || sd.store._state._distinct_id || sd.store._state.distinct_id;
    }
  },
  setPlugin: function (para) {
    if (!isObject(para)) {
      return false;
    }
    each(para, function (v, k) {
      if (isFunction(v)) {
        if (isObject(window.SensorsDataWebJSSDKPlugin) && window.SensorsDataWebJSSDKPlugin[k]) {
          v(window.SensorsDataWebJSSDKPlugin[k]);
        } else {
          sd.log(k + '没有获取到,请查阅文档，调整' + k + '的引入顺序！');
        }
      }
    });
  },
  useModulePlugin: function () {
    sd.use.apply(sd, arguments);
  },
  useAppPlugin: function () {
    this.setPlugin.apply(this, arguments);
  }
};
export default commonWays