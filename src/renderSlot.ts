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
import { GatewayString } from './useGateway'

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

type AllProps<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
	C extends Record<string, unknown> = Record<string, unknown>,
> = {
	bespoke: Renderable<P, C>
	default?: D
	context?: C
	wrapper?: (part: ReactNode) => ReactNode
	options?: { wrapNonElementWithDefault?: boolean }
}

export function renderSlot<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
	C extends Record<string, unknown> = Record<string, unknown>,
>(
	bespoke: Renderable<P, C>,
	defNode?: D,
	context?: C,
	wrapper?: (part: ReactNode) => ReactNode,
	options?: { wrapNonElementWithDefault?: boolean }
): ReactNode

export function renderSlot<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
	C extends Record<string, unknown> = Record<string, unknown>,
>(args: AllProps<D, P, C>): ReactNode

export function renderSlot<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
	C extends Record<string, unknown> = Record<string, unknown>,
>(bespoke: Renderable<P, C>, args: Omit<AllProps<D, P, C>, 'bespoke'>): ReactNode

export function renderSlot<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
	C extends Record<string, unknown> = Record<string, unknown>,
>(
	bespoke: Renderable<P, C>,
	defNode: ReactNode | ComponentType<P>,
	args: Omit<AllProps<D, P, C>, 'bespoke' | 'default'>
): ReactNode

export function renderSlot<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
	C extends Record<string, unknown> = Record<string, unknown>,
>(
	bespoke: Renderable<P, C>,
	defNode: ReactNode | ComponentType<P>,
	context: C,
	args: Omit<AllProps<D, P, C>, 'bespoke' | 'default' | 'context'>
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
				...('context' in args[2] || 'wrapper' in args[2] || 'options' in args[2]
					? args[2]
					: { context: args[2] }),
			})
		case 4:
			return renderSlotWithObject({
				bespoke: args[0],
				default: args[1],
				context: args[2],
				...(isFunction(args[3]) ? { wrapper: args[3] } : args[3]),
			})
		case 5:
			return renderSlotWithObject({
				bespoke: args[0],
				default: args[1],
				context: args[2],
				wrapper: args[3],
				options: args[4],
			})
	}
}

function isObject(obj: any): obj is object {
	return isPlainObject(obj)
}

const REACT_PORTAL_TYPE = Symbol.for('react.portal')
const isPortal = (x: unknown): x is React.ReactPortal =>
	!!x && (x as any).$$typeof === REACT_PORTAL_TYPE

function renderSlotWithObject<
	D extends DefaultLike<any>,
	P extends Record<string, any> = PropsOfDefault<D>,
>({
	bespoke: bespokePart,
	default: defaultPart,
	context: contextPart,
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
						: () => null,
				contextPart ?? {}
			)
		}

		// Handle additional options.
		if (wrapNonElementWithDefault && !isObject(bespokePart)) {
			const props = { children: bespokePart, ...(contextPart ?? {}) } as unknown as P

			return isFunction(defaultPart)
				? createElement(defaultPart, props)
				: isValidElement(defaultPart)
					? cloneElement(defaultPart, props)
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

	const content = renderContent()

	// Return nothing for gateways.
	if (content === GatewayString) {
		return null
	}

	// Don't wrap portals.
	if (isPortal(content)) {
		return content
	}

	// Wrap everything if needed.
	return wrapperPart ? wrapperPart(content) : content
}
