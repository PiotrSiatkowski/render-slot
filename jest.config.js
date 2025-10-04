// jest.config.js
export default {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	transform: { '^.*.test.tsx$': 'ts-jest' },
	testRegex: '^.*.test.tsx$',
}
