import { ReactNode, ComponentType, JSXElementConstructor, ReactElement } from 'react';

type Props = Record<string, any>;
type Renderable<P extends Props = Props> = ReactNode | Partial<P> | ((Default: ComponentType<P>) => ReactNode) | (() => ReactNode);

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
type DefaultLike<P extends Record<string, unknown>> = ComponentType<P> | JSXElementConstructor<P> | ReactElement<P> | null | undefined;
type PropsOfDefault<T> = T extends ComponentType<infer P> ? P : T extends ReactElement<infer P> ? P : T extends JSXElementConstructor<infer P> ? P : Record<string, never>;
type AllProps<D extends DefaultLike<any>, P extends Record<string, any> = PropsOfDefault<D>> = {
    bespoke: Renderable<P>;
    default?: D;
    wrapper?: (part: ReactNode) => ReactNode;
    options?: {
        wrapNonElementWithDefault?: boolean;
    };
};
declare function renderSlot<D extends DefaultLike<any>, P extends Record<string, any> = PropsOfDefault<D>>(bespoke: Renderable<P>, defNode?: D, wrapper?: (part: ReactNode) => ReactNode, options?: {
    wrapNonElementWithDefault?: boolean;
}): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends Record<string, any> = PropsOfDefault<D>>(args: AllProps<D, P>): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends Record<string, any> = PropsOfDefault<D>>(bespoke: Renderable<P>, args: Omit<AllProps<D, P>, 'bespoke'>): ReactNode;
declare function renderSlot<D extends DefaultLike<any>, P extends Record<string, any> = PropsOfDefault<D>>(bespoke: Renderable<P>, defNode: ReactNode | ComponentType<P>, args: Omit<AllProps<D, P>, 'bespoke' | 'default'>): ReactNode;

export { type Renderable, renderSlot };
