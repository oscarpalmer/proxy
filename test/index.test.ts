import {expect, test} from 'bun:test';
import proxy from '../src/index';

test('invalid', () => {
	try {
		// @ts-expect-error Testing invalid input
		proxy(123);
	} catch (error) {
		expect(error).toBeInstanceOf(TypeError);
	}
});

const data = proxy({});

test('from proxy', () => {
	expect(proxy(data)).toEqual(data);
});
