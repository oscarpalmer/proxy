
export default function proxy<Model extends Record<string, unknown>>(
	value: Model,
): Model {
	return new Proxy(value, {});
}
