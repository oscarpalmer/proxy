type GenericObject = Record<number | string, unknown>;
type ProxyValue = unknown[] | GenericObject;

const constructors = new Set(['Array', 'Object']);

const idKey = '__id__';

class ID {}

function arrayHandler(
	id: ID,
	array: unknown[],
	property: PropertyKey,
): unknown {
	function synthetic(...args: unknown[]): unknown {
		return (Array.prototype[property as never] as Function).apply(array, args);
	}

	switch (property) {
		case 'copyWithin':
		case 'pop':
		case 'reverse':
		case 'shift':
		case 'sort':
			return synthetic;

		case 'fill':
		case 'push':
		case 'unshift':
			return (...items: unknown[]) =>
				synthetic(...(transform(id, items) as unknown[]));

		case 'splice':
			return (start: number, deleteCount?: number, ...items: unknown[]) =>
				synthetic(start, deleteCount, ...(transform(id, items) as unknown[]));

		default:
			return Reflect.get(array, property);
	}
}

function createProxy(id: ID | undefined, value: unknown): unknown {
	if (isProxy(value) || !isObject(value)) {
		return value;
	}

	const isArray = Array.isArray(value);

	const proxyId = id ?? new ID();
	const proxyValue = transform(proxyId, value as ProxyValue);

	const proxy = new Proxy(proxyValue as ProxyValue, {
		get(target, property) {
			if (property === idKey) {
				return proxyId;
			}

			return isArray && property in Array.prototype
				? arrayHandler(proxyId, target as never, property)
				: Reflect.get(target, property);
		},
		has(target, property) {
			return property === idKey || Reflect.has(target, property);
		},
		set(target, property, value) {
			return property === idKey
				? false
				: Reflect.set(target, property, transform(proxyId, value as never));
		},
	});

	Object.defineProperty(proxy, idKey, {
		value: proxyId,
	});

	return proxy;
}

function isObject(value: unknown): boolean {
	return constructors.has(value?.constructor?.name ?? '');
}

export function isProxy(value: unknown): boolean {
	return (value as GenericObject)?.[idKey] instanceof ID;
}

export default function proxy<Model extends ProxyValue>(value: Model): Model {
	if (typeof value !== 'object' || value === undefined || value === null) {
		throw new TypeError('Value must be an object');
	}

	return createProxy(undefined, value) as Model;
}

function transform(id: ID, value: ProxyValue): unknown {
	if (!isObject(value)) {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(item => createProxy(id, item as never));
	}

	const result = {} as GenericObject;

	for (const key in value as Object) {
		result[key] = createProxy(id, value[key] as never);
	}

	return result;
}
