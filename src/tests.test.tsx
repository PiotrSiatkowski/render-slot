import React, { ReactNode } from 'react'
import { render } from '@testing-library/react'
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

		const { container, rerender } = render(<Client />)
		rerender(<Client />)
		expect(normalizeHTML(container)).toMatchInlineSnapshot(
			`"<div class="Client component"><div>Example:</div><div>8</div><div class="Original component div"></div></div>"`
		)
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
})
