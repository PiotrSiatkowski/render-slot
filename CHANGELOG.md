# Changelog

All notable changes to this project are documented here.

## 1.0.0 - 2026-07-22

### Added

- `useGateway({ initialDefault })` for SSR-compatible gateway output.
- `passContextToDefault` for explicitly forwarding context to wrapped defaults.
- React 18 and React 19 CI coverage.
- SSR, hydration, StrictMode, remount, class component, and array edge-case tests.
- Packed-package verification for ESM, CommonJS, and TypeScript consumers.

### Changed

- `Renderable` now uses safer `object` and `unknown` generic defaults.
- `useGateway` supports multiple targets, remounting, hook-using defaults, and class components.
- Array slots preserve valid React values such as `0`, `""`, and `NaN`.
- Positional configuration detection validates recognized option shapes more carefully.
- Runtime Lodash dependencies were replaced with local helpers.
- The release command is now `npm run release`.

### Fixed

- One-argument primitive calls no longer throw.
- Gateway callbacks no longer violate the Rules of Hooks.
- Wrapped primitive context is no longer leaked into default props unless explicitly enabled.
- Unsupported argument counts consistently return `null`.
- Four-argument options calls now match their TypeScript declarations and documented behavior.

### Migrating from 0.5

- If a wrapped default relies on context being merged into its props, add
  `passContextToDefault: true` alongside `wrapNonElementWithDefault: true`.
- If implicit `Renderable` generics produce `unknown` values, specify the props and context
  types explicitly: `Renderable<Props, Context>`.
- Arrays now render `0`, `""`, and `NaN`; filter them before calling `renderSlot` if they
  should be omitted.
- Use `npm run release` instead of `npm run publish`.
- For gateway SSR output, provide an `initialDefault` that is visually equivalent to the
  source component's default.
