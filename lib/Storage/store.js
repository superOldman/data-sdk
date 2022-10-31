import { saNewUser } from '@/saNewUser'
import { isObject } from '@/utils/index'
import { _localStorage, _sessionStorage } from '@/Storage/storage'

var store = {
  requests: [],
  _sessionState: {},
  _state: {
    distinct_id: '',
    first_id: '',
    props: {},
    identities: {}
  },
  getProps: function () {
    return this._state.props || {};
  },
  getSessionProps: function () {
    return this._sessionState;
  },
  getOriginDistinctId: function () {
    return this._state._distinct_id || this._state.distinct_id;
  },
  getOriginUnionId: function (state) {
    var obj = {};
    state = state || this._state;
    var firstId = state._first_id || state.first_id,
      distinct_id = state._distinct_id || state.distinct_id;
    if (firstId && distinct_id) {
      obj.login_id = distinct_id;
      obj.anonymous_id = firstId;
    } else {
      obj.anonymous_id = distinct_id;
    }
    return obj;
  },
  getDistinctId: function () {
    var unionId = this.getUnionId();
    return unionId.login_id || unionId.anonymous_id;
  },
  getUnionId: function (state) {
    var obj = this.getOriginUnionId(state);
    if (obj.login_id && this._state.history_login_id && this._state.history_login_id.name && this._state.history_login_id.name !== sd.IDENTITY_KEY.LOGIN) {
      obj.login_id = this._state.history_login_id.name + '+' + obj.login_id;
    }
    return obj;
  },
  getFirstId: function () {
    return this._state._first_id || this._state.first_id;
  },
  initSessionState: function () {
    var ds = cookie$1.get('sensorsdata2015session');
    ds = decryptIfNeeded(ds);
    var state = null;
    if (ds !== null && typeof (state = safeJSONParse(ds)) === 'object') {
      this._sessionState = state || {};
    }
  },

  setOnce: function (a, b) {
    if (!(a in this._state)) {
      this.set(a, b);
    }
  },
  set: function (name, value) {
    this._state = this._state || {};
    var pre_id = this._state.distinct_id;
    this._state[name] = value;
    if (name === 'first_id') {
      delete this._state._first_id;
    } else if (name === 'distinct_id') {
      delete this._state._distinct_id;
    }
    this.save();
    if (name === 'distinct_id' && pre_id) {
      sd.events.tempAdd('changeDistinctId', value);
    }
  },
  change: function (name, value) {
    this._state['_' + name] = value;
  },
  setSessionProps: function (newp) {
    var props = this._sessionState;
    extend(props, newp);
    this.sessionSave(props);
  },
  setSessionPropsOnce: function (newp) {
    var props = this._sessionState;
    coverExtend(props, newp);
    this.sessionSave(props);
  },
  setProps: function (newp, isCover) {
    var props = {};
    if (!isCover) {
      props = extend(this._state.props || {}, newp);
    } else {
      props = newp;
    }
    for (var key in props) {
      if (typeof props[key] === 'string') {
        props[key] = props[key].slice(0, sd.para.max_referrer_string_length);
      }
    }
    this.set('props', props);
  },
  setPropsOnce: function (newp) {
    var props = this._state.props || {};
    coverExtend(props, newp);
    this.set('props', props);
  },
  clearAllProps: function (arr) {
    this._sessionState = {};
    var i;
    if (isArray(arr) && arr.length > 0) {
      for (i = 0; i < arr.length; i++) {
        if (isString(arr[i]) && arr[i].indexOf('latest_') === -1 && isObject(this._state.props) && arr[i] in this._state.props) {
          delete this._state.props[arr[i]];
        }
      }
    } else {
      if (isObject(this._state.props)) {
        for (i in this._state.props) {
          if (i.indexOf('latest_') !== 1) {
            delete this._state.props[i];
          }
        }
      }
    }
    this.sessionSave({});
    this.save();
  },
  sessionSave: function (props) {
    this._sessionState = props;
    var sessionStateStr = JSON.stringify(this._sessionState);
    if (sd.para.encrypt_cookie) {
      sessionStateStr = encrypt(sessionStateStr);
    }
    cookie$1.set('sensorsdata2015session', sessionStateStr, 0);
  },
  save: function () {
    var copyState = JSON.parse(JSON.stringify(this._state));
    delete copyState._first_id;
    delete copyState._distinct_id;

    if (copyState.identities) {
      copyState.identities = base64Encode(JSON.stringify(copyState.identities));
    }

    var stateStr = JSON.stringify(copyState);
    if (sd.para.encrypt_cookie) {
      stateStr = encrypt(stateStr);
    }
    cookie$1.set(this.getCookieName(), stateStr, 73000, sd.para.cross_subdomain);
  },
  getCookieName: function () {
    var sub = '';
    if (sd.para.cross_subdomain === false) {
      try {
        sub = _URL(location.href).hostname;
      } catch (e) {
        sd.log(e);
      }
      if (typeof sub === 'string' && sub !== '') {
        sub = 'sa_jssdk_2015_' + sd.para.sdk_id + sub.replace(/\./g, '_');
      } else {
        sub = 'sa_jssdk_2015_root' + sd.para.sdk_id;
      }
    } else {
      sub = 'sensorsdata2015jssdkcross' + sd.para.sdk_id;
    }
    return sub;
  },
  init: function () {
    function compatibleWith3(state) {
      var identitiesprop;
      if (state.identities) {
        if (state.identities.indexOf('\n/') === 0) {
          state.identities = safeJSONParse(rot13defs(state.identities));
        } else {
          state.identities = safeJSONParse(base64Decode(state.identities));
        }
      }

      var unionId = store.getOriginUnionId(state);

      if (state.identities && isObject(state.identities) && !isEmptyObject(state.identities)) {
        if (state.identities.$identity_anonymous_id && state.identities.$identity_anonymous_id !== unionId.anonymous_id) {
          state.identities.$identity_anonymous_id = unionId.anonymous_id;
        }
      } else {
        state.identities = {};
        state.identities.$identity_anonymous_id = unionId.anonymous_id;
        state.identities.$identity_cookie_id = UUID();
      }


      state.history_login_id = state.history_login_id || {};
      var history_login_id = state.history_login_id;
      var old_login_id_name = history_login_id.name;

      if (unionId.login_id) {
        if (old_login_id_name && state.identities.hasOwnProperty(old_login_id_name)) {
          if (state.identities[old_login_id_name] !== unionId.login_id) {
            state.identities[old_login_id_name] = unionId.login_id;
            for (identitiesprop in state.identities) {
              if (state.identities.hasOwnProperty(identitiesprop)) {
                if (identitiesprop !== '$identity_cookie_id' && identitiesprop !== old_login_id_name) {
                  delete state.identities[identitiesprop];
                }
              }
            }
            state.history_login_id.value = unionId.login_id;
          }
        } else {
          var currentLoginKey = old_login_id_name || sd.IDENTITY_KEY.LOGIN;
          state.identities[currentLoginKey] = unionId.login_id;
          for (identitiesprop in state.identities) {
            if (state.identities.hasOwnProperty(identitiesprop)) {
              if (identitiesprop !== '$identity_cookie_id' && identitiesprop !== currentLoginKey) {
                delete state.identities[identitiesprop];
              }
            }
          }
          state.history_login_id = {
            name: currentLoginKey,
            value: unionId.login_id
          };
        }
      } else {

        if (state.identities.hasOwnProperty('$identity_login_id') || state.identities.hasOwnProperty(old_login_id_name)) {
          for (identitiesprop in state.identities) {
            if (state.identities.hasOwnProperty(identitiesprop)) {
              if (identitiesprop !== '$identity_cookie_id' && identitiesprop !== '$identity_anonymous_id') {
                delete state.identities[identitiesprop];
              }
            }
          }
        }
        state.history_login_id = {
          name: '',
          value: ''
        };
      }

      return state;
    }

    function cookieExistExpection(uuid) {
      sd.store.set('distinct_id', uuid);
      sd.store.set('identities', {
        $identity_cookie_id: uuid
      });
      sd.store.set('history_login_id', {
        name: '',
        value: ''
      });
    }
    this.initSessionState();
    var uuid = UUID();
    var cross, cookieJSON;
    if (cookie$1.isSupport()) {
      cross = cookie$1.get(this.getCookieName());
      cross = decryptIfNeeded(cross);
      cookieJSON = safeJSONParse(cross);
    }
    if (!cookie$1.isSupport() || cross === null || !isJSONString(cross) || !isObject(cookieJSON) || (isObject(cookieJSON) && !cookieJSON.distinct_id)) {
      sd.is_first_visitor = true;
      cookieExistExpection(uuid);
    } else {
      sd.store._state = extend(compatibleWith3(cookieJSON));
      sd.store.save();
    }
    saNewUser.setDeviceId(uuid);
    saNewUser.storeInitCheck();
    saNewUser.checkIsFirstLatest();
  },
  saveObjectVal: function (name, value) {
    if (!isString(value)) {
      value = JSON.stringify(value);
    }
    if (sd.para.encrypt_cookie == true) {
      value = encrypt(value);
    }
    _localStorage.set(name, value);
  },
  readObjectVal: function (name) {
    var value = _localStorage.get(name);
    if (!value) return null;
    value = decryptIfNeeded(value);
    return safeJSONParse(value);
  }
};

export default store