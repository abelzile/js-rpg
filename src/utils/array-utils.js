import _ from 'lodash';


export function clear(arr) {
  while (arr.length > 0) {
    arr.pop();
  }
}

export function remove(arr, obj) {

  const i = arr.indexOf(obj);

  if (i !== -1) {
    arr.splice(i, 1);
    return true;
  }

  return false;

}

export function create(length, defaultValue) {

  if (typeof defaultValue === 'function') {
    return _.range(length).map(defaultValue);
  } else {
    return _.range(length).map(() => defaultValue);
  }

}

export function create2d(dim1Length, dim2Length, defaultValue) {

  return _.range(dim1Length).map(() => create(dim2Length, defaultValue));

}