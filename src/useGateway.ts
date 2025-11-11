import {
	ComponentProps,
	ComponentType,
	Dispatch,
	SetStateAction,
	cloneElement,
	isValidElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'

import isFunction from 'lodash.isfunction'
import { Renderable } from './Renderable'

type UnwrapRenderableP<T> = [NonNullable<T>] extends [Renderable<infer P, any>] ? P : never
type UnwrapRenderableC<T> = [NonNullable<T>] extends [Renderable<any, infer C>] ? C : never

export const GatewayString = '__e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

export function useGateway<
	Comp extends ComponentType,
	K extends keyof ComponentProps<Comp>,
>(): readonly [
	ComponentType<UnwrapRenderableP<ComponentProps<Comp>[K]>>,
	Renderable<
		UnwrapRenderableP<ComponentProps<Comp>[K]>,
		UnwrapRenderableC<ComponentProps<Comp>[K]>
	>,
] {
	type P = UnwrapRenderableP<NonNullable<ComponentProps<Comp>[K]>>
	type C = UnwrapRenderableC<NonNullable<ComponentProps<Comp>[K]>>
	type D = NonNullable<ComponentType<P>>

	const setter = useRef<Dispatch<SetStateAction<[D]>>>(null)
	const custom = useRef<D>(null)

	return [
		useCallback((props: P) => {
			const [[Default], setDefault] = useState<[D]>([() => null])

			useEffect(() => {
				if (setter.current) {
					if (custom.current) {
						setDefault([custom.current])
					}
				} else {
					setter.current = setDefault
				}
			}, [])

			return isFunction(Default)
				? Default(props)
				: isValidElement(Default)
					? cloneElement(Default, props)
					: null
		}, []),
		useCallback((defNode: D, context: C) => {
			useEffect(() => {
				if (setter.current) {
					setter.current([defNode])
				} else {
					custom.current = defNode
				}
			})

			return GatewayString
		}, []),
	]
}
