export function loginBody(obj) {
  var id = obj.id;
  var callback = obj.callback;
  var name = obj.name;

  var firstId = store.getFirstId();
  var distinctId = store.getOriginDistinctId();

  if (!saEvent.check({
    distinct_id: id
  })) {
    sd.log('login id is invalid');
    return false;
  }
  if (id === sd.store.getOriginDistinctId() && !firstId) {
    sd.log('login id is equal to distinct_id');
    return false;
  }
  if (isObject(sd.store._state.identities) && sd.store._state.identities.hasOwnProperty(name) && id === sd.store._state.first_id) {
    return false;
  }

  var isNewLoginId = sd.store._state.history_login_id.name !== name || id !== sd.store._state.history_login_id.value;
  if (isNewLoginId) {
    sd.store._state.identities[name] = id;
    sd.store.set('history_login_id', {
      name: name,
      value: id
    });

    if (!firstId) {
      store.set('first_id', distinctId);
    }

    sendSignup(id, '$SignUp', {}, callback);

    var tempObj = {
      $identity_cookie_id: sd.store._state.identities.$identity_cookie_id
    };
    tempObj[name] = id;
    resetIdentities(tempObj);
    return true;
  }
  return false;
}

export function login(id, callback) {
  if (typeof id === 'number') {
    id = String(id);
  }
  var returnValue = loginBody({
    id: id,
    callback: callback,
    name: IDENTITY_KEY.LOGIN
  });
  !returnValue && isFunction(callback) && callback();
}

export function loginWithKey(name, id) {
  if (typeof id === 'number') {
    id = String(id);
  }

  if (typeof name === 'number') {
    name = String(name);
  }

  if (!saEvent.check({
    loginIdKey: name
  })) {
    return false;
  }

  if (IDENTITY_KEY.LOGIN === name) {
    login(id);
    return false;
  }

  loginBody({
    id: id,
    callback: null,
    name: name
  });
}

function resetIdentities(resetObj) {
  var identities = {};
  for (var i in resetObj) {
    identities[i] = resetObj[i];
  }
  sd.store._state.identities = identities;
  sd.store.save();
}


export function logout(isChangeId) {
  var firstId = store.getFirstId();
  if (firstId) {
    store.set('first_id', '');
    if (isChangeId === true) {
      var uuid = UUID();
      store.set('distinct_id', uuid);
    } else {
      store.set('distinct_id', firstId);
    }
  }
  resetIdentities({
    $identity_cookie_id: sd.store._state.identities.$identity_cookie_id
  });

  sd.store.set('history_login_id', {
    name: '',
    value: ''
  });
}
