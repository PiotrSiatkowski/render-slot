/** @jest-environment node */

import React from 'react'
import { renderToString } from 'react-dom/server'

import { Renderable } from './Renderable'
import { renderSlot } from './renderSlot'
import { useGateway } from './useGateway'

describe('Render Slot SSR', () => {
	test('renders an initial gateway default before its source', () => {
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

		expect(renderToString(<App />)).toBe(
			'<div><span>Initial:<!-- -->8</span><section></section></div>'
		)
	})
})
