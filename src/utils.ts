const objectConstructorString = Function.prototype.toString.call(Object)

type Callable = (...args: any[]) => any

export function isFunction<T>(value: T): value is T & Callable {
	return typeof value === 'function'
}

export function isPlainObject<T>(value: T): value is T & Record<string, unknown> {
	if (Object.prototype.toString.call(value) !== '[object Object]') {
		return false
	}

	const prototype = Object.getPrototypeOf(value as object)
	if (prototype === null) {
		return true
	}

	const constructor = Object.prototype.hasOwnProperty.call(prototype, 'constructor')
		? prototype.constructor
		: null

	return (
		typeof constructor === 'function' &&
		Function.prototype.toString.call(constructor) === objectConstructorString
	)
}
