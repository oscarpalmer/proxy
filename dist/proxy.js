// src/index.ts
var createProxy = function(id, value) {
  if (isProxy(value) || !isObject(value)) {
    return value;
  }
  const proxyId = id ?? new ID;
  const proxyValue = transform(proxyId, value);
  const proxy = new Proxy(proxyValue, {
    get(target, property) {
      return property === idKey ? proxyId : Reflect.get(target, property);
    },
    has(target, property) {
      return property === idKey || Reflect.has(target, property);
    },
    set(target, property, value2) {
      if (property === idKey) {
        return false;
      }
      const tranformed = transform(proxyId, value2);
      return Reflect.set(target, property, tranformed);
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
  const result = Array.isArray(value) ? [] : {};
  for (const key in value) {
    if (key in value) {
      result[key] = createProxy(id, value[key]);
    }
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
