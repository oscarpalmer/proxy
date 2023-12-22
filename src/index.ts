type GenericObject = Record<number | string, unknown>;

const constructors = new Set(['Array', 'Object']);

const idKey = '__id__';

class ID {}

function createProxy(id: ID | undefined, value: unknown): unknown {
	if (isProxy(value) || !isObject(value)) {
		return value;
	}

	const proxyId = id ?? new ID();
	const proxyValue = transform(proxyId, value);

	const proxy = new Proxy(proxyValue as GenericObject, {
		get(target, property) {
			return property === idKey ? proxyId : Reflect.get(target, property);
		},
		has(target, property) {
			return property === idKey || Reflect.has(target, property);
		},
		set(target, property, value) {
			if (property === idKey) {
				return false;
			}

			const tranformed = transform(proxyId, value as never);

			return Reflect.set(target, property, tranformed);
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

export default function proxy<Model extends GenericObject>(
	value: Model,
): Model {
	if (typeof value !== 'object' || value === undefined || value === null) {
		throw new TypeError('Value must be an object');
	}

	return createProxy(undefined, value) as Model;
}

function transform(id: ID, value: unknown): unknown {
	if (!isObject(value)) {
		return value;
	}

	const result = (Array.isArray(value) ? [] : {}) as GenericObject;

	for (const key in value as Object) {
		if (key in (value as Object)) {
			result[key] = createProxy(id, (value as GenericObject)[key] as never);
		}
	}

	return result;
}
