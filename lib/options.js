export function check(p, onComplete) {
  for (var i in p) {
    if (Object.prototype.hasOwnProperty.call(p, i) && !checkOption.check(i, p[i], onComplete)) {
      return false;
    }
  }
  return true;
}

export var checkLog = {
  string: function(str) {
    sdLog(str + ' must be string');
  },
  emptyString: function(str) {
    sdLog(str + '\'s is empty');
  },
  regexTest: function(str) {
    sdLog(str + ' is invalid');
  },
  idLength: function(str) {
    sdLog(str + ' length is longer than ' + sdPara.max_id_length);
  },
  keyLength: function(str) {
    sdLog(str + ' length is longer than ' + sdPara.max_key_length);
  },
  stringLength: function(str) {
    sdLog(str + ' length is longer than ' + sdPara.max_string_length);
  },
  voidZero: function(str) {
    sdLog(str + '\'s is undefined');
  },
  reservedLoginId: function(str) {
    sdLog(str + ' is invalid');
  },
  reservedBind: function(str) {
    sdLog(str + ' is invalid');
  },
  reservedUnbind: function(str) {
    sdLog(str + ' is invalid');
  }
};


export var ruleOption = {
  regName: /^((?!^distinct_id$|^original_id$|^time$|^properties$|^id$|^first_id$|^second_id$|^users$|^events$|^event$|^user_id$|^date$|^datetime$|^user_tag.*|^user_group.*)[a-zA-Z_$][a-zA-Z\d_$]*)$/i,
  loginIDReservedNames: ['$identity_anonymous_id', '$identity_cookie_id'],
  bindReservedNames: ['$identity_login_id', '$identity_anonymous_id', '$identity_cookie_id'],
  unbindReservedNames: ['$identity_anonymous_id', IDENTITY_KEY.LOGIN],
  string: function(str) {
    if (!isString(str)) {
      return false;
    }
    return true;
  },
  emptyString: function(str) {
    if (!isString(str) || trim(str).length === 0) {
      return false;
    }
    return true;
  },
  regexTest: function(str) {
    if (!isString(str) || !this.regName.test(str)) {
      return false;
    }
    return true;
  },
  idLength: function(str) {
    if (!isString(str) || str.length > sdPara.max_id_length) {
      return false;
    }
    return true;
  },
  keyLength: function(str) {
    if (!isString(str) || str.length > sdPara.max_key_length) {
      return false;
    }
    return true;
  },
  stringLength: function(str) {
    if (!isString(str) || str.length > sdPara.max_string_length) {
      return false;
    }
    return true;
  },
  voidZero: function(str) {
    if (str === void 0) {
      return false;
    }
    return true;
  },
  reservedLoginId: function(str) {
    if (indexOf(this.loginIDReservedNames, str) > -1) {
      return false;
    }
    return true;
  },
  reservedUnbind: function(str) {
    if (indexOf(this.unbindReservedNames, str) > -1) {
      return false;
    }
    return true;
  },
  reservedBind: function(str) {
    var historyId = store._state.history_login_id;
    if (historyId && historyId.name && historyId.name === str) {
      return false;
    }
    if (indexOf(this.bindReservedNames, str) > -1) {
      return false;
    }
    return true;
  }
};

export var checkOption = {
  distinct_id: {
    rules: ['string', 'emptyString', 'idLength'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Id';
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
        if (rule_type === 'idLength') {
          return true;
        }
      }

      return status;
    }
  },
  event: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'eventName';
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
      }
      return true;
    }
  },
  propertyKey: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Property key';
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
      }
      return true;
    }
  },
  propertyValue: {
    rules: ['voidZero'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        val = 'Property Value';
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
      }
      return true;
    }
  },
  properties: function(p) {
    if (isObject(p)) {
      each(p, function(s, k) {
        check({
          propertyKey: k
        });

        var onComplete = function(status, val, rule_type) {
          if (!status) {
            val = k + '\'s Value';
            isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
          }
          return true;
        };
        check({
          propertyValue: s
        }, onComplete);
      });
    } else if (ruleOption.voidZero(p)) {
      sdLog('properties可以没有，但有的话必须是对象');
    }
    return true;
  },
  propertiesMust: function(p) {
    if (!(p === undefined || !isObject(p) || isEmptyObject(p))) {
      this.properties.call(this, p);
    } else {
      sdLog('properties必须是对象');
    }
    return true;
  },
  item_type: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'item_type';
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
      }
      return true;
    }
  },
  item_id: {
    rules: ['string', 'emptyString', 'stringLength'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'item_id';
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
      }
      return true;
    }
  },
  loginIdKey: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest', 'reservedLoginId'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'login_id_key';
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
        if (rule_type === 'keyLength') {
          return true;
        }
      }
      return status;
    }
  },
  bindKey: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest', 'reservedBind'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Key';
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
        if (rule_type === 'keyLength') {
          return true;
        }
      }
      return status;
    }
  },
  unbindKey: {
    rules: ['string', 'emptyString', 'keyLength', 'regexTest', 'reservedUnbind'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Key';
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
        if (rule_type === 'keyLength') {
          return true;
        }
      }
      return status;
    }
  },
  bindValue: {
    rules: ['string', 'emptyString', 'idLength'],
    onComplete: function(status, val, rule_type) {
      if (!status) {
        if (rule_type === 'emptyString') {
          val = 'Value';
        }
        isFunction(checkLog[rule_type]) && checkLog[rule_type](val);
        if (rule_type === 'idLength') {
          return true;
        }
      }
      return status;
    }
  },

  check: function(a, b, onComplete) {
    var checkRules = this[a];
    if (isFunction(checkRules)) {
      return checkRules.call(this, b);
    } else if (!checkRules) {
      return false;
    }
    for (var i = 0; i < checkRules.rules.length; i++) {
      var rule = checkRules.rules[i];
      var status = ruleOption[rule](b);
      var result = isFunction(onComplete) ? onComplete(status, b, rule) : checkRules.onComplete(status, b, rule);
      if (!status) {
        return result;
      }
    }
    return true;
  }
};