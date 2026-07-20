![Render Slot Image](./image-small.png)

# 🧠 Render Slot

[![npm version](https://img.shields.io/npm/v/render-slot?color=blue)](https://www.npmjs.com/package/render-slot)
[![bundle size](https://img.shields.io/bundlephobia/minzip/render-slot)](https://bundlephobia.com/package/render-slot)
[![license](https://img.shields.io/npm/l/render-slot)](./LICENSE)
[![Types](https://img.shields.io/badge/TypeScript-ready-blue?logo=typescript)](https://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/PiotrSiatkowski/render-slot?style=social)](https://github.com/PiotrSiatkowski/render-slot)

# Flexible Slot Rendering Utility for React

`Renderable` and `renderSlot` is a small utility for React that makes it easier to define **slots** in your components, handle **default parts**, support **render props**, and wrap content consistently.

It merges multiple patterns:
- Render props
- Slots
- Template method
- Default content fallback
- Conditional rendering
- Portals

This enables you to build components with flexible APIs **without complicated prop juggling**.

---

## 📦 Installation

```bash
npm install render-slot
```

*(or copy the `renderSlot.ts`, `Renderable.ts` and `useGateway.ts` files into your utils folder)*

---

## ✨ API Overview

```ts
renderSlot({
  // The custom rendering input (ReactNode, Function, Object Props, True/False, Array, Portal etc.)
  bespoke?: Renderable<Props, Context>,
  
  // The default slot implementation
  default?: ReactNode | ComponentType<Props>,
  
  // Additional context passed to custom render function
  context?: Context,
  
  // Optional wrapper applied to final output (or every element of an array)
  wrapper?: (part: ReactNode, index?: number) => JSX.Element,
  
  // Auto-wrap primitive bespoke values into default
  options?: {
    wrapNonElementWithDefault?: boolean,
    // Also merge context into the wrapped default's props
    passContextToDefault?: boolean
  }
}): ReactNode
```

**Overloaded signatures:**
```ts
renderSlot({ bespoke?, default?, context?, wrapper?, options? })
renderSlot(bespoke, { default?, context?, wrapper?, options? })
renderSlot(bespoke, default, { context?, wrapper?, options? })
renderSlot(bespoke, default, context, { wrapper?, options? })
renderSlot(bespoke, default, context, wrapper, options?)
```

The positional forms are intended for concise everyday use. In the three-argument form, a
plain object shaped like `{ context?, wrapper?, options? }` is interpreted as configuration.
If context data itself uses one of those reserved keys with a configuration-compatible value,
use the explicit object form:

```tsx
renderSlot({
  bespoke: renderText,
  default: DefaultText,
  context: { wrapper: formatValue },
})
```

This keeps common calls short while providing an unambiguous form for the rare key collision.

---

## 🔑 Renderable Type

The `bespoke` slot property (what is passed to component that uses renderSlot) can be **many different things**:

```ts
export type Renderable<
  P extends object = Record<string, unknown>,
  C extends object = Record<string, unknown>,
> =
  | ReactNode     
  // custom implementation or condition e.g. <span>Hello</span>, true, null                      					
  | Partial<P>                      
  // props for default implementation e.g { propA: 10, propB: 'string' }            			
  | ((Default: ComponentType<P>, context: C) => ReactNode) 
  // render prop with default and context data e.g. (Default, context) => <Default propA={context.loading} />
  | (() => ReactNode)  									
  // render prop without default e.g. () => <div>Text</div>
  | Renderable<P, C>[]										
  // Many alternatives sequentially e.g. [{ propA: 10, propB: 'string' }, <div>Text</div>]
```

## 🧩 Common Use Cases

```tsx
function Component({ renderText }: { renderText: Renderable }) {
  return renderSlot(renderText, (props) => <span {...props}>Default text</span>);
}

function Component({ renderText }: { renderText: Renderable }) {
  return renderSlot(renderText, <span>Default text</span>);
}
```

### 1. **Boolean flags**
```tsx
<Component renderText />  
// ✅ Renders default part

<Component renderText={false} />  
// ✅ Renders nothing
```

---

### 2. **Nil values**
```tsx
<Component renderText={null} />  
// ✅ Renders nothing

<Component renderText={undefined} />  
// ✅ Renders nothing

<Component renderText={[]} />  
// ✅ Renders nothing
```

---

### 3. **Default part fallback**
```tsx
<Component renderText />  
// → <span>Default text</span>

<Component renderText={{}} />  
// → <span>Default text</span>

<Component renderText={{ color: 'red' }} />  
// → <span color="red">Default text</span>

Here, instead of JSX, you pass an **object of props**, and it’s merged into the default.
```

---

### 4. **Custom React Nodes**
```tsx
<Component renderText={<strong>Custom text</strong>} />
// → <strong>Custom text</strong>
```

---

### 5. **Render prop**
```tsx
<Component renderText={(Default, context) => <strong>{context.someData ? <Default /> : null}</strong>} />
// → <strong><span>Default text</span></strong>
```

Here `Default` is passed into your function, so you can wrap or extend the default. Variable `context` on the
other hand, represents every additional data that is passed to custom renderer by the child component.

---

### 6. **Wrapper**
```tsx
renderSlot(
  true,
  () => <span>Default text</span>,
  { isLoading: true },
  (part) => <li>{part}</li>
)

// → <li><span>Default text</span></li>
```

Wrappers are great for list items, tooltips, or other consistent containers.

---

### 7. **Primitives with auto-wrap**
```tsx
renderSlot("Hello World", (props) => <span {...props} />, undefined, { wrapNonElementWithDefault: true })

// → <span>Hello World</span>

renderSlot(
  "Hello World",
  (props) => <span {...props} />,
  { className: "highlight" },
  { wrapNonElementWithDefault: true, passContextToDefault: true }
)

// → <span className="highlight">Hello World</span>
```

---

### 8. **Rendering default implementation outside of the component**
```tsx
function Component({ renderText }: { renderText?: Renderable<{ propA: number }> }) {
	return renderSlot(
		renderText,
		({ propA }) => <div>Example:{propA}</div>,
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
						document.querySelector('#slot')
					)
				}}
			/>
		</div>
	)
}
// → <div className="Client component"><div id="slot"><div>Example:8</div></div></div>

function Client() {
	const [Text, renderText] = useGateway<typeof Component, 'renderText'>()
	return (
		<div className="Client component">
			<Text propA={8} />
			<Component renderText={renderText} />
		</div>
	)
}
// → <div className="Client component"><div>Example:8</div></div>
```

For SSR, provide an initial default so `<Text />` can render before the source component is
reached during the server render:

```tsx
const [Text, renderText] = useGateway<typeof Component, 'renderText'>({
	initialDefault: ({ propA }) => <div>Example:{propA}</div>,
})
```

After hydration, the gateway synchronizes with the source component's current default.
Keep `initialDefault` visually equivalent to that source default; otherwise the gateway may
visibly change when hydration completes.

#### Gateway lifecycle

- When a source component unmounts, mounted `<Text />` targets retain the most recently
  captured default.
- A newly mounted source using the same gateway replaces that retained default.
- If multiple sources share one gateway, the most recently committed source wins. Prefer one
  source per gateway when deterministic ownership matters.
- Unmounting the component that owns `useGateway` releases the gateway and all of its state.

### 9. **Array of various options**
```tsx
renderSlot(["Hello World", { propA: 2 }, <span>CustomText</span>])

// → Hello World<div>Example:2</div><span>CustomText</span>
```

---

## 🖼️ Visual Examples

### Default vs Custom Rendering

| Code                                                  | Output |
|-------------------------------------------------------|--------|
| `<MyComp renderText />`                               | ![default](https://dummyimage.com/200x50/ddd/000.png&text=Default) |
| `<MyComp renderText={<strong>Bold!</strong>} />`      | ![custom](https://dummyimage.com/200x50/ddd/000.png&text=Bold!) |
| `<MyComp renderText={(Default) => <em><Default /></em>} />` | ![wrapped](https://dummyimage.com/200x50/ddd/000.png&text=*Default*) |

---

## 🚦 Decision Flow

The logic for `renderSlot` works like this:

1. `false | null | undefined` → **renders nothing**
2. `true` → **renders default**
3. `function` → **renders function(default, context)**
4. `props object` → **render default(props)**
5. primitive (string/number) with `wrapNonElementWithDefault` → **render default({children})**
6. otherwise → **render as-is**
7. In case array is provided start from point 1 for every element of the array

---

## ⚡ Best Practices

- **Use `renderSlot` in component APIs** to make them flexible without dozens of props.
- Provide **sensible defaults** (don’t force users to always override).
- Combine with `wrapper` for lists, layouts, and consistent styles.
- Use `wrapNonElementWithDefault` to accept strings/numbers in text slots.
- Use Portal within render function or useGateway hook if you want to render component's slot outside of it.

---

## 📚 Example Component

```tsx
type CardProps = {
  renderHeader?: Renderable<{ className: string }, { isLoading: boolean }>;
  renderFooter?: Renderable<{ className: string }>;
};

function Card({ renderHeader, renderFooter }: CardProps) {
  return (
    <div className="card">
      {renderSlot(renderHeader, ({ className }: { className: string }) =>
      	<h1 className={className}>Default Header</h1>, { isLoading: true })}
      <p>Some content here...</p>
      {renderSlot(renderFooter, ({ className }: { className: string }) =>
      	<small className={className}>Default Footer</small>, {
          wrapper: (part) => <footer>{part}</footer>,
        })}
    </div>
  );
}

// Usage
<Card renderHeader />                         		// Uses default header
<Card renderHeader={<h1>Custom</h1>} />       		// Custom JSX
<Card renderHeader={(H, { isLoading }) => <H />} /> // Render prop
<Card renderFooter={false} />                 		// No footer
<Card renderHeader renderFooter={visible} />  		// Header and conditional footer
```

## 📄 License
MIT
