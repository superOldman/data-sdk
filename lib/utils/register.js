import saEvent from '@/Events/saEvent'
import { isString,isArray, extend } from '@/utils/index'
export function registerPage(obj) {
  if (saEvent.check({
    properties: obj
  })) {
    extend(pageInfo.currentProps, obj);
  } else {
    sd.log('register输入的参数有误');
  }
}

export function clearAllRegister(arr) {
  store.clearAllProps(arr);
}

export function clearPageRegister(arr) {
  var i;
  if (isArray(arr) && arr.length > 0) {
    for (i = 0; i < arr.length; i++) {
      if (isString(arr[i]) && arr[i] in pageInfo.currentProps) {
        delete pageInfo.currentProps[arr[i]];
      }
    }
  } else if (arr === true) {
    for (i in pageInfo.currentProps) {
      delete pageInfo.currentProps[i];
    }
  }
}

export function register(props) {
  if (saEvent.check({
    properties: props
  })) {
    store.setProps(props);
  } else {
    sd.log('register输入的参数有误');
  }
}

export function registerOnce(props) {
  if (saEvent.check({
    properties: props
  })) {
    store.setPropsOnce(props);
  } else {
    sd.log('registerOnce输入的参数有误');
  }
}

export function registerSession(props) {
  if (saEvent.check({
    properties: props
  })) {
    store.setSessionProps(props);
  } else {
    sd.log('registerSession输入的参数有误');
  }
}

export function registerSessionOnce(props) {
  if (saEvent.check({
    properties: props
  })) {
    store.setSessionPropsOnce(props);
  } else {
    sd.log('registerSessionOnce输入的参数有误');
  }
}