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

This enables you to build components with flexible APIs **without complicated prop juggling**.

---

## 📦 Installation

```bash
npm install render-slot
```

*(or copy the `renderSlot.ts` and `Renderable.ts` files into your utils folder)*

---

## ✨ API Overview

```ts
renderSlot({
  // The custom rendering input (node, function, object props, true/false etc.)
  bespoke?: Renderable<Props, Context>,
  
  // The default slot implementation
  default?: ReactNode | ComponentType<Props>,
  
  // The default slot implementation
  context?: Context,
  
  // Optional wrapper applied to final output
  wrapper?: (part: ReactNode) => JSX.Element,
  
  // Auto-wrap primitive bespoke values into default
  options?: {
    wrapNonElementWithDefault?: boolean
  }
}): ReactNode
```

**Overloaded signatures:**
```ts
renderSlot(bespoke, { default?, context?, wrapper?, options? })
renderSlot(bespoke, default, { context?, wrapper?, options? })
renderSlot(bespoke, default, context, { wrapper?, options? })
renderSlot(bespoke, default, context, wrapper, options?)
```

---

## 🔑 Renderable Types

The `bespoke` slot prop can be **many different things**:

```ts
export type Renderable<P = Record<string, any>, C extends Props = Props> =
  | ReactNode                           					// e.g. <span>Hello</span>, true, null
  | Partial<P>                                   			// props for the default component
  | ((Default: ComponentType<P>, context: C) => ReactNode) 	// render prop wtih default and context data
  | (() => ReactNode)  										// render prop without default
  | Renderable<P, C>[]										// Can render many alterntives sequentially
```

## 🧩 Common Use Cases

### 1. **Boolean flags**
```tsx
<Component renderText />  
// ✅ Renders default part

<Component renderText={false} />  
// ✅ Renders nothing
```

---

### 2. **Nill values**
```tsx
<Component renderText={null} />  
// ✅ Renders nothing

<Component renderText={undefined} />  
// ✅ Renders nothing
```

---

### 3. **Default part fallback**
```tsx
function Component({ renderText }: { renderText: Renderable }) {
  return renderSlot(renderText, (props) => <span {...props}>Default text</span>);
}

function Component({ renderText }: { renderText: Renderable }) {
  return renderSlot(renderText, <span>Default text</span>);
}

<Component renderText />  
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
<MyComp renderText={(Default, context) => <strong>{context.someData ? <Default /> : null}</strong>} />
// → <strong><span>Default text</span></strong>
```

Here `Default` is passed into your function, so you can wrap or extend the default. Variable `context` on the
other hand, represents every additional data that that is passed to custom renderer by the child component.

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
```

---

### 7. **Rendering default implementation outside of the component**
```tsx
function Component({ renderText }: { renderText?: Renderable<{ propA: number }> }) {
	return (
		<div>
			{renderSlot(
				renderText,
				({ propA }) => (
					<>
						<div>Example:</div>
						<div>{propA}</div>
					</>
				),
				null,
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
5. primitive (string/number) with `wrapPrimitiveWithDefault` → **render default({children})**
6. otherwise → **render as-is**
7. In case array is provided start from point 1 for every element of the array

---

## ⚡ Best Practices

- **Use `renderSlot` in component APIs** to make them flexible without dozens of props.
- Provide **sensible defaults** (don’t force users to always override).
- Combine with `wrapper` for lists, layouts, and consistent styles.
- Use `wrapPrimitiveWithDefault` to accept strings/numbers in text slots.
- Use Portal within render function or useGateway hook if you want to render component's slot outside.

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
      {renderSlot(renderHeader, ({ className: string }) => 
      	<h1 className={className}>Default Header</h1>), { isLoading: true }}
      <p>Some content here...</p>
      {renderSlot(renderFooter, ({ className: string }) => 
      	<small className={className}>Default Footer</small>, (part) => <footer>{part}</footer>)}
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
