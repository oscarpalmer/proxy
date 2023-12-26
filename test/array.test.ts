import {expect, test} from 'bun:test';
import proxy from '../src/index';

test('create', () => {
	const array = proxy([1, 2, 3]);

	expect(
		(() => {
			return Array.isArray(array) && array.length === 3;
		})(),
	).toBe(true);
});

test('copyWithin', () => {
	const array = proxy([1, 2, 3]);

	array.copyWithin(0, 1);

	expect(
		(() => {
			return (
				array.length === 3 && array[0] === 2 && array[1] === 3 && array[2] === 3
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
				shifted === 1 && array.length === 2 && array[0] === 2 && array[1] === 3
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
				array.length === 8 && array.every((value, index) => value === index + 1)
			);
		})(),
	).toBe(true);
});

test('sort', () => {
	const array = proxy([1, 2, 3, 9, 4, 8, 5, 7, 6]);

	array.sort((first, second) => first - second);

	expect(
		(() => {
			return (
				array.length === 9 && array.every((value, index) => value === index + 1)
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
