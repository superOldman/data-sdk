import { logger, sdLog } from '@/utils/debugger'
import { isString } from '@/utils/index'

var flag = 'data:enc;';
var flag_dfm = 'dfm-enc-';

export function decrypt(v) {
  if (v.indexOf(flag) === 0) {
    v = v.substring(flag.length);
    v = rot13defs(v);
  } else if (v.indexOf(flag_dfm) === 0) {
    v = v.substring(flag_dfm.length);
    v = dfmapping(v);
  }
  return v;
}

export function decryptIfNeeded(cross) {
  if (isString(cross) && (cross.indexOf(flag) === 0 || cross.indexOf(flag_dfm) === 0)) {
    cross = decrypt(cross);
  }
  return cross;
}

export function encrypt(v) {
  return flag_dfm + dfmapping(v);
}


export function base64Decode(str) {
  var arr = [];
  try {
    arr = map(atob(str).split(''), function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    });
  } catch (e) {
    arr = [];
  }

  try {
    return decodeURIComponent(arr.join(''));
  } catch (e) {
    return arr.join('');
  }
}
export function base64Encode(str) {
  var result = '';
  try {
    result = btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
      })
    );
  } catch (e) {
    result = str;
  }
  return result;
}
export function hashCode(str) {
  if (typeof str !== 'string') {
    return 0;
  }
  var hash = 0;
  var char = null;
  if (str.length == 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

export function hashCode53(str) {
  var max53 = 9007199254740992;
  var min53 = -9007199254740992;
  var factor = 31;
  var hash = 0;
  if (str.length > 0) {
    var val = str.split('');
    for (var i = 0; i < val.length; i++) {
      var aVal = val[i].charCodeAt();
      var nextHash = factor * hash + aVal;
      if (nextHash > max53) {
        hash = min53 + hash;
        while (((nextHash = factor * hash + aVal), nextHash < min53)) {
          hash = hash / 2 + aVal;
        }
      }
      if (nextHash < min53) {
        hash = max53 + hash;
        while (((nextHash = factor * hash + aVal), nextHash > max53)) {
          hash = hash / 2 + aVal;
        }
      }
      hash = factor * hash + aVal;
    }
  }
  return hash;
}

export function strToUnicode(str) {
  if (typeof str !== 'string') {
    logger.log('转换unicode错误', str);
    return str;
  }
  var nstr = '';
  for (var i = 0; i < str.length; i++) {
    nstr += '\\' + str.charCodeAt(i).toString(16);
  }
  return nstr;
}
