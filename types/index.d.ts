type GenericObject = Record<number | string, unknown>;
type ProxyValue = unknown[] | GenericObject;
/**
 * Create a reactive proxy value from an array or object.
 * @template {(unknown[] | Record<number | string, unknown>)} Model
 * @param {Model} value
 * @returns {Model}
 */
export default function proxy<Model extends ProxyValue>(value: Model): Model;
export {};
