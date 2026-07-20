import { ComponentType, ReactNode } from 'react'

// Your callable form + zero-arg convenience
export type Renderable<
	P extends object = Record<string, unknown>,
	C extends object = Record<string, unknown>,
> =
	| ReactNode
	| Partial<P>
	| ((Default: ComponentType<P>, context: C) => ReactNode)
	| (() => ReactNode)
	| Renderable<P, C>[]
