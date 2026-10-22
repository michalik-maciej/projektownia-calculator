import "@testing-library/jest-dom/vitest"

// JSDOM has no ResizeObserver, and Radix measures radio groups with it.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
