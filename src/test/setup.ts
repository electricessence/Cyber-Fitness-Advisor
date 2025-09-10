import { expect, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers)

// Suppress React act() warnings in tests - these are testing artifacts, not functional issues
beforeAll(() => {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('Warning: An update to')) {
      return; // Suppress React act() warnings
    }
    if (typeof message === 'string' && message.includes('not wrapped in act')) {
      return; // Suppress React act() warnings
    }
    originalError.apply(console, args);
  };
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})
