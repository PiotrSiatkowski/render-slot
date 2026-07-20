import { ReactNode, ComponentType, JSXElementConstructor, ReactElement } from 'react';

type Renderable<P extends object = Record<string, unknown>, C extends object = Record<string, unknown>> = ReactNode | Partial<P> | ((Default: ComponentType<P>, context: C) => ReactNode) | (() => ReactNode) | Renderable<P, C>[];

/**
 * Used alongside renderable type to enable partial and conditional rendering of
 * some JSX in a simpler and more conventional manner.
 *
 * @param bespoke - Specific part to be rendered
 * @param default - The JSX part that will be rendered if "true" is passed
 * @param context - Additional context passed to custom render function
 * @param wrapper - Wrapper that might be used to be used with both bespokePart and defaultPart
 * @param options - Additional hints on how to render the slot
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
type DefaultLike<P extends object> = ComponentType<P> | JSXElementConstructor<P> | ReactElement<P> | null | undefined;
type PropsOfDefault<T> = T extends ComponentType<infer P> ? P : T extends ReactElement<infer P> ? P : T extends JSXElementConstructor<infer P> ? P : Record<string, never>;
type RenderSlotOptions = {
    wrapNonElementWithDefault?: boolean;
    passContextToDefault?: boolean;
};
type AllProps<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>> = {
    bespoke: Renderable<P, C>;
    default?: D;
    context?: C;
    wrapper?: (part: ReactNode, index?: number) => ReactNode;
    options?: RenderSlotOptions;
};
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>, defNode: D): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>, defNode: D, context: C): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>, defNode: D, context: C | undefined, options: RenderSlotOptions): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>, defNode: D, context: C, wrapper: (part: ReactNode, index?: number) => ReactNode): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>, defNode: D, context: C, wrapper: (part: ReactNode, index?: number) => ReactNode, options: RenderSlotOptions): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(args: AllProps<D, P, C>): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>, args: Omit<AllProps<D, P, C>, 'bespoke'>): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>, defNode: ReactNode | ComponentType<P>, args: Omit<AllProps<D, P, C>, 'bespoke' | 'default'>): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>, defNode: ReactNode | ComponentType<P>, context: C, args: Omit<AllProps<D, P, C>, 'bespoke' | 'default' | 'context'>): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends object = PropsOfDefault<D>, C extends object = Record<string, unknown>>(bespoke: Renderable<P, C>, defNode: ReactNode | ComponentType<P>, context: C, wrapper: (part: ReactNode, index?: number) => ReactNode, args: Omit<AllProps<D, P, C>, 'bespoke' | 'default' | 'context' | 'wrapper'>): ReactNode;

type PropsOfComponents<T> = T extends ComponentType<infer P> ? P : never;
type UnwrapRenderableP<T> = NonNullable<T> extends Renderable<infer P, infer _> ? P : never;
type UnwrapRenderableC<T> = NonNullable<T> extends Renderable<infer _, infer C> ? C : never;
type GatewayOptions<P extends object> = {
    initialDefault?: ComponentType<P>;
};
declare function useGateway<Comp, K extends keyof PropsOfComponents<Comp>>({ initialDefault, }?: GatewayOptions<UnwrapRenderableP<PropsOfComponents<Comp>[K]>>): readonly [
    ComponentType<UnwrapRenderableP<PropsOfComponents<Comp>[K]>>,
    Renderable<UnwrapRenderableP<PropsOfComponents<Comp>[K]>, UnwrapRenderableC<PropsOfComponents<Comp>[K]>>
];

export { type GatewayOptions, type Renderable, renderSlot, useGateway };
