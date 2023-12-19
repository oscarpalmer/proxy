// src/index.ts
function proxy(value) {
  return new Proxy(value, {});
}
export {
  proxy as default
};
