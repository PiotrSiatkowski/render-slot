import React, { ReactNode } from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'

import { renderSlot } from './renderSlot'
import { Renderable } from './Renderable'
import { useGateway } from './useGateway'

function normalizeHTML(html: Element) {
	return html.innerHTML.replace(/\s+/g, ' ').trim()
}

describe('Render Slot', () => {
	test('Can be called with various overrides', () => {
		const defNode = ({ children = 'Default' }) => <span>{children}</span>
		const context = { propA: 10 }
		const wrapper = (part: ReactNode) => <div>{part}</div>
		const options = { wrapNonElementWithDefault: true }

		const components = [
			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot(renderText, defNode)}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot(renderText, { default: defNode })}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot(renderText, defNode, context)}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot(renderText, defNode, { context })}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot(renderText, defNode, context, wrapper)}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot(renderText, defNode, { wrapper })}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot(renderText, defNode, context, wrapper, options)}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot({ bespoke: renderText })}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot({ bespoke: renderText, default: defNode })}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return <div>{renderSlot({ bespoke: renderText, default: defNode, context })}</div>
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return (
					<div>
						{renderSlot({ bespoke: renderText, default: defNode, context, wrapper })}
					</div>
				)
			},

			function Component({ renderText }: { renderText?: Renderable }) {
				return (
					<div>
						{renderSlot({
							bespoke: renderText,
							default: defNode,
							context,
							wrapper,
							options,
						})}
					</div>
				)
			},
		]

		const snapshots = [
			`"<div><span>Default</span></div>"`,
			`"<div><span>Default</span></div>"`,
			`"<div><span>Default</span></div>"`,
			`"<div><span>Default</span></div>"`,
			`"<div><div><span>Default</span></div></div>"`,
			`"<div><div><span>Default</span></div></div>"`,
			`"<div><div><span>Default</span></div></div>"`,
			`"<div></div>"`,
			`"<div><span>Default</span></div>"`,
			`"<div><span>Default</span></div>"`,
			`"<div><div><span>Default</span></div></div>"`,
			`"<div><div><span>Default</span></div></div>"`,
		]

		components.forEach((Component, index) => {
			const { container } = render(<Component renderText />)
			expect(normalizeHTML(container)).toMatchInlineSnapshot(snapshots[index])
		})
	})

	test('Renders empty values', () => {
		function Component({ renderText }: { renderText?: Renderable }) {
			return <div>{renderSlot(renderText, <div>Default</div>)}</div>
		}

		const { container: container1 } = render(<Component />)
		expect(normalizeHTML(container1)).toMatchInlineSnapshot(`"<div></div>"`)

		const { container: container2 } = render(<Component renderText={null} />)
		expect(normalizeHTML(container2)).toMatchInlineSnapshot(`"<div></div>"`)

		const { container: container3 } = render(<Component renderText={undefined} />)
		expect(normalizeHTML(container3)).toMatchInlineSnapshot(`"<div></div>"`)

		const { container: container4 } = render(<Component renderText={false} />)
		expect(normalizeHTML(container4)).toMatchInlineSnapshot(`"<div></div>"`)
	})

	test('Renders one-argument primitive values', () => {
		function Component() {
			return (
				<div>
					{renderSlot(true)}
					{renderSlot('Text')}
					{renderSlot(1)}
				</div>
			)
		}

		const { container } = render(<Component />)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(`"<div>Text1</div>"`)
	})

	test('Returns null for unsupported argument counts', () => {
		const callRenderSlot = renderSlot as (...args: unknown[]) => ReactNode

		expect(callRenderSlot()).toBeNull()
		expect(callRenderSlot(true, null, {}, undefined, {}, 'extra')).toBeNull()
	})

	test('Renders default values', () => {
		function Component1({ renderText }: { renderText?: Renderable }) {
			return <div>{renderSlot(renderText, <div>Default</div>)}</div>
		}

		function Component2({ renderText }: { renderText?: Renderable }) {
			return (
				<div>
					{renderSlot(renderText, () => (
						<div>Default</div>
					))}
				</div>
			)
		}

		const { container: container1 } = render(<Component1 renderText />)
		expect(normalizeHTML(container1)).toMatchInlineSnapshot(`"<div><div>Default</div></div>"`)

		const { container: container2 } = render(<Component2 renderText />)
		expect(normalizeHTML(container2)).toMatchInlineSnapshot(`"<div><div>Default</div></div>"`)
	})

	test('Renders with possibility to use default part with overrides', () => {
		class Class extends React.Component<{ number: number }> {
			render() {
				return <div>{this.props.number}</div>
			}
		}

		function Component1({ renderText }: { renderText?: Renderable<{ number: number }> }) {
			return <div>{renderSlot(renderText, Class)}</div>
		}

		function Component2({ renderText }: { renderText?: Renderable<{ number: number }> }) {
			return <div>{renderSlot(renderText, <Class number={4} />)}</div>
		}

		function Component3({ renderText }: { renderText?: Renderable<{ number: number }> }) {
			return (
				<div>
					{renderSlot(renderText, (props: { number: number }) => (
						<div>{props.number}</div>
					))}
				</div>
			)
		}

		function Component4({ renderText }: { renderText?: Renderable }) {
			return <div>{renderSlot(renderText, null)}</div>
		}

		const { container: container1 } = render(
			<Component1
				renderText={(Default) => (
					<header>
						<Default number={2} />
					</header>
				)}
			/>
		)
		expect(normalizeHTML(container1)).toMatchInlineSnapshot(
			`"<div><header><div>2</div></header></div>"`
		)

		const { container: container2 } = render(
			<Component2
				renderText={(Default) => (
					<header>
						<Default number={2} />
					</header>
				)}
			/>
		)
		expect(normalizeHTML(container2)).toMatchInlineSnapshot(
			`"<div><header><div>2</div></header></div>"`
		)

		const { container: container3 } = render(
			<Component3
				renderText={(Default) => (
					<header>
						<Default number={2} />
					</header>
				)}
			/>
		)
		expect(normalizeHTML(container3)).toMatchInlineSnapshot(
			`"<div><header><div>2</div></header></div>"`
		)

		const { container: container4 } = render(
			<Component4
				renderText={(Default) => (
					<header>
						<Default number={2} />
					</header>
				)}
			/>
		)
		expect(normalizeHTML(container4)).toMatchInlineSnapshot(`"<div><header></header></div>"`)
	})

	test('Renders with wrapNonElementWithDefault options', () => {
		function Component({ renderText }: { renderText?: Renderable }) {
			return (
				<div>
					{renderSlot(
						renderText,
						({ children }) => (
							<div>{children}</div>
						),
						{ options: { wrapNonElementWithDefault: true } }
					)}
				</div>
			)
		}

		/*		const { container: container1 } = render(<Component renderText />)
		expect(normalizeHTML(container1)).toMatchInlineSnapshot(`"<div><div></div></div>"`)*/

		const { container: container2 } = render(<Component renderText="Custom text" />)
		expect(normalizeHTML(container2)).toMatchInlineSnapshot(
			`"<div><div>Custom text</div></div>"`
		)

		const { container: container3 } = render(<Component renderText={<span>New text</span>} />)
		expect(normalizeHTML(container3)).toMatchInlineSnapshot(
			`"<div><span>New text</span></div>"`
		)

		const { container: container4 } = render(
			<Component renderText={() => <span>New text</span>} />
		)
		expect(normalizeHTML(container4)).toMatchInlineSnapshot(
			`"<div><span>New text</span></div>"`
		)
	})

	test('Supports positional options without leaking context into default props', () => {
		const Default = (props: { children?: ReactNode; 'data-context'?: string }) => (
			<span {...props} />
		)

		const { container } = render(
			<div>
				{renderSlot(
					'Custom text',
					Default,
					{ 'data-context': 'private' },
					{ wrapNonElementWithDefault: true }
				)}
			</div>
		)

		expect(normalizeHTML(container)).toMatchInlineSnapshot(`"<div><span>Custom text</span></div>"`)
	})

	test('Can explicitly pass context into wrapped default props', () => {
		const Default = (props: { children?: ReactNode; 'data-context'?: string }) => (
			<span {...props} />
		)

		const { container } = render(
			<div>
				{renderSlot(
					'Custom text',
					Default,
					{ 'data-context': 'public' },
					{
						wrapNonElementWithDefault: true,
						passContextToDefault: true,
					}
				)}
			</div>
		)

		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<div><span data-context="public">Custom text</span></div>"`
		)
	})

	test('Renders default with passed properties', () => {
		function Component({
			renderText,
		}: {
			renderText?: Renderable<{ number?: number; text?: string }>
		}) {
			return (
				<div>
					{renderSlot(renderText, (props: { number?: number; text?: string }) => (
						<div role={props.text}>{props.number}</div>
					))}
				</div>
			)
		}

		const { container: container1 } = render(<Component renderText={{ number: 7 }} />)
		expect(normalizeHTML(container1)).toMatchInlineSnapshot(`"<div><div>7</div></div>"`)

		const { container: container2 } = render(
			<Component renderText={{ number: 6, text: 'text' }} />
		)
		expect(normalizeHTML(container2)).toMatchInlineSnapshot(
			`"<div><div role="text">6</div></div>"`
		)
	})

	test('Renders component as node with override properties', () => {
		function Text(props: { a?: string; b?: string; c?: string }) {
			return (
				<header>
					{props.a}-{props.b}-{props.c ?? 'fallback'}
				</header>
			)
		}

		function Component({ renderText }: { renderText?: Renderable }) {
			return <div>{renderSlot(renderText, <Text a="default" />)}</div>
		}

		const { container: container1 } = render(<Component renderText={{ b: 'custom' }} />)
		expect(normalizeHTML(container1)).toMatchInlineSnapshot(
			`"<div><header>default-custom-fallback</header></div>"`
		)

		const { container: container2 } = render(
			<Component renderText={{ a: 6, b: 'my', c: 'yours' }} />
		)
		expect(normalizeHTML(container2)).toMatchInlineSnapshot(
			`"<div><header>6-my-yours</header></div>"`
		)
	})

	test('Renders with wrapper', () => {
		function Component({ renderText }: { renderText?: Renderable }) {
			return (
				<div>
					{renderSlot(renderText, <div>Example</div>, {
						wrapper: (part: ReactNode) => <footer>{part}</footer>,
					})}
				</div>
			)
		}

		const { container: container1 } = render(<Component />)
		expect(normalizeHTML(container1)).toMatchInlineSnapshot(`"<div></div>"`)

		const { container: container2 } = render(<Component renderText />)
		expect(normalizeHTML(container2)).toMatchInlineSnapshot(
			`"<div><footer><div>Example</div></footer></div>"`
		)
	})

	test('Renders with passed context as second parameter to render prop', () => {
		function Component({
			renderText,
		}: {
			renderText?: Renderable<{ propA: number }, { propB: number }>
		}) {
			return (
				<div>
					{renderSlot(
						renderText,
						() => (
							<div>Example</div>
						),
						{ propB: 20 },
						(part: ReactNode) => (
							<footer>{part}</footer>
						)
					)}
				</div>
			)
		}

		const { container } = render(
			<Component
				renderText={(Default, { propB }) => (
					<div>
						{propB}
						<Default propA={2} />
					</div>
				)}
			/>
		)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<div><footer><div>20<div>Example</div></div></footer></div>"`
		)
	})

	test('Treats reserved keys with incompatible config values as context', () => {
		function Component({
			renderText,
		}: {
			renderText?: Renderable<Record<string, never>, { wrapper: string; options: string }>
		}) {
			return renderSlot(renderText, () => null, {
				wrapper: 'tooltip',
				options: 'metadata',
			})
		}

		const { container } = render(
			<Component
				renderText={(_Default, context) => (
					<span>
						{context.wrapper}:{context.options}
					</span>
				)}
			/>
		)

		expect(normalizeHTML(container)).toMatchInlineSnapshot(`"<span>tooltip:metadata</span>"`)
	})

	test('Can create slot gateway', () => {
		function Component({
			renderText,
		}: {
			renderText?: Renderable<{ propA: number }, { propB: number }>
		}) {
			return (
				<div className="Original component div">
					{renderSlot(
						renderText,
						({ propA }) => (
							<>
								<div>Example:</div>
								<div>{propA}</div>
							</>
						),
						{ propB: 20 },
						(part: ReactNode) => (
							<footer>{part}</footer>
						)
					)}
				</div>
			)
		}

		function Client() {
			const [Text, renderText] = useGateway<typeof Component, 'renderText'>()
			return (
				<div className="Client component">
					<Text propA={8} />
					<Component renderText={renderText} />
				</div>
			)
		}

		const { container } = render(<Client />)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<div class="Client component"><div>Example:</div><div>8</div><div class="Original component div"></div></div>"`
		)
	})

	test('Updates multiple gateway instances and reconnects after remounting', () => {
		function Component({ renderText }: { renderText?: Renderable<{ value: number }> }) {
			return renderSlot(renderText, ({ value }) => <span>{value}</span>)
		}

		function Client({ count }: { count: number }) {
			const [Text, renderText] = useGateway<typeof Component, 'renderText'>()
			return (
				<div>
					{Array.from({ length: count }, (_, index) => (
						<Text key={index} value={index + 1} />
					))}
					<Component renderText={renderText} />
				</div>
			)
		}

		const { container, rerender } = render(<Client count={2} />)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(`"<div><span>1</span><span>2</span></div>"`)

		rerender(<Client count={0} />)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(`"<div></div>"`)

		rerender(<Client count={1} />)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(`"<div><span>1</span></div>"`)
	})

	test('Can conditionally render a gateway without changing hook order', () => {
		function Component({
			renderText,
			show,
		}: {
			renderText?: Renderable<{ value: number }>
			show: boolean
		}) {
			React.useState(0)
			return (
				<div>
					{show ? renderSlot(renderText, ({ value }) => <span>{value}</span>) : null}
				</div>
			)
		}

		function Client({ show }: { show: boolean }) {
			const [Text, renderText] = useGateway<typeof Component, 'renderText'>()
			return (
				<>
					<Text value={8} />
					<Component renderText={renderText} show={show} />
				</>
			)
		}

		const { container, rerender } = render(<Client show={false} />)
		rerender(<Client show />)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(`"<span>8</span><div></div>"`)
		expect(() => rerender(<Client show={false} />)).not.toThrow()
	})

	test('Can use react portal to render slot', () => {
		function Component({
			renderText,
		}: {
			renderText?: Renderable<{ propA: number }, { propB: number }>
		}) {
			return (
				<div className="Original component div">
					{renderSlot(
						renderText,
						({ propA }) => (
							<>
								<div>Example:</div>
								<div>{propA}</div>
							</>
						),
						{ propB: 20 },
						(part: ReactNode) => (
							<footer>{part}</footer>
						)
					)}
				</div>
			)
		}

		function Client() {
			return (
				<div className="Client component">
					<div id="slot" />
					<Component
						renderText={(Text) => {
							return createPortal(
								<Text propA={8} />,
								document.querySelector('#slot') ?? document.createDocumentFragment()
							)
						}}
					/>
				</div>
			)
		}

		const { container, rerender } = render(<Client />)
		rerender(<Client />)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<div class="Client component"><div id="slot"><div>Example:</div><div>8</div></div><div class="Original component div"></div></div>"`
		)
	})

	test('Can render array', () => {
		function Component({
			renderText,
		}: {
			renderText?: Renderable<{ propA: number }, { propB: number }>
		}) {
			return (
				<div className="Original component div">
					{renderSlot(
						renderText,
						({ propA }) => (
							<>
								<div>Example:</div>
								<div>{propA}</div>
							</>
						),
						{ propB: 20 },
						(part: ReactNode) => (
							<footer>{part}</footer>
						)
					)}
				</div>
			)
		}

		function Client() {
			return (
				<div className="Client component">
					<div id="slot" />
					<Component
						renderText={[
							true,
							(Text) => {
								return createPortal(
									<Text propA={8} />,
									document.querySelector('#slot') ??
										document.createDocumentFragment()
								)
							},
							{ propA: 30 },
							false,
							undefined,
							<span>Custom</span>,
						]}
					/>
				</div>
			)
		}

		const { container, rerender } = render(<Client />)
		rerender(<Client />)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<div class="Client component"><div id="slot"><div>Example:</div><div>8</div></div><div class="Original component div"><footer><div>Example:</div><div></div></footer><footer><div>Example:</div><div>30</div></footer><footer><span>Custom</span></footer></div></div>"`
		)
	})

	test('Preserves renderable falsy values in arrays', () => {
		const { container } = render(
			<div>
				{renderSlot(
					[0, '', Number.NaN, false, null, undefined],
					undefined,
					{},
					(part) => <span>{String(part)}</span>
				)}
			</div>
		)

		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<div><span>0</span><span></span><span>NaN</span></div>"`
		)
	})

	test('Renders class component defaults', () => {
		class Default extends React.Component<{ label?: string }> {
			render() {
				return <span>{this.props.label ?? 'Default'}</span>
			}
		}

		function Component({ renderText }: { renderText?: Renderable<{ label?: string }> }) {
			return <div>{renderSlot(renderText, Default)}</div>
		}

		const { container } = render(
			<>
				<Component renderText />
				<Component renderText={{ label: 'Custom' }} />
			</>
		)

		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<div><span>Default</span></div><div><span>Custom</span></div>"`
		)
	})

	test('Updates a gateway whose hook-using default changes in source state', () => {
		function Component({ renderText }: { renderText?: Renderable<{ prefix: string }> }) {
			const [label, setLabel] = React.useState('First')

			function Default({ prefix }: { prefix: string }) {
				const [suffix] = React.useState('!')
				return <span>{`${prefix}:${label}${suffix}`}</span>
			}

			return (
				<>
					<button onClick={() => setLabel('Second')}>Change</button>
					{renderSlot(renderText, Default)}
				</>
			)
		}

		function Client() {
			const [Text, renderText] = useGateway<typeof Component, 'renderText'>()
			return (
				<>
					<Text prefix="Value" />
					<Component renderText={renderText} />
				</>
			)
		}

		const { container, getByRole } = render(
			<React.StrictMode>
				<Client />
			</React.StrictMode>
		)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<span>Value:First!</span><button>Change</button>"`
		)

		fireEvent.click(getByRole('button', { name: 'Change' }))
		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<span>Value:Second!</span><button>Change</button>"`
		)
	})

	test('Provides an empty context object when context is omitted', () => {
		const renderOverride = jest.fn((_Default, context) => (
			<span>{Object.keys(context).length}</span>
		))

		const { container } = render(
			<div>{renderSlot(renderOverride, () => <span>Default</span>)}</div>
		)

		expect(renderOverride).toHaveBeenCalledWith(expect.any(Function), {})
		expect(normalizeHTML(container)).toMatchInlineSnapshot(`"<div><span>0</span></div>"`)
	})

	test('Uses compact wrapper indexes after filtering empty array entries', () => {
		const { container } = render(
			<div>
				{renderSlot(
					[false, 'First', null, undefined, 'Second'],
					undefined,
					{},
					(part, index) => (
						<span>
							{index}:{part}
						</span>
					)
				)}
			</div>
		)

		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<div><span>0:First</span><span>1:Second</span></div>"`
		)
	})

	test('Hydrates an initial gateway default without a markup mismatch', async () => {
		function InitialDefault({ value }: { value: number }) {
			return <span>Initial:{value}</span>
		}

		function Source({ renderText }: { renderText?: Renderable<{ value: number }> }) {
			return (
				<section>
					{renderSlot(renderText, ({ value }) => (
						<span>Source:{value}</span>
					))}
				</section>
			)
		}

		function App() {
			const [Text, renderText] = useGateway<typeof Source, 'renderText'>({
				initialDefault: InitialDefault,
			})

			return (
				<div>
					<Text value={8} />
					<Source renderText={renderText} />
				</div>
			)
		}

		const container = document.createElement('div')
		container.innerHTML = '<div><span>Initial:<!-- -->8</span><section></section></div>'
		const consoleError = jest.spyOn(console, 'error').mockImplementation()
		let root: ReturnType<typeof hydrateRoot> | undefined

		try {
			await act(async () => {
				root = hydrateRoot(container, <App />)
			})

			expect(consoleError).not.toHaveBeenCalled()
			expect(normalizeHTML(container)).toMatchInlineSnapshot(
				`"<div><span>Source:8</span><section></section></div>"`
			)
		} finally {
			await act(async () => {
				root?.unmount()
			})
			consoleError.mockRestore()
		}
	})
})
