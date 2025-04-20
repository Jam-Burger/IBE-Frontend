import {api} from "../lib/api-client";

// Store original texts to restore English
const originalTexts = new Map<string, string>();
// Track the next available ID
let nextTranslationId = 0;
// Current language
let currentLanguage = 'en';
// Debounce timer for translation
let translationDebounceTimer: number | null = null;
// Elements waiting to be translated
const pendingElements = new Set<Element>();
// Cache for translated texts to avoid duplicate API calls
const translationCache = new Map<string, string>();
// Debounce time in milliseconds
const DEBOUNCE_TIME = 500;
// Store original DOM state
const originalDOMState = new Map<Node, string>();
// Flag to track if we're in the initial English state
let isInitialEnglishState = true;

// Generate a unique ID for each translatable element
function generateTranslationId(): string {
    return `translation-${nextTranslationId++}`;
}

// Generate a cache key for a text and language
function getCacheKey(text: string, lang: string): string {
    return `${text}:${lang}`;
}

export async function translateText(texts: string[], targetLang: string): Promise<string[]> {
    // If all texts are already in cache, return them immediately
    const allCached = texts.every(text => translationCache.has(getCacheKey(text, targetLang)));
    if (allCached) {
        return texts.map(text => translationCache.get(getCacheKey(text, targetLang)) || text);
    }

    // Filter out texts that are already in cache
    const textsToTranslate = texts.filter(text => !translationCache.has(getCacheKey(text, targetLang)));

    // If there are no texts to translate, return all from cache
    if (textsToTranslate.length === 0) {
        return texts.map(text => translationCache.get(getCacheKey(text, targetLang)) || text);
    }

    try {
        // Only make API call for texts not in cache
        const response = await api.translateTexts(textsToTranslate, targetLang);

        // Store translations in cache
        textsToTranslate.forEach((text, index) => {
            translationCache.set(getCacheKey(text, targetLang), response[index]);
        });

        // Return all texts (from cache and newly translated)
        return texts.map(text => {
            const cacheKey = getCacheKey(text, targetLang);
            return translationCache.has(cacheKey) ? translationCache.get(cacheKey)! : text;
        });
    } catch (error) {
        console.error('Translation error:', error);
        return texts;
    }
}

export function storeOriginalText(element: Element, text: string) {
    // Skip translation for elements containing SVGs or with no-translate class
    if (element.querySelector('svg') || element.classList.contains('no-translate')) return;

    // Generate a unique ID for this element if it doesn't have one
    let translationId = element.getAttribute('data-translation-id');
    if (!translationId) {
        translationId = generateTranslationId();
        element.setAttribute('data-translation-id', translationId);
    }

    // Only store the original English text, don't overwrite it with translated text
    if (isInitialEnglishState || !originalTexts.has(translationId)) {
        originalTexts.set(translationId, text);
    }
}

export function getOriginalText(element: Element): string | undefined {
    // Skip translation for elements containing SVGs or with no-translate class
    if (element.querySelector('svg') || element.classList.contains('no-translate')) return;

    const translationId = element.getAttribute('data-translation-id');
    if (!translationId) return undefined;

    return originalTexts.get(translationId);
}

// Debounced function to translate pending elements
function debouncedTranslatePendingElements() {
    if (translationDebounceTimer) {
        window.clearTimeout(translationDebounceTimer);
    }

    translationDebounceTimer = window.setTimeout(async () => {
        if (pendingElements.size === 0) return;

        // Process elements in batches to avoid too many API calls
        const elementsToTranslate = Array.from(pendingElements);
        pendingElements.clear();

        // Collect all text nodes from all elements
        const allTextNodes: { node: Node; text: string }[] = [];

        // Process each element to collect text nodes
        for (const element of elementsToTranslate) {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        // Skip script and style tags
                        const parent = node.parentElement;
                        if (!parent ||
                            parent.tagName === 'SCRIPT' ||
                            parent.tagName === 'STYLE' ||
                            parent.querySelector('svg') ||
                            parent.classList.contains('no-translate') ||
                            parent.closest('.no-translate')) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        // Only accept non-empty text nodes
                        return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                    }
                }
            );

            let node: Node | null = walker.nextNode();
            while (node) {
                const text = node.textContent?.trim() || '';
                if (text) {
                    allTextNodes.push({node, text});
                    // Store original text for restoration
                    if (node.parentElement) {
                        storeOriginalText(node.parentElement, text);
                    }
                }
                node = walker.nextNode();
            }
        }

        // If there are no text nodes to translate, return early
        if (allTextNodes.length === 0) return;

        // Remove duplicates to avoid translating the same text multiple times
        const uniqueTexts = new Map<string, { node: Node; text: string }[]>();
        allTextNodes.forEach(item => {
            if (!uniqueTexts.has(item.text)) {
                uniqueTexts.set(item.text, []);
            }
            uniqueTexts.get(item.text)!.push(item);
        });

        // Get unique texts for translation
        const uniqueTextArray = Array.from(uniqueTexts.keys());

        // Translate in batches
        const translatedTexts = await translateText(uniqueTextArray, currentLanguage);

        // Apply translations to all nodes with the same text
        uniqueTextArray.forEach((text, index) => {
            const translatedText = translatedTexts[index];
            const nodes = uniqueTexts.get(text) || [];
            nodes.forEach(item => {
                if (item.node.textContent) {
                    item.node.textContent = translatedText;
                }
            });
        });
    }, DEBOUNCE_TIME);
}

// Function to store original DOM state
function storeOriginalDOMState() {
    // Clear previous state
    originalDOMState.clear();

    // Get all text nodes
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Skip script and style tags
                const parent = node.parentElement;
                if (!parent ||
                    parent.tagName === 'SCRIPT' ||
                    parent.tagName === 'STYLE' ||
                    parent.querySelector('svg') ||
                    parent.classList.contains('no-translate') ||
                    parent.closest('.no-translate')) {
                    return NodeFilter.FILTER_REJECT;
                }

                // Only accept non-empty text nodes
                const text = node.textContent?.trim();
                return text ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        }
    );

    let node: Node | null;
    while (node = walker.nextNode()) {
        const text = node.textContent?.trim();
        if (text) {
            // Store the exact text content without trimming
            originalDOMState.set(node, node.textContent || '');
        }
    }
}

// Function to restore original texts
function restoreOriginalTexts(): void {
    // First pass: restore all stored original texts
    originalDOMState.forEach((originalText, node) => {
        if (node.textContent !== originalText) {
            node.textContent = originalText;
        }
    });

    // Second pass: handle any dynamically added content
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent ||
                    parent.tagName === 'SCRIPT' ||
                    parent.tagName === 'STYLE' ||
                    parent.querySelector('svg') ||
                    parent.classList.contains('no-translate') ||
                    parent.closest('.no-translate')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let node: Node | null;
    while (node = walker.nextNode()) {
        if (!originalDOMState.has(node)) {
            // For any text nodes not in our original state, try to find their English version in the cache
            const currentText = node.textContent?.trim() || '';
            if (currentText) {
                for (const [key, value] of translationCache.entries()) {
                    if (value === currentText) {
                        const [originalText] = key.split(':');
                        node.textContent = originalText;
                        break;
                    }
                }
            }
        }
    }

    // Clear translation cache to ensure fresh translations on next language change
    translationCache.clear();
}

// Function to translate the entire page
export async function translatePage(targetLang: string): Promise<void> {
    if (currentLanguage === 'en' && targetLang !== 'en') {
        // Store original state when switching from English to another language
        storeOriginalDOMState();
    }

    currentLanguage = targetLang;

    if (targetLang === 'en') {
        restoreOriginalTexts();
        return;
    }

    // Collect all text nodes that need translation
    const textNodes: { node: Node; text: string }[] = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Skip script and style tags
                const parent = node.parentElement;
                if (!parent ||
                    parent.tagName === 'SCRIPT' ||
                    parent.tagName === 'STYLE' ||
                    parent.querySelector('svg') ||
                    parent.classList.contains('no-translate') ||
                    parent.closest('.no-translate')) {
                    return NodeFilter.FILTER_REJECT;
                }

                // Only accept non-empty text nodes
                return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        }
    );

    let node: Node | null = walker.nextNode();
    while (node) {
        const text = node.textContent?.trim() || '';
        if (text) {
            textNodes.push({node, text});
            // Store original text for restoration
            if (node.parentElement) {
                storeOriginalText(node.parentElement, text);
            }
        }
        node = walker.nextNode();
    }

    // Remove duplicates to avoid translating the same text multiple times
    const uniqueTexts = new Map<string, { node: Node; text: string }[]>();
    textNodes.forEach(item => {
        if (!uniqueTexts.has(item.text)) {
            uniqueTexts.set(item.text, []);
        }
        uniqueTexts.get(item.text)!.push(item);
    });

    // Get unique texts for translation
    const uniqueTextArray = Array.from(uniqueTexts.keys());

    // Translate in batches
    const translatedTexts = await translateText(uniqueTextArray, targetLang);

    // Apply translations to all nodes with the same text
    uniqueTextArray.forEach((text, index) => {
        const translatedText = translatedTexts[index];
        const nodes = uniqueTexts.get(text) || [];
        nodes.forEach(item => {
            if (item.node.textContent) {
                item.node.textContent = translatedText;
            }
        });
    });

    // Set up mutation observer to detect new content
    setupMutationObserver();
}

// Set up mutation observer to detect new content
function setupMutationObserver(): void {
    // Disconnect any existing observer
    if (window.translationObserver) {
        window.translationObserver.disconnect();
    }

    // Create a new observer
    window.translationObserver = new MutationObserver((mutations) => {
        let hasNewContent = false;

        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                hasNewContent = true;

                // Process each added node
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;

                        // Skip elements with no-translate class
                        if (element.classList.contains('no-translate')) return;

                        // Add to pending elements
                        pendingElements.add(element);
                    }
                });
            }
        });

        if (hasNewContent) {
            debouncedTranslatePendingElements();
        }
    });

    // Start observing the document body for added nodes
    window.translationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Add type declaration for the global observer
declare global {
    interface Window {
        translationObserver: MutationObserver;
    }
} 