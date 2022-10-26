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
