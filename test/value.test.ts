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

test('has', () => {
	expect(
		(() => {
			return keys.every(key => key in data);
		})(),
	).toBe(true);
});

test('instances', () => {
	expect(
		(() => {
			return (
				(data as Record<string, unknown>).__id__ instanceof Object &&
				Array.isArray(data.array) &&
				data.class instanceof Klass &&
				data.object instanceof Object
			);
		})(),
	).toBe(true);
});

test('typeof', () => {
	expect(
		(() => {
			return (
				typeof data.boolean === 'boolean' &&
				typeof data.function === 'function' &&
				typeof data.number === 'number' &&
				typeof data.string === 'string' &&
				typeof data.symbol === 'symbol'
			);
		})(),
	).toBe(true);
});

test('set', () => {
	data.object.foo = {
		baz: 'bar',
	};

	expect(() => {
		return (
			typeof data.object.foo.bar === 'undefined' &&
			typeof data.object.foo.baz === 'string'
		);
	});
});

test('modify id', () => {
	try {
		(data as Record<string, unknown>).__id__ = '123';
	} catch (error: unknown) {
		expect(error).toBeInstanceOf(TypeError);
	}
});
