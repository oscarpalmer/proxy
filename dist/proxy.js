// src/index.ts
var arrayHandler = function(id, array, property) {
  function synthetic(...args) {
    return Array.prototype[property].apply(array, args);
  }
  switch (property) {
    case "copyWithin":
    case "pop":
    case "reverse":
    case "shift":
    case "sort":
      return synthetic;
    case "fill":
    case "push":
    case "unshift":
      return (...items) => synthetic(...transform(id, items));
    case "splice":
      return (start, deleteCount, ...items) => synthetic(start, deleteCount, ...transform(id, items));
    default:
      return Reflect.get(array, property);
  }
};
var createProxy = function(id, value) {
  if (isProxy(value) || !isObject(value)) {
    return value;
  }
  const isArray = Array.isArray(value);
  const proxyId = id ?? new ID;
  const proxyValue = transform(proxyId, value);
  const proxy = new Proxy(proxyValue, {
    get(target, property) {
      if (property === idKey) {
        return proxyId;
      }
      return isArray && property in Array.prototype ? arrayHandler(proxyId, target, property) : Reflect.get(target, property);
    },
    has(target, property) {
      return property === idKey || Reflect.has(target, property);
    },
    set(target, property, value2) {
      return property === idKey ? false : Reflect.set(target, property, transform(proxyId, value2));
    }
  });
  Object.defineProperty(proxy, idKey, {
    value: proxyId
  });
  return proxy;
};
var isObject = function(value) {
  return constructors.has(value?.constructor?.name ?? "");
};
function isProxy(value) {
  return value?.[idKey] instanceof ID;
}
var transform = function(id, value) {
  if (!isObject(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => createProxy(id, item));
  }
  const result = {};
  for (const key in value) {
    result[key] = createProxy(id, value[key]);
  }
  return result;
};
var constructors = new Set(["Array", "Object"]);
var idKey = "__id__";

class ID {
}
/**
 * @template {Record<number | string, unknown>} T
 * @param {T} value 
 * @returns {T}
 */
function proxy(value) {
  if (typeof value !== "object" || value === undefined || value === null) {
    throw new TypeError("Value must be an object");
  }
  return createProxy(undefined, value);
}
export {
  isProxy,
  proxy as default
};
