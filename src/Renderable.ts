import { ComponentType, ReactNode } from 'react'

type Props = Record<string, any>

// Your callable form + zero-arg convenience
export type Renderable<P extends Props = Props, C extends Props = Props> =
	| ReactNode
	| Partial<P>
	| ((Default: ComponentType<P>, context: C) => ReactNode)
	| (() => ReactNode)
	| Renderable<P, C>[]
