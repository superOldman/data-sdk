import { saNewUser } from '@/saNewUser'
import { isString, isObject, isEmptyObject, getURL, isNumber, extend, isDate } from '@/utils/index'
import { dataStageImpl } from '@/Events/saEvent'
import { base64Decode, base64Encode,hashCode, encrypt, decryptIfNeeded } from '@/utils/encryption.js'
import { processGetUtmData } from '@/core/core'
import { parseSuperProperties, searchConfigData } from '@/core/commonFn'


var kit = {};
function processAddCustomProps(data) {
  return dataStageImpl.stage.process('addCustomProps', data);
}

function processFormatData(data) {
  return dataStageImpl.stage.process('formatData', data);
}

kit.buildData = function (p) {
  var data = {
    identities: {},
    distinct_id: sd.store.getDistinctId(),
    lib: {
      $lib: 'js',
      $lib_method: 'code',
      $lib_version: String(sd.lib_version)
    },
    properties: {}
  };

  if (isObject(p) && isObject(p.identities) && !isEmptyObject(p.identities)) {
    extend(data.identities, p.identities);
  } else {
    extend(data.identities, store._state.identities);
  }

  if (isObject(p) && isObject(p.properties) && !isEmptyObject(p.properties)) {
    if (p.properties.$lib_detail) {
      data.lib.$lib_detail = p.properties.$lib_detail;
      delete p.properties.$lib_detail;
    }
    if (p.properties.$lib_method) {
      data.lib.$lib_method = p.properties.$lib_method;
      delete p.properties.$lib_method;
    }
  }

  extend(data, sd.store.getUnionId(), p);

  processAddCustomProps(data);

  if (isObject(p.properties) && !isEmptyObject(p.properties)) {
    extend(data.properties, p.properties);
  }


  if (!p.type || p.type.slice(0, 7) !== 'profile') {

    data.properties = extend({}, pageInfo.properties(), store.getProps(), store.getSessionProps(), pageInfo.currentProps, data.properties);
    if (sd.para.preset_properties.latest_referrer && !isString(data.properties.$latest_referrer)) {
      data.properties.$latest_referrer = '取值异常';
    }
    if (sd.para.preset_properties.latest_search_keyword && !isString(data.properties.$latest_search_keyword)) {
      if (!sd.para.preset_properties.search_keyword_baidu || !isString(data.properties.$search_keyword_id) || !isNumber(data.properties.$search_keyword_id_hash) || !isString(data.properties.$search_keyword_id_type)) {
        data.properties.$latest_search_keyword = '取值异常';
      }
    }
    if (sd.para.preset_properties.latest_traffic_source_type && !isString(data.properties.$latest_traffic_source_type)) {
      data.properties.$latest_traffic_source_type = '取值异常';
    }
    if (sd.para.preset_properties.latest_landing_page && !isString(data.properties.$latest_landing_page)) {
      data.properties.$latest_landing_page = '取值异常';
    }
    if (sd.para.preset_properties.latest_wx_ad_click_id === 'not_collect') {
      delete data.properties._latest_wx_ad_click_id;
      delete data.properties._latest_wx_ad_hash_key;
      delete data.properties._latest_wx_ad_callbacks;
    } else if (sd.para.preset_properties.latest_wx_ad_click_id && !isString(data.properties._latest_wx_ad_click_id)) {
      data.properties._latest_wx_ad_click_id = '取值异常';
      data.properties._latest_wx_ad_hash_key = '取值异常';
      data.properties._latest_wx_ad_callbacks = '取值异常';
    }
    if (isString(data.properties._latest_wx_ad_click_id)) {
      data.properties.$url = getURL();
    }
  }

  if (data.properties.$time && isDate(data.properties.$time)) {
    data.time = data.properties.$time * 1;
    delete data.properties.$time;
  } else {
    data.time = new Date() * 1;
  }

  sd.vtrackBase.addCustomProps(data);

  parseSuperProperties(data);

  saNewUser.checkIsAddSign(data);
  saNewUser.checkIsFirstTime(data);

  sd.addReferrerHost(data);
  sd.addPropsHook(data);

  processFormatData(data);
  return data;
};

kit.sendData = function (data, callback) {
  var data_config = searchConfigData(data.properties);
  if (sd.para.debug_mode === true) {
    sd.log(data);
    sd.saEvent.debugPath(JSON.stringify(data), callback);
  } else {
    sd.sendState.getSendCall(data, data_config, callback);
  }
};

kit.encodeTrackData = function (data) {
  var dataStr = base64Encode(data);
  var crc = 'crc=' + hashCode(dataStr);
  return 'data=' + encodeURIComponent(dataStr) + '&ext=' + encodeURIComponent(crc);
};

kit.getUtmData = function () {
  return processGetUtmData();
};
export default kit