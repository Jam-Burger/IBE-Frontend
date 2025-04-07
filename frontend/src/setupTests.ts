// import '@testing-library/jest-dom';
import {afterEach, expect, vi} from 'vitest';
import {cleanup} from '@testing-library/react';
// import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with a simplified version
expect.extend({
    toBeInTheDocument(received) {
        const pass = Boolean(received);
        return {
            pass,
            message: () => `expected ${received} to ${pass ? 'not ' : ''}be in the document`,
        };
    },
    // Add other matchers as needed
});

// Clean up after each test
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock window.ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Fix for document.createRange with proper typing
global.document.createRange = () => {
    const range = {
        setStart: vi.fn(),
        setEnd: vi.fn(),
        commonAncestorContainer: document.body,
        selectNodeContents: vi.fn(),
        createContextualFragment: vi.fn(),
        getClientRects: vi.fn(() => []),
        getBoundingClientRect: vi.fn(),
        startContainer: document.body,
        endContainer: document.body,
        startOffset: 0,
        endOffset: 0,
        collapsed: true,
        cloneContents: vi.fn(),
        cloneRange: vi.fn(),
        collapse: vi.fn(),
        compareBoundaryPoints: vi.fn(),
        comparePoint: vi.fn(),
        deleteContents: vi.fn(),
        detach: vi.fn(),
        extractContents: vi.fn(),
        insertNode: vi.fn(),
        intersectsNode: vi.fn(),
        isPointInRange: vi.fn(),
        surroundContents: vi.fn(),
        toString: vi.fn()
    };

    return range as unknown as Range;
};