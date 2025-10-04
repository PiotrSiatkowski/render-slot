import { ComponentType, JSXElementConstructor, ReactElement, ReactNode } from 'react'

type Props = Record<string, any>

// Your callable form + zero-arg convenience
export type Renderable<P extends Props = Props> =
	| ReactNode
	| Partial<P>
	| ((Default: ComponentType<P>) => ReactNode)
	| (() => ReactNode)
