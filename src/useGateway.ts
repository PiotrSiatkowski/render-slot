import {
	ComponentType,
	Dispatch,
	SetStateAction,
	createElement,
	isValidElement,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

import { Renderable } from './Renderable'

type PropsOfComponents<T> = T extends ComponentType<infer P> ? P : never
type UnwrapRenderableP<T> = NonNullable<T> extends Renderable<infer P, infer _> ? P : never
type UnwrapRenderableC<T> = NonNullable<T> extends Renderable<infer _, infer C> ? C : never

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

type GatewayCaptureProps<D> = {
	defNode: D
	onDefault: (defNode: D) => void
}

export type GatewayOptions<P extends object> = {
	initialDefault?: ComponentType<P>
}

function GatewayCapture<D>({ defNode, onDefault }: GatewayCaptureProps<D>) {
	useIsomorphicLayoutEffect(() => {
		onDefault(defNode)
	}, [defNode, onDefault])

	return null
}

export function isGatewayElement(node: unknown): boolean {
	return isValidElement(node) && node.type === GatewayCapture
}

export function useGateway<
	Comp,
	K extends keyof PropsOfComponents<Comp>,
>({
	initialDefault,
}: GatewayOptions<UnwrapRenderableP<PropsOfComponents<Comp>[K]>> = {}): readonly [
	ComponentType<UnwrapRenderableP<PropsOfComponents<Comp>[K]>>,
	Renderable<
		UnwrapRenderableP<PropsOfComponents<Comp>[K]>,
		UnwrapRenderableC<PropsOfComponents<Comp>[K]>
	>,
] {
	type P = UnwrapRenderableP<NonNullable<PropsOfComponents<Comp>[K]>>
	type D = NonNullable<ComponentType<P>>

	const setters = useRef(new Set<Dispatch<SetStateAction<[D]>>>())
	const current = useRef<D>(initialDefault ?? null)

	const onDefault = useCallback((defNode: D) => {
		current.current = defNode
		setters.current.forEach((setter) => {
			setter((current) => (current[0] === defNode ? current : [defNode]))
		})
	}, [])

	return [
		useCallback((props: P) => {
			const [[Default], setDefault] = useState<[D]>(() => [
				current.current ?? ((() => null) as D),
			])

			useIsomorphicLayoutEffect(() => {
				setters.current.add(setDefault)

				if (current.current) {
					setDefault([current.current])
				}

				return () => {
					setters.current.delete(setDefault)
				}
			}, [])

			return createElement(Default, props)
		}, []),
		useCallback(
			(defNode: D) => createElement(GatewayCapture<D>, { defNode, onDefault }),
			[onDefault]
		),
	]
}
