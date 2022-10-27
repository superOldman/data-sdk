

var DomElementInfo = function(dom) {
  this.ele = dom;
};



DomElementInfo.prototype = {
  addClass: function(para) {
    var classes = ' ' + this.ele.className + ' ';
    if (classes.indexOf(' ' + para + ' ') === -1) {
      this.ele.className = this.ele.className + (this.ele.className === '' ? '' : ' ') + para;
    }
    return this;
  },
  removeClass: function(para) {
    var classes = ' ' + this.ele.className + ' ';
    if (classes.indexOf(' ' + para + ' ') !== -1) {
      this.ele.className = classes.replace(' ' + para + ' ', ' ').slice(1, -1);
    }
    return this;
  },
  hasClass: function(para) {
    var classes = ' ' + this.ele.className + ' ';
    if (classes.indexOf(' ' + para + ' ') !== -1) {
      return true;
    } else {
      return false;
    }
  },
  attr: function(key, value) {
    if (typeof key === 'string' && isUndefined(value)) {
      return this.ele.getAttribute(key);
    }
    if (typeof key === 'string') {
      value = String(value);
      this.ele.setAttribute(key, value);
    }
    return this;
  },
  offset: function() {
    var rect = this.ele.getBoundingClientRect();
    if (rect.width || rect.height) {
      var doc = this.ele.ownerDocument;
      var docElem = doc.documentElement;

      return {
        top: rect.top + window.pageYOffset - docElem.clientTop,
        left: rect.left + window.pageXOffset - docElem.clientLeft
      };
    } else {
      return {
        top: 0,
        left: 0
      };
    }
  },
  getSize: function() {
    if (!window.getComputedStyle) {
      return {
        width: this.ele.offsetWidth,
        height: this.ele.offsetHeight
      };
    }
    try {
      var bounds = this.ele.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height
      };
    } catch (e) {
      return {
        width: 0,
        height: 0
      };
    }
  },
  getStyle: function(value) {
    if (this.ele.currentStyle) {
      return this.ele.currentStyle[value];
    } else {
      return this.ele.ownerDocument.defaultView.getComputedStyle(this.ele, null).getPropertyValue(value);
    }
  },
  wrap: function(elementTagName) {
    var ele = document.createElement(elementTagName);
    this.ele.parentNode.insertBefore(ele, this.ele);
    ele.appendChild(this.ele);
    return ry(ele);
  },
  getCssStyle: function(prop) {
    var result = this.ele.style.getPropertyValue(prop);
    if (result) {
      return result;
    }
    var rules = null;
    if (typeof window.getMatchedCSSRules === 'function') {
      rules = window.getMatchedCSSRules(this.ele);
    }
    if (!rules || !isArray(rules)) {
      return null;
    }
    for (var i = rules.length - 1; i >= 0; i--) {
      var r = rules[i];
      result = r.style.getPropertyValue(prop);
      if (result) {
        return result;
      }
    }
  },
  sibling: function(cur, dir) {
    while ((cur = cur[dir]) && cur.nodeType !== 1) {}
    return cur;
  },
  next: function() {
    return this.sibling(this.ele, 'nextSibling');
  },
  prev: function() {
    return this.sibling(this.ele, 'previousSibling');
  },
  siblings: function() {
    return siblings((this.ele.parentNode || {}).firstChild, this.ele);
  },
  children: function() {
    return siblings(this.ele.firstChild);
  },
  parent: function() {
    var parent = this.ele.parentNode;
    parent = parent && parent.nodeType !== 11 ? parent : null;
    return ry(parent);
  },
  previousElementSibling: function() {
    var el = this.ele;
    if ('previousElementSibling' in document.documentElement) {
      return ry(el.previousElementSibling);
    } else {
      while ((el = el.previousSibling)) {
        if (el.nodeType === 1) {
          return ry(el);
        }
      }
      return ry(null);
    }
  },
  getSameTypeSiblings: function() {
    var element = this.ele;
    var parentNode = element.parentNode;
    var tagName = element.tagName.toLowerCase();
    var arr = [];
    for (var i = 0; i < parentNode.children.length; i++) {
      var child = parentNode.children[i];
      if (child.nodeType === 1 && child.tagName.toLowerCase() === tagName) {
        arr.push(parentNode.children[i]);
      }
    }
    return arr;
  },
  getParents: function() {
    try {
      var element = this.ele;
      if (!isElement(element)) {
        return [];
      }
      var pathArr = [element];
      if (element === null || element.parentElement === null) {
        return [];
      }
      while (element.parentElement !== null) {
        element = element.parentElement;
        pathArr.push(element);
      }
      return pathArr;
    } catch (err) {
      return [];
    }
  }
};

export default function ry(dom) {
  return new DomElementInfo(dom);
}