/* eslint-disable @typescript-eslint/no-explicit-any */
import isFunction from 'lodash.isfunction'
import isPlainObject from 'lodash.isplainobject'

import {
	ComponentType,
	ReactNode,
	cloneElement,
	createElement,
	isValidElement,
	ReactElement,
	JSXElementConstructor,
} from 'react'

import type { Renderable } from './Renderable'

/**
 * Used alongside renderable type to enable partial and conditional rendering of
 * some JSX in a simpler and more conventional manner.
 *
 * @param bespokePart - Specific part to be rendered
 * @param defaultPart - The JSX part that will be rendered if "true" is passed
 * @param wrapperPart - Wrapper that might be used to be used with both bespokePart and defaultPart
 * @param optionsPart - Additional hints on how to render the slot
 *
 * @example
 * Having component:
 * function Component({ renderText }: { renderText: Renderable }) {
 *     return (
 *     	 <div>
 *     	    {renderSlot(renderText, () => <Text>Default text</Text>, (part) => <Text>{part}</Text>)}
 *       </div>
 *     )
 * } or:
 *
 * renderSlot(renderText, () => <Text>Default text</Text>)
 * renderSlot(renderText, () => <Text>Default text</Text>, (part) => <Text>{part}</Text>)
 *
 * <Component renderText />
 *  => <Text>Default text</Text>
 *
 * <Component renderText={false} />
 *  => null
 *
 * renderSlot(true, () => <Text>Default text</Text>, (part) => <li>{part}</li>)
 *  => <li><Text>Default text</Text></li>
 *
 * renderSlot(<strong>Some text</strong>, () => <Text>Default text</Text>, (part) => <li>{part}</li>)
 *  => <li><strong>Some text</strong></li>
 *
 * renderSlot(() => <strong>Some text</strong>, () => <Text>Default text</Text>, (part) => <li>{part}</li>)
 *  => <li><strong>Some text</strong></li>
 *
 *  renderSlot((DefaultPart) => <strong><DefaultPart /></strong>, () => <Text>Default text</Text>, (part) => <li>{part}</li>)
 *  => <strong><Text>Default text</Text></strong>
 */

// Accept functional component, class component, or element instance
export type DefaultLike<P extends Record<string, unknown>> =
	| ComponentType<P>
	| JSXElementConstructor<P>
	| ReactElement<P>
	| null
	| undefined

type PropsOfDefault<T> =
	T extends ComponentType<infer P>
		? P
		: T extends ReactElement<infer P>
			? P
			: T extends JSXElementConstructor<infer P>
				? P
				: Record<string, never>

type AllProps<D extends DefaultLike<any>, P extends Record<string, any> = PropsOfDefault<D>> = {
	bespoke: Renderable<P>
	default?: D
	wrapper?: (part: ReactNode) => ReactNode
	options?: { wrapNonElementWithDefault?: boolean }
}

export function renderSlot<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
>(
	bespoke: Renderable<P>,
	defNode?: D,
	wrapper?: (part: ReactNode) => ReactNode,
	options?: { wrapNonElementWithDefault?: boolean }
): ReactNode

export function renderSlot<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
>(args: AllProps<D, P>): ReactNode

export function renderSlot<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
>(bespoke: Renderable<P>, args: Omit<AllProps<D, P>, 'bespoke'>): ReactNode

export function renderSlot<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
>(
	bespoke: Renderable<P>,
	defNode: ReactNode | ComponentType<P>,
	args: Omit<AllProps<D, P>, 'bespoke' | 'default'>
): ReactNode

export function renderSlot(...args: any[]): ReactNode {
	switch (args.length) {
		case 1:
			return renderSlotWithObject(args[0])
		case 2:
			return renderSlotWithObject({
				bespoke: args[0],
				...(isPlainObject(args[1]) && !isValidElement(args[1])
					? args[1]
					: { default: args[1] }),
			})
		case 3:
			return renderSlotWithObject({
				bespoke: args[0],
				default: args[1],
				...(isFunction(args[2]) ? { wrapper: args[2] } : args[2]),
			})
		case 4:
			return renderSlotWithObject({
				bespoke: args[0],
				default: args[1],
				wrapper: args[2],
				options: args[3],
			})
	}
}

function isObject(obj: any): obj is object {
	return isPlainObject(obj)
}

function renderSlotWithObject<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
>({
	bespoke: bespokePart,
	default: defaultPart,
	wrapper: wrapperPart,
	options: optionsPart,
}: AllProps<D>): ReactNode {
	const { wrapNonElementWithDefault } = optionsPart ?? {}

	// Don't render part at all in those three cases.
	if (bespokePart === undefined || bespokePart === false || bespokePart === null) {
		return null
	}

	const renderContent = (): ReactNode => {
		// Render default implementation.
		if (bespokePart === true) {
			return isFunction(defaultPart)
				? createElement(defaultPart, {} as P)
				: ((defaultPart ?? null) as ReactNode)
		}

		// If a function is passed, render it with the default part.
		if (isFunction(bespokePart)) {
			return bespokePart(
				isFunction(defaultPart)
					? defaultPart
					: isValidElement(defaultPart)
						? (props) => cloneElement(defaultPart, props as P)
						: () => null
			)
		}

		// Handle additional options.
		if (wrapNonElementWithDefault && !isObject(bespokePart)) {
			return isFunction(defaultPart)
				? createElement(defaultPart, { children: bespokePart } as unknown as P)
				: isValidElement(defaultPart)
					? cloneElement(defaultPart, { children: bespokePart } as unknown as P)
					: null
		}

		// If an object configuration was passed (defaultPart props).
		if (isObject(bespokePart) && !isValidElement(bespokePart)) {
			return isFunction(defaultPart)
				? createElement(defaultPart, bespokePart)
				: isValidElement(defaultPart)
					? cloneElement(defaultPart, bespokePart)
					: null
		}

		// In the case of any different React node, just return the value.
		return bespokePart as ReactNode
	}

	// Wrap everything if needed.
	return wrapperPart ? wrapperPart(renderContent()) : renderContent()
}
