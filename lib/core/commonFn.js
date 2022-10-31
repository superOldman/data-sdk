import { isObject, isFunction, each, trim, _decodeURI } from '@/utils/index'
import { source_channel_standard, sdkversion_placeholder } from '@/constant'
import { getQueryParam, getURL } from "@/utils/tools";

export function parseSuperProperties(data) {
  var obj = data.properties;
  var copyData = JSON.parse(JSON.stringify(data));
  if (isObject(obj)) {
    each(obj, function (objVal, key) {
      if (isFunction(objVal)) {
        try {
          obj[key] = objVal(copyData);
          if (isFunction(obj[key])) {
            sdLog('您的属性- ' + key + ' 格式不满足要求，我们已经将其删除');
            delete obj[key];
          }
        } catch (e) {
          delete obj[key];
          sdLog('您的属性- ' + key + ' 抛出了异常，我们已经将其删除');
        }
      }
    });
  }
}

export function searchConfigData(data) {
  if (typeof data === 'object' && data.$option) {
    var data_config = data.$option;
    delete data.$option;
    return data_config;
  } else {
    return {};
  }
}


function strip_empty_properties(p) {
  var ret = {};
  each(p, function (v, k) {
    if (v != null) {
      ret[k] = v;
    }
  });
  return ret;
}

function getCurrentDomain(url) {
  var sdDomain = sdPara.current_domain;
  switch (typeof sdDomain) {
    case 'function':
      var resultDomain = sdDomain();
      if (resultDomain === '' || trim(resultDomain) === '') {
        return 'url解析失败';
      } else if (resultDomain.indexOf('.') !== -1) {
        return resultDomain;
      } else {
        return 'url解析失败';
      }
    case 'string':
      if (sdDomain === '' || trim(sdDomain) === '') {
        return 'url解析失败';
      } else if (sdDomain.indexOf('.') !== -1) {
        return sdDomain;
      } else {
        return 'url解析失败';
      }
    default:
      var cookieTopLevelDomain = getCookieTopLevelDomain(null, domain_test_key);
      if (url === '') {
        return 'url解析失败';
      } else if (cookieTopLevelDomain === '') {
        return 'url解析失败';
      } else {
        return cookieTopLevelDomain;
      }
  }
}

function getEleInfo(obj) {
  if (!obj.target) {
    return false;
  }

  var target = obj.target;
  var tagName = target.tagName.toLowerCase();

  var props = {};

  props.$element_type = tagName;
  props.$element_name = target.getAttribute('name');
  props.$element_id = target.getAttribute('id');
  props.$element_class_name = typeof target.className === 'string' ? target.className : null;
  props.$element_target_url = target.getAttribute('href');
  props.$element_content = getElementContent$1(target, tagName);
  props = strip_empty_properties(props);
  props.$url = getURL();
  props.$url_path = getURLPath();
  props.$title = document.title;

  return props;
}

function isBaiduTraffic() {
  var referer = document.referrer;
  var endsWith = 'baidu.com';
  if (!referer) {
    return false;
  }

  try {
    var hostname = _URL(referer).hostname;
    return hostname && hostname.substring(hostname.length - endsWith.length) === endsWith;
  } catch (e) {
    return false;
  }
}

function getReferrerEqid() {
  var query = getQueryParamsFromUrl(document.referrer);
  if (isEmptyObject(query) || !query.eqid) {
    return UUID().replace(/-/g, '');
  }
  return query.eqid;
}

function getReferrerEqidType() {
  var query = getQueryParamsFromUrl(document.referrer);
  if (isEmptyObject(query) || !query.eqid) {
    var url = getQueryParamsFromUrl(location.href);
    if (query.ck || url.utm_source) {
      return 'baidu_sem_keyword_id';
    }
    return 'baidu_other_keyword_id';
  }
  return 'baidu_seo_keyword_id';
}

export var getBaiduKeyword = {
  data: {},
  id: function () {
    if (this.data.id) {
      return this.data.id;
    } else {
      this.data.id = getReferrerEqid();
      return this.data.id;
    }
  },
  type: function () {
    if (this.data.type) {
      return this.data.type;
    } else {
      this.data.type = getReferrerEqidType();
      return this.data.type;
    }
  }
};


function isReferralTraffic(refererstring) {
  refererstring = refererstring || document.referrer;
  if (refererstring === '') {
    return true;
  }

  return getCookieTopLevelDomain(getHostname(refererstring), domain_test_key) !== getCookieTopLevelDomain(null, domain_test_key);
}

function getReferrer(referrer, full) {
  referrer = referrer || document.referrer;
  if (typeof referrer !== 'string') {
    return '取值异常_referrer异常_' + String(referrer);
  }
  referrer = trim(referrer);
  referrer = _decodeURI(referrer);
  if (referrer.indexOf('https://www.baidu.com/') === 0 && !full) {
    referrer = referrer.split('?')[0];
  }
  referrer = referrer.slice(0, sdPara.max_referrer_string_length);
  return typeof referrer === 'string' ? referrer : '';
}

function getKeywordFromReferrer(referrerUrl, activeValue) {
  referrerUrl = referrerUrl || document.referrer;
  var search_keyword = sdPara.source_type.keyword;
  if (document && typeof referrerUrl === 'string') {
    if (referrerUrl.indexOf('http') === 0) {
      var searchEngine = getReferSearchEngine(referrerUrl);
      var query = getQueryParamsFromUrl(referrerUrl);
      if (isEmptyObject(query)) {
        if (sdPara.preset_properties.search_keyword_baidu && isBaiduTraffic()) {
          return;
        } else {
          return '未取到值';
        }
      }
      var temp = null;
      for (var i in search_keyword) {
        if (searchEngine === i) {
          if (typeof query === 'object') {
            temp = search_keyword[i];
            if (isArray(temp)) {
              for (i = 0; i < temp.length; i++) {
                var _value = query[temp[i]];
                if (_value) {
                  if (activeValue) {
                    return {
                      active: _value
                    };
                  } else {
                    return _value;
                  }
                }
              }
            } else if (query[temp]) {
              if (activeValue) {
                return {
                  active: query[temp]
                };
              } else {
                return query[temp];
              }
            }
          }
        }
      }
      if (sdPara.preset_properties.search_keyword_baidu && isBaiduTraffic()) {
        return;
      } else {
        return '未取到值';
      }
    } else {
      if (referrerUrl === '') {
        return '未取到值_直接打开';
      } else {
        return '未取到值_非http的url';
      }
    }
  } else {
    return '取值异常_referrer异常_' + String(referrerUrl);
  }
}

function getWxAdIdFromUrl(url) {
  var click_id = getQueryParam(url, 'gdt_vid');
  var hash_key = getQueryParam(url, 'hash_key');
  var callbacks = getQueryParam(url, 'callbacks');
  var obj = {
    click_id: '',
    hash_key: '',
    callbacks: ''
  };
  if (isString(click_id) && click_id.length) {
    obj.click_id = click_id.length == 16 || click_id.length == 18 ? click_id : '参数解析不合法';

    if (isString(hash_key) && hash_key.length) {
      obj.hash_key = hash_key;
    }
    if (isString(callbacks) && callbacks.length) {
      obj.callbacks = callbacks;
    }
  }

  return obj;
}

// 获取搜索引擎
function getReferSearchEngine(referrerUrl) {
  var hostname = getHostname(referrerUrl);
  if (!hostname || hostname === 'hostname解析异常') {
    return '';
  }
  var searchEngineUrls = {
    baidu: [/^.*\.baidu\.com$/],
    bing: [/^.*\.bing\.com$/],
    google: [/^www\.google\.com$/, /^www\.google\.com\.[a-z]{2}$/, /^www\.google\.[a-z]{2}$/],
    sm: [/^m\.sm\.cn$/],
    so: [/^.+\.so\.com$/],
    sogou: [/^.*\.sogou\.com$/],
    yahoo: [/^.*\.yahoo\.com$/]
  };
  for (var prop in searchEngineUrls) {
    var urls = searchEngineUrls[prop];
    for (var i = 0, len = urls.length; i < len; i++) {
      if (urls[i].test(hostname)) {
        return prop;
      }
    }
  }
  return '未知搜索引擎';
}

function getSourceFromReferrer() {
  function getMatchStrFromArr(arr, str) {
    for (var i = 0; i < arr.length; i++) {
      if (str.split('?')[0].indexOf(arr[i]) !== -1) {
        return true;
      }
    }
  }

  var utm_reg = '(' + sdPara.source_type.utm.join('|') + ')\\=[^&]+';
  var search_engine = sdPara.source_type.search;
  var social_engine = sdPara.source_type.social;

  var referrer = document.referrer || '';
  var url = pageInfo.pageProp.url;
  if (url) {
    var utm_match = url.match(new RegExp(utm_reg));
    if (utm_match && utm_match[0]) {
      return '付费广告流量';
    } else if (getMatchStrFromArr(search_engine, referrer)) {
      return '自然搜索流量';
    } else if (getMatchStrFromArr(social_engine, referrer)) {
      return '社交网站流量';
    } else if (referrer === '') {
      return '直接流量';
    } else {
      return '引荐流量';
    }
  } else {
    return '获取url异常';
  }
}

// TODO 全局变量
var pageInfo = window.pageInfo = {
  initPage: function () {
    var referrer = getReferrer();
    var url = getURL();
    var url_domain = getCurrentDomain(url);
    if (!url_domain) {
      debug.jssdkDebug('url_domain异常_' + url + '_' + url_domain);
    }

    this.pageProp = {
      referrer: referrer,
      referrer_host: referrer ? getHostname(referrer) : '',
      url: url,
      url_host: getHostname(url, 'url_host取值异常'),
      url_domain: url_domain
    };
  },
  pageProp: {},

  campaignParams: function () {
    return sd.kit.getUtmData();
  },
  campaignParamsStandard: function (prefix, prefix_add) {
    prefix = prefix || '';
    prefix_add = prefix_add || '';
    var utms = pageInfo.campaignParams();
    var $utms = {},
      otherUtms = {};
    each(utms, function (v, i, utms) {
      if ((' ' + source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
        $utms[prefix + i] = utms[i];
      } else {
        otherUtms[prefix_add + i] = utms[i];
      }
    });
    return {
      $utms: $utms,
      otherUtms: otherUtms
    };
  },
  properties: function () {
    var viewportHeightValue = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    var viewportWidthValue = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
    var propertiesObj = {
      $timezone_offset: new Date().getTimezoneOffset(),
      $screen_height: Number(screen.height) || 0,
      $screen_width: Number(screen.width) || 0,
      $viewport_height: viewportHeightValue,
      $viewport_width: viewportWidthValue,
      $lib: 'js',
      $lib_version: sdkversion_placeholder
    };
    return propertiesObj;
  },
  currentProps: {},
  register: function (obj) {
    extend(pageInfo.currentProps, obj);
  }
};

function getInputElementValue(inputEle) {
  var allowCollectInputVal = sdPara.heatmap && typeof sdPara.heatmap.collect_input === 'function' && sdPara.heatmap.collect_input(inputEle);
  if (inputEle.type === 'button' || inputEle.type === 'submit' || allowCollectInputVal) {
    return inputEle.value || '';
  }
  return '';
}

function getElementContent$1(element, tagName) {
  if (isString(tagName) && tagName.toLowerCase() === 'input') {
    return getInputElementValue(element);
  }
  return getElementContent(element, tagName);
}

function ajax$1(para) {
  debug.protocol.ajax(para.url);
  return ajax(para);
}
import { cookie$1 } from '@/Storage/cookie.js'
import { addEvent$1 } from '@/Events/addEvent.js'
import EventEmitterSa from '@/Events/EventEmitterSa'
import { encrypt, decryptIfNeeded } from '@/utils/encryption.js'
export var common = {
  __proto__: null,
  parseSuperProperties: parseSuperProperties,
  searchConfigData: searchConfigData,
  strip_empty_properties: strip_empty_properties,
  getCurrentDomain: getCurrentDomain,
  getEleInfo: getEleInfo,
  isBaiduTraffic: isBaiduTraffic,
  getReferrerEqid: getReferrerEqid,
  getReferrerEqidType: getReferrerEqidType,
  getBaiduKeyword: getBaiduKeyword,
  isReferralTraffic: isReferralTraffic,
  getReferrer: getReferrer,
  getKeywordFromReferrer: getKeywordFromReferrer,
  getWxAdIdFromUrl: getWxAdIdFromUrl,
  getReferSearchEngine: getReferSearchEngine,
  getSourceFromReferrer: getSourceFromReferrer,
  info: pageInfo,
  // 
  ajax: ajax$1,
  getElementContent: getElementContent$1,
  cookie: cookie$1,
  addEvent: addEvent$1,
  EventEmitterSa: EventEmitterSa,
  // 
  encrypt: encrypt,
  decryptIfNeeded: decryptIfNeeded
};