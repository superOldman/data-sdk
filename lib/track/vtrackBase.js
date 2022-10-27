import { getDomBySelector } from '@/utils/tools'
var vtrackBase = {};
vtrackBase.initUrl = function() {
  var url_info = {
    server_url: {
      project: '',
      host: ''
    },
    page_url: {
      host: '',
      pathname: ''
    }
  };
  var serverParse;
  if (!isString(sd.para.server_url)) {
    sd.log('----vcollect---server_url必须为字符串');
    return false;
  }
  try {
    serverParse = _URL(sd.para.server_url);
    url_info.server_url.project = serverParse.searchParams.get('project') || 'default';
    url_info.server_url.host = serverParse.host;
  } catch (error) {
    sd.log('----vcollect---server_url解析异常', error);
    return false;
  }

  var urlParse;
  try {
    urlParse = _URL(location.href);
    url_info.page_url.host = urlParse.hostname;
    url_info.page_url.pathname = urlParse.pathname;
  } catch (error) {
    sd.log('----vcollect---页面地址解析异常', error);
    return false;
  }
  return url_info;
};

vtrackBase.isDiv = function(obj) {
  if (obj.element_path) {
    var pathArr = obj.element_path.split('>');
    var lastPath = trim(pathArr.pop());
    if (lastPath.slice(0, 3) !== 'div') {
      return false;
    }
  }
  return true;
};

vtrackBase.configIsMatchNew = function(properties, eventConf) {
  if (isString(properties.$element_selector) && isString(eventConf.element_selector)) {
    if (eventConf.element_field === 'element_selector' && eventConf['function'] === 'equal') {
      return properties.$element_selector === eventConf.element_selector;
    }
    if (eventConf.element_field === 'element_selector' && eventConf['function'] === 'contain') {
      return properties.$element_selector.indexOf(eventConf.element_selector) > -1;
    }
  }
  if (isString(properties.$element_path) && isString(eventConf.element_path)) {
    if (eventConf.element_field === 'element_path' && eventConf['function'] === 'equal') {
      return properties.$element_path === eventConf.element_path;
    }
    if (eventConf.element_field === 'element_path' && eventConf['function'] === 'contain') {
      return properties.$element_path.indexOf(eventConf.element_path) > -1;
    }
  }
  return false;
};

vtrackBase.configIsMatch = function(properties, eventConf) {
  if (eventConf.limit_element_content) {
    if (eventConf.element_content !== properties.$element_content) {
      return false;
    }
  }
  if (eventConf.limit_element_position) {
    if (eventConf.element_position !== String(properties.$element_position)) {
      return false;
    }
  }

  if (eventConf.element_field && eventConf['function']) {
    return vtrackBase.configIsMatchNew(properties, eventConf);
  } else {
    return vtrackBase.configIsMatchOldVersion(properties, eventConf);
  }
};

vtrackBase.configIsMatchOldVersion = function(properties, eventConf) {
  if (!eventConf.element_path) {
    return false;
  }
  if (properties.$element_position !== undefined) {
    if (eventConf.element_path !== properties.$element_path) {
      return false;
    }
  } else {
    if (sd.vtrackBase.isDiv({
        element_path: eventConf.element_path
      })) {
      if (properties.$element_path.indexOf(eventConf.element_path) < 0) {
        return false;
      }
    } else {
      if (eventConf.element_path !== properties.$element_path) {
        return false;
      }
    }
  }
  return true;
};

vtrackBase.filterConfig = function(data, events, page_url) {
  var arr = [];
  if (!page_url) {
    var urlinfo = vtrackBase.initUrl();
    if (!urlinfo) {
      return [];
    } else {
      page_url = urlinfo.page_url;
    }
  }
  if (data.event === '$WebClick') {
    each(events, function(item) {
      if (isObject(item) && (item.event_type === 'webclick' || item.event_type === 'appclick') && isObject(item.event)) {
        if (item.event.url_host === page_url.host && item.event.url_path === page_url.pathname) {
          if (vtrackBase.configIsMatch(data.properties, item.event)) {
            arr.push(item);
          }
        }
      }
    });
  }
  return arr;
};

vtrackBase.getPropElInLi = function(li, list_selector) {
  if (!(li && isElement(li) && isString(list_selector))) {
    return null;
  }
  if (li.tagName.toLowerCase() !== 'li') {
    return null;
  }
  var li_selector = sd.heatmap.getDomSelector(li);
  var selector;
  if (li_selector) {
    selector = li_selector + list_selector;
    var target = getDomBySelector(selector);
    if (target) {
      return target;
    } else {
      return null;
    }
  } else {
    sd.log('----custom---获取同级属性元素失败，selector信息异常', li_selector, list_selector);
    return null;
  }
};

vtrackBase.getProp = function(propConf, data) {
  if (!isObject(propConf)) {
    return false;
  }
  if (!(isString(propConf.name) && propConf.name.length > 0)) {
    sd.log('----vcustom----属性名不合法,属性抛弃', propConf.name);
    return false;
  }

  var result = {};
  var value;
  var regResult;

  if (propConf.method === 'content') {
    var el;
    if (isString(propConf.element_selector) && propConf.element_selector.length > 0) {
      el = getDomBySelector(propConf.element_selector);
    } else if (data && isString(propConf.list_selector)) {
      var clickTarget = getDomBySelector(data.properties.$element_selector);
      if (clickTarget) {
        var closeli = sd.heatmap.getClosestLi(clickTarget);
        el = vtrackBase.getPropElInLi(closeli, propConf.list_selector);
      } else {
        sd.log('----vcustom----点击元素获取异常，属性抛弃', propConf.name);
        return false;
      }
    } else {
      sd.log('----vcustom----属性配置异常，属性抛弃', propConf.name);
      return false;
    }

    if (el && isElement(el)) {
      if (el.tagName.toLowerCase() === 'input') {
        value = el.value || '';
      } else if (el.tagName.toLowerCase() === 'select') {
        var sid = el.selectedIndex;
        if (isNumber(sid) && isElement(el[sid])) {
          value = getElementContent$1(el[sid], 'select');
        }
      } else {
        value = getElementContent$1(el, el.tagName.toLowerCase());
      }
    } else {
      sd.log('----vcustom----属性元素获取失败，属性抛弃', propConf.name);
      return false;
    }

    if (propConf.regular) {
      try {
        regResult = new RegExp(propConf.regular).exec(value);
      } catch (error) {
        sd.log('----vcustom----正则处理失败，属性抛弃', propConf.name);
        return false;
      }

      if (regResult === null) {
        sd.log('----vcustom----属性规则处理，未匹配到结果,属性抛弃', propConf.name);
        return false;
      } else {
        if (!(isArray(regResult) && isString(regResult[0]))) {
          sd.log('----vcustom----正则处理异常，属性抛弃', propConf.name, regResult);
          return false;
        }
        value = regResult[0];
      }
    }

    if (propConf.type === 'STRING') {
      result[propConf.name] = value;
    } else if (propConf.type === 'NUMBER') {
      if (value.length < 1) {
        sd.log('----vcustom----未获取到数字内容，属性抛弃', propConf.name, value);
        return false;
      }
      if (!isNaN(Number(value))) {
        result[propConf.name] = Number(value);
      } else {
        sd.log('----vcustom----数字类型属性转换失败，属性抛弃', propConf.name, value);
        return false;
      }
    }

    return result;
  } else {
    sd.log('----vcustom----属性不支持此获取方式', propConf.name, propConf.method);
    return false;
  }
};

vtrackBase.getAssignConfigs = function(func, config) {
  var url_info = vtrackBase.initUrl();
  if (!(url_info && url_info.page_url)) {
    return [];
  }
  if (!isObject(config)) {
    return [];
  }
  var arr = [];
  config.events = config.events || config.eventList;

  if (!(isArray(config.events) && config.events.length > 0)) {
    return [];
  }

  each(config.events, function(event) {
    if (isObject(event) && isObject(event.event) && event.event.url_host === url_info.page_url.host && event.event.url_path === url_info.page_url.pathname) {
      if (func(event)) {
        arr.push(event);
      }
    }
  });

  return arr;
};

vtrackBase.addCustomProps = function(data) {
  if (sd.bridge.bridge_info.verify_success === 'success') {
    var h5_props = sd.vapph5collect.customProp.geth5Props(JSON.parse(JSON.stringify(data)));
    if (isObject(h5_props) && !isEmptyObject(h5_props)) {
      data.properties = extend(data.properties, h5_props);
    }
  }

  var props = sd.vtrackcollect.customProp.getVtrackProps(JSON.parse(JSON.stringify(data)));
  if (isObject(props) && !isEmptyObject(props)) {
    data.properties = extend(data.properties, props);
  }
  return data;
};

vtrackBase.init = function() {
  sd.vtrackcollect.init();

  if (sd.bridge.bridge_info.verify_success === 'success') {
    sd.vapph5collect.init();
  }
};

export default vtrackBase