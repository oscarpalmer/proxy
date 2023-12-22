import {expect, test} from 'bun:test';
import proxy from '../src/index';

type Data = {
	array: unknown[];
	boolean: boolean;
	class: unknown;
	function: () => void;
	number: number;
	object: DataObject;
	string: string;
	symbol: symbol;
};

type DataFoo = {
	bar?: string;
	baz?: string;
};

type DataObject = {
	foo: DataFoo;
};

class Klass {}

const keys = [
	'__id__',
	'array',
	'boolean',
	'class',
	'function',
	'number',
	'object',
	'string',
	'symbol',
];

const data = proxy<Data>({
	array: [1, 2, 3],
	boolean: true,
	class: new Klass(),
	function: () => {},
	number: 1,
	object: {foo: {bar: 'baz'}},
	string: 'string',
	symbol: Symbol('symbol'),
});

test('create', () => {
	try {
		// @ts-expect-error Testing invalid input
		proxy(123);
	} catch (error) {
		expect(error).toBeInstanceOf(TypeError);
	}

	expect(proxy(data)).toEqual(data);
});

test('values', () => {
	for (const key of keys) {
		expect(key in data).toBe(true);
	}

	expect((data as Record<string, unknown>).__id__).toBeInstanceOf(Object);

	expect(data.array).toBeInstanceOf(Array);
	expect(data.class).toBeInstanceOf(Klass);
	expect(data.object).toBeInstanceOf(Object);

	expect(typeof data.boolean === 'boolean').toBe(true);
	expect(typeof data.function === 'function').toBe(true);
	expect(typeof data.number === 'number').toBe(true);
	expect(typeof data.string === 'string').toBe(true);
	expect(typeof data.symbol === 'symbol').toBe(true);

	data.object.foo = {
		baz: 'bar',
	};

	expect(typeof data.object.foo.bar === 'undefined').toBe(true);
	expect(typeof data.object.foo.baz === 'string').toBe(true);

	try {
		(data as Record<string, unknown>).__id__ = '123';
	} catch (error: unknown) {
		expect(error).toBeInstanceOf(TypeError);
	}
});
