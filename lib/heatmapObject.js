var UNLIMITED_TAGS_MAP = {
  label: false,
  li: false,
  a: true,
  button: true
};

 var heatmap = {
  otherTags: [],
  initUnlimitedTags: function() {
    each(heatmap.otherTags, function(tagName) {
      if (tagName in UNLIMITED_TAGS_MAP) {
        UNLIMITED_TAGS_MAP[tagName] = true;
      }
    });
  },
  isUnlimitedTag: function(el) {
    if (!el || el.nodeType !== 1) return false;
    var tagName = el.nodeName.toLowerCase();
    return UNLIMITED_TAGS_MAP[tagName] || hasAttributes(el, sd.para.heatmap.track_attr);
  },
  getTargetElement: function(element, e) {
    var that = this;
    var target = element;
    if (typeof target !== 'object') {
      return null;
    }
    if (typeof target.tagName !== 'string') {
      return null;
    }
    var tagName = target.tagName.toLowerCase();
    if (tagName.toLowerCase() === 'body' || tagName.toLowerCase() === 'html') {
      return null;
    }
    if (!target || !target.parentNode || !target.parentNode.children) {
      return null;
    }

    var parent_ele = target.parentNode;

    var otherTags = that.otherTags;

    if (tagName === 'a' || tagName === 'button' || tagName === 'input' || tagName === 'textarea') {
      return target;
    }
    if (indexOf(otherTags, tagName) > -1) {
      return target;
    }
    if (tagName === 'area' && parent_ele.tagName.toLowerCase() === 'map' && ry(parent_ele).prev().tagName && ry(parent_ele).prev().tagName.toLowerCase() === 'img') {
      return ry(parent_ele).prev();
    }
    if (tagName === 'div' && sd.para.heatmap.collect_tags.div && that.isDivLevelValid(target)) {
      var max_level = (sd.para.heatmap && sd.para.heatmap.collect_tags && sd.para.heatmap.collect_tags.div && sd.para.heatmap.collect_tags.div.max_level) || 1;
      if (max_level > 1 || that.isCollectableDiv(target)) {
        return target;
      }
    }
    if (that.isStyleTag(tagName) && sd.para.heatmap.collect_tags.div) {
      var parentTrackDiv = that.getCollectableParent(target);
      if (parentTrackDiv && that.isDivLevelValid(parentTrackDiv)) {
        return parentTrackDiv;
      }
    }
    var unlimitedTag = that.hasElement({
      event: (e && e.originalEvent) || e,
      element: element
    }, function(target) {
      return that.isUnlimitedTag(target);
    });
    return unlimitedTag || null;
  },
  getDivLevels: function(element, rootElement) {
    var path = heatmap.getElementPath(element, true, rootElement);
    var pathArr = path.split(' > ');
    var ans = 0;
    each(pathArr, function(tag) {
      if (tag === 'div') {
        ans++;
      }
    });
    return ans;
  },
  isDivLevelValid: function(element) {
    var max_level = (sd.para.heatmap && sd.para.heatmap.collect_tags && sd.para.heatmap.collect_tags.div && sd.para.heatmap.collect_tags.div.max_level) || 1;

    var allDiv = element.getElementsByTagName('div');
    for (var i = allDiv.length - 1; i >= 0; i--) {
      if (heatmap.getDivLevels(allDiv[i], element) > max_level) {
        return false;
      }
    }
    return true;
  },
  getElementPath: function(element, ignoreID, rootElement) {
    var names = [];
    while (element.parentNode) {
      if (element.id && !ignoreID && /^[A-Za-z][-A-Za-z0-9_:.]*$/.test(element.id)) {
        names.unshift(element.tagName.toLowerCase() + '#' + element.id);
        break;
      } else {
        if (rootElement && element === rootElement) {
          names.unshift(element.tagName.toLowerCase());
          break;
        } else if (element === document.body) {
          names.unshift('body');
          break;
        } else {
          names.unshift(element.tagName.toLowerCase());
        }
        element = element.parentNode;
      }
    }
    return names.join(' > ');
  },
  getClosestLi: function(element) {
    var getClosest = function(elem, selector) {
      for (; elem && elem !== document && elem.nodeType === 1; elem = elem.parentNode) {
        if (elem.tagName.toLowerCase() === selector) {
          return elem;
        }
      }
      return null;
    };
    return getClosest(element, 'li');
  },
  getElementPosition: function(element, elementPath, ignoreID) {
    var closestLi = sd.heatmap.getClosestLi(element);
    if (!closestLi) {
      return null;
    }
    var tag = element.tagName.toLowerCase();
    var sameTypeTags = closestLi.getElementsByTagName(tag);
    var sameTypeTagsLen = sameTypeTags.length;
    var arr = [];
    if (sameTypeTagsLen > 1) {
      for (var i = 0; i < sameTypeTagsLen; i++) {
        var elepath = sd.heatmap.getElementPath(sameTypeTags[i], ignoreID);
        if (elepath === elementPath) {
          arr.push(sameTypeTags[i]);
        }
      }
      if (arr.length > 1) {
        return indexOf(arr, element);
      }
    }

    function _getPosition(element) {
      var parentNode = element.parentNode;
      if (!parentNode) {
        return '';
      }
      var sameTypeSiblings = ry(element).getSameTypeSiblings();
      var typeLen = sameTypeSiblings.length;
      if (typeLen === 1) {
        return 0;
      }
      for (var i = 0, e = element; ry(e).previousElementSibling().ele; e = ry(e).previousElementSibling().ele, i++);
      return i;
    }
    return _getPosition(closestLi);
  },
  setNotice: function(web_url) {
    sd.is_heatmap_render_mode = true;

    if (!sd.para.heatmap) {
      sd.errorMsg = '您SDK没有配置开启点击图，可能没有数据！';
    }
    if (web_url) {
      if (web_url.slice(0, 5) === 'http:' && location.protocol === 'https:') {
        sd.errorMsg = '您的当前页面是https的地址，神策分析环境也必须是https！';
      }
    }
    if (!sd.para.heatmap_url) {
      sd.para.heatmap_url = getSafeHttpProtocol() + '//static.sensorsdata.cn/sdk/' + sd.lib_version + '/heatmap.min.js';
    }
  },
  getDomIndex: function(el) {
    if (!el.parentNode) return -1;
    var i = 0;
    var nodeName = el.tagName;
    var list = el.parentNode.children;
    for (var n = 0; n < list.length; n++) {
      if (list[n].tagName === nodeName) {
        if (el === list[n]) {
          return i;
        } else {
          i++;
        }
      }
    }
    return -1;
  },
  selector: function(el, notuseid) {
    var i = el.parentNode && 9 == el.parentNode.nodeType ? -1 : this.getDomIndex(el);
    if (el.getAttribute && el.getAttribute('id') && /^[A-Za-z][-A-Za-z0-9_:.]*$/.test(el.getAttribute('id')) && (!sd.para.heatmap || (sd.para.heatmap && sd.para.heatmap.element_selector !== 'not_use_id')) && !notuseid) {
      return '#' + el.getAttribute('id');
    } else {
      return el.tagName.toLowerCase() + (~i ? ':nth-of-type(' + (i + 1) + ')' : '');
    }
  },
  getDomSelector: function(el, arr, notuseid) {
    if (!el || !el.parentNode || !el.parentNode.children) {
      return false;
    }
    arr = arr && arr.join ? arr : [];
    var name = el.nodeName.toLowerCase();
    if (!el || name === 'body' || 1 != el.nodeType) {
      arr.unshift('body');
      return arr.join(' > ');
    }
    arr.unshift(this.selector(el, notuseid));
    if (el.getAttribute && el.getAttribute('id') && /^[A-Za-z][-A-Za-z0-9_:.]*$/.test(el.getAttribute('id')) && sd.para.heatmap && sd.para.heatmap.element_selector !== 'not_use_id' && !notuseid) return arr.join(' > ');
    return this.getDomSelector(el.parentNode, arr, notuseid);
  },
  na: function() {
    var a = document.documentElement.scrollLeft || window.pageXOffset;
    return parseInt(isNaN(a) ? 0 : a, 10);
  },
  i: function() {
    var a = 0;
    try {
      (a = (o.documentElement && o.documentElement.scrollTop) || m.pageYOffset), (a = isNaN(a) ? 0 : a);
    } catch (b) {
      a = 0;
    }
    return parseInt(a, 10);
  },
  getBrowserWidth: function() {
    var a = window.innerWidth || document.body.clientWidth;
    return isNaN(a) ? 0 : parseInt(a, 10);
  },
  getBrowserHeight: function() {
    var a = window.innerHeight || document.body.clientHeight;
    return isNaN(a) ? 0 : parseInt(a, 10);
  },
  getScrollWidth: function() {
    var a = parseInt(document.body.scrollWidth, 10);
    return isNaN(a) ? 0 : a;
  },
  getEleDetail: function(target) {
    var selector = this.getDomSelector(target);
    var prop = getEleInfo({
      target: target
    });
    prop.$element_selector = selector ? selector : '';
    prop.$element_path = sd.heatmap.getElementPath(target, sd.para.heatmap && sd.para.heatmap.element_selector === 'not_use_id');
    var element_position = sd.heatmap.getElementPosition(target, prop.$element_path, sd.para.heatmap && sd.para.heatmap.element_selector === 'not_use_id');
    if (isNumber(element_position)) {
      prop.$element_position = element_position;
    }
    return prop;
  },
  getPointerEventProp: function(ev, target) {
    if (!ev) {
      return {};
    }

    function getScroll() {
      var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft || 0;
      var scrollTop = document.body.scrollTop || document.documentElement.scrollTop || 0;
      return {
        scrollLeft: scrollLeft,
        scrollTop: scrollTop
      };
    }

    function getElementPosition(target) {
      if (document.documentElement.getBoundingClientRect) {
        var targetEle = target.getBoundingClientRect();
        return {
          targetEleX: targetEle.left + getScroll().scrollLeft || 0,
          targetEleY: targetEle.top + getScroll().scrollTop || 0
        };
      }
    }

    function toFixedThree(val) {
      return Number(Number(val).toFixed(3));
    }

    function getPage(ev) {
      var pageX = ev.pageX || ev.clientX + getScroll().scrollLeft || ev.offsetX + getElementPosition(target).targetEleX || 0;
      var pageY = ev.pageY || ev.clientY + getScroll().scrollTop || ev.offsetY + getElementPosition(target).targetEleY || 0;
      return {
        $page_x: toFixedThree(pageX),
        $page_y: toFixedThree(pageY)
      };
    }
    return getPage(ev);
  },
  start: function(ev, target, tagName, customProps, callback) {
    var userCustomProps = isObject(customProps) ? customProps : {};
    var userCallback = isFunction(callback) ? callback : isFunction(customProps) ? customProps : undefined;
    if (sd.para.heatmap && sd.para.heatmap.collect_element && !sd.para.heatmap.collect_element(target)) {
      return false;
    }

    var prop = this.getEleDetail(target);

    if (sd.para.heatmap && sd.para.heatmap.custom_property) {
      var customP = sd.para.heatmap.custom_property(target);
      if (isObject(customP)) {
        prop = extend(prop, customP);
      }
    }
    prop = extend(prop, this.getPointerEventProp(ev, target), userCustomProps);
    if (tagName === 'a' && sd.para.heatmap && sd.para.heatmap.isTrackLink === true) {
      sd.trackLink({
        event: ev,
        target: target
      }, '$WebClick', prop);
    } else {
      sd.track('$WebClick', prop, userCallback);
    }
  },
  hasElement: function(obj, func) {
    var path;
    if (obj.event) {
      var e = obj.event;
      path = e.path || (e._getPath && e._getPath());
    } else if (obj.element) {
      path = ry(obj.element).getParents();
    }

    if (path) {
      if (isArray(path) && path.length > 0) {
        for (var i = 0; i < path.length; i++) {
          if (typeof path[i] === 'object' && path[i].nodeType === 1 && func(path[i])) {
            return path[i];
          }
        }
      }
    }
  },
  isStyleTag: function(tagname, isVisualMode) {
    var defaultTag = ['a', 'div', 'input', 'button', 'textarea'];
    var ignore_tags_default = ['mark', '/mark', 'strong', 'b', 'em', 'i', 'u', 'abbr', 'ins', 'del', 's', 'sup'];
    if (indexOf(defaultTag, tagname) > -1) {
      return false;
    }
    if (isVisualMode && (!sd.para.heatmap || !sd.para.heatmap.collect_tags || !sd.para.heatmap.collect_tags.div)) {
      return indexOf(ignore_tags_default, tagname) > -1;
    } else if (isObject(sd.para.heatmap) && isObject(sd.para.heatmap.collect_tags) && isObject(sd.para.heatmap.collect_tags.div) && isArray(sd.para.heatmap.collect_tags.div.ignore_tags) && indexOf(sd.para.heatmap.collect_tags.div.ignore_tags, tagname) > -1) {
      return true;
    }
    return false;
  },
  isCollectableDiv: function(target, isVisualMode) {
    try {
      if (target.children.length === 0) {
        return true;
      } else {
        for (var i = 0; i < target.children.length; i++) {
          if (target.children[i].nodeType !== 1) {
            continue;
          }
          var tag = target.children[i].tagName.toLowerCase();
          var max_level = sd.para && sd.para.heatmap && sd.para.heatmap.collect_tags && sd.para.heatmap.collect_tags.div && sd.para.heatmap.collect_tags.div.max_level;
          if ((tag === 'div' && max_level > 1) || this.isStyleTag(tag, isVisualMode)) {
            if (!this.isCollectableDiv(target.children[i], isVisualMode)) {
              return false;
            }
          } else {
            return false;
          }
        }
        return true;
      }
    } catch (error) {
      sd.log(error);
    }
    return false;
  },
  getCollectableParent: function(target, isVisualMode) {
    try {
      var parent = target.parentNode;
      var parentName = parent ? parent.tagName.toLowerCase() : '';
      if (parentName === 'body') {
        return false;
      }
      var max_level = sd.para && sd.para.heatmap && sd.para.heatmap.collect_tags && sd.para.heatmap.collect_tags.div && sd.para.heatmap.collect_tags.div.max_level;
      if (parentName && parentName === 'div' && (max_level > 1 || this.isCollectableDiv(parent, isVisualMode))) {
        return parent;
      } else if (parent && this.isStyleTag(parentName, isVisualMode)) {
        return this.getCollectableParent(parent, isVisualMode);
      }
    } catch (error) {
      sd.log(error);
    }
    return false;
  },
  listenUrlChange: function(callback) {
    callback();
    sd.ee.spa.on('switch', function() {
      callback();
    });
  },
  initScrollmap: function() {
    if (!isObject(sd.para.heatmap) || sd.para.heatmap.scroll_notice_map !== 'default') {
      return false;
    }
    var isPageCollect = true;
    if (sd.para.scrollmap && isFunction(sd.para.scrollmap.collect_url)) {
      this.listenUrlChange(function() {
        isPageCollect = !!sd.para.scrollmap.collect_url();
      });
    }

    var interDelay = function(param) {
      var interDelay = {};
      interDelay.timeout = param.timeout || 1000;
      interDelay.func = param.func;
      interDelay.hasInit = false;
      interDelay.inter = null;
      interDelay.main = function(para, isClose) {
        this.func(para, isClose);
        this.inter = null;
      };
      interDelay.go = function(isNoDelay) {
        var para = {};
        if (!this.inter) {
          para.$viewport_position = (document.documentElement && document.documentElement.scrollTop) || window.pageYOffset || document.body.scrollTop || 0;
          para.$viewport_position = Math.round(para.$viewport_position) || 0;
          if (isNoDelay) {
            interDelay.main(para, true);
          } else {
            this.inter = setTimeout(function() {
              interDelay.main(para);
            }, this.timeout);
          }
        }
      };
      return interDelay;
    };

    var delayTime = interDelay({
      timeout: 1000,
      func: function(para, isClose) {
        var offsetTop = (document.documentElement && document.documentElement.scrollTop) || window.pageYOffset || document.body.scrollTop || 0;
        var current_time = new Date();
        var delay_time = current_time - this.current_time;
        if ((delay_time > sd.para.heatmap.scroll_delay_time && offsetTop - para.$viewport_position !== 0) || isClose) {
          para.$url = getURL();
          para.$title = document.title;
          para.$url_path = getURLPath();
          para.event_duration = Math.min(sd.para.heatmap.scroll_event_duration, parseInt(delay_time) / 1000);
          para.event_duration = para.event_duration < 0 ? 0 : para.event_duration;
          sd.track('$WebStay', para);
        }
        this.current_time = current_time;
      }
    });

    delayTime.current_time = new Date();

    addEvent$1(window, 'scroll', function() {
      if (!isPageCollect) {
        return false;
      }
      delayTime.go();
    });

    addEvent$1(window, 'unload', function() {
      if (!isPageCollect) {
        return false;
      }
      delayTime.go('notime');
    });
  },
  initHeatmap: function() {
    var that = this;
    var isPageCollect = true;
    if (!isObject(sd.para.heatmap) || sd.para.heatmap.clickmap !== 'default') {
      return false;
    }

    if (isFunction(sd.para.heatmap.collect_url)) {
      this.listenUrlChange(function() {
        isPageCollect = !!sd.para.heatmap.collect_url();
      });
    }

    if (sd.para.heatmap.collect_elements === 'all') {
      sd.para.heatmap.collect_elements = 'all';
    } else {
      sd.para.heatmap.collect_elements = 'interact';
    }
    if (sd.para.heatmap.collect_elements === 'all') {
      addEvent$1(document, 'click', function(e) {
        if (!isPageCollect) return false;
        var ev = e || window.event;
        if (!ev) {
          return false;
        }
        var target = ev.target || ev.srcElement;
        if (typeof target !== 'object') {
          return false;
        }
        if (typeof target.tagName !== 'string') {
          return false;
        }
        var tagName = target.tagName.toLowerCase();
        if (tagName === 'body' || tagName === 'html') {
          return false;
        }
        if (!target || !target.parentNode || !target.parentNode.children) {
          return false;
        }
        var parent_ele = target.parentNode.tagName.toLowerCase();
        if (parent_ele === 'a' || parent_ele === 'button') {
          that.start(ev, target.parentNode, parent_ele);
        } else {
          that.start(ev, target, tagName);
        }
      });
    } else {
      addEvent$1(document, 'click', function(e) {
        if (!isPageCollect) return false;
        var ev = e || window.event;
        if (!ev) {
          return false;
        }
        var target = ev.target || ev.srcElement;
        var theTarget = sd.heatmap.getTargetElement(target, e);
        if (theTarget) {
          that.start(ev, theTarget, theTarget.tagName.toLowerCase());
        } else if (isElement(target) && target.tagName.toLowerCase() === 'div' && isObject(sd.para.heatmap) && sd.para.heatmap.get_vtrack_config && sd.unlimitedDiv.events.length > 0) {
          if (sd.unlimitedDiv.isTargetEle(target)) {
            that.start(ev, target, target.tagName.toLowerCase(), {
              $lib_method: 'vtrack'
            });
          }
        }
      });
    }
  }
};

export default heatmap