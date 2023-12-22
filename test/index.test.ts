import {describe, expect, test} from 'bun:test';
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

describe('create', () => {
	test('invalid', () => {
		try {
			// @ts-expect-error Testing invalid input
			proxy(123);
		} catch (error) {
			expect(error).toBeInstanceOf(TypeError);
		}
	});

	test('from proxy', () => {
		expect(proxy(data)).toEqual(data);
	});
});

describe('values', () => {
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
					data.array instanceof Array &&
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
});

describe('array', () => {
	test('create', () => {
		const array = proxy([1, 2, 3]);

		expect(
			(() => {
				return array instanceof Array && array.length === 3;
			})(),
		).toBe(true);
	});

	test('copyWithin', () => {
		const array = proxy([1, 2, 3]);

		array.copyWithin(0, 1);

		expect(
			(() => {
				return (
					array instanceof Array &&
					array.length === 3 &&
					array[0] === 2 &&
					array[1] === 3 &&
					array[2] === 3
				);
			})(),
		).toBe(true);
	});

	test('pop', () => {
		const array = proxy([1, 2, 3]);
		const popped = array.pop();

		expect(
			(() => {
				return (
					popped === 3 && array.length === 2 && array[0] === 1 && array[1] === 2
				);
			})(),
		).toBe(true);
	});

	test('reverse', () => {
		const array = proxy([1, 2, 3]);

		array.reverse();

		expect(
			(() => {
				return array[0] === 3 && array[1] === 2 && array[2] === 1;
			})(),
		).toBe(true);
	});

	test('shift', () => {
		const array = proxy([1, 2, 3]);
		const shifted = array.shift();

		expect(
			(() => {
				return (
					shifted === 1 &&
					array.length === 2 &&
					array[0] === 2 &&
					array[1] === 3
				);
			})(),
		).toBe(true);
	});

	test('push', () => {
		const array = proxy([1, 2, 3]);

		array.push(4, 5, 6, 7, 8);

		expect(
			(() => {
				return (
					array.length === 8 &&
					array.every((value, index) => value === index + 1)
				);
			})(),
		).toBe(true);
	});

	test('sort', () => {
		const array = proxy([1, 2, 3, 9, 4, 8, 5, 7, 6]);

		array.sort((f, s) => f - s);

		expect(
			(() => {
				return (
					array.length === 9 &&
					array.every((value, index) => value === index + 1)
				);
			})(),
		).toBe(true);
	});

	test('unshift', () => {
		const array = proxy([1, 2, 3]);
		const unshifted = array.unshift(-1, 0);

		expect(
			(() => {
				return (
					unshifted === 5 &&
					array.length === unshifted &&
					array[0] === -1 &&
					array[1] === 0 &&
					array[2] === 1 &&
					array[3] === 2 &&
					array[4] === 3
				);
			})(),
		).toBe(true);
	});

	test('fill', () => {
		const array = proxy([1, 2, 3]);

		const mod = array.fill(999, 1, 2);

		expect(
			(() => {
				return array.every(
					(value, index) => value === (index === 1 ? 999 : index + 1),
				);
			})(),
		).toBe(true);
	});

	test('splice', () => {
		const array = proxy([1, 2, 3]);

		array.splice(1, 1, 33, 44, 55);

		expect(
			(() => {
				return (
					array.length === 5 &&
					array[0] === 1 &&
					array[1] === 33 &&
					array[2] === 44 &&
					array[3] === 55 &&
					array[4] === 3
				);
			})(),
		).toBe(true);
	});
});
