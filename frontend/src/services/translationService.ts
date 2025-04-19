import { api } from "../lib/api-client";

// Store original texts to restore English
const originalTexts = new Map<string, string>();
// Track the next available ID
let nextTranslationId = 0;

// Generate a unique ID for each translatable element
function generateTranslationId(): string {
    return `translation-${nextTranslationId++}`;
}

export async function translateText(texts: string[], targetLang: string): Promise<string[]> {
    return api.translateTexts(texts, targetLang);
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

    originalTexts.set(translationId, text);
}

export function getOriginalText(element: Element): string | undefined {
    // Skip translation for elements containing SVGs or with no-translate class
    if (element.querySelector('svg') || element.classList.contains('no-translate')) return;

    const translationId = element.getAttribute('data-translation-id');
    if (!translationId) return undefined;

    return originalTexts.get(translationId);
}

// Function to translate the entire page
export async function translatePage(targetLang: string): Promise<void> {
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

    let node: Node | null;
    while (node = walker.nextNode()) {
        const text = node.textContent?.trim() || '';
        if (text) {
            textNodes.push({node, text});
            // Store original text for restoration
            if (node.parentElement) {
                storeOriginalText(node.parentElement, text);
            }
        }
    }

    // Batch translate texts
    const textsToTranslate = textNodes.map(item => item.text);
    const translatedTexts = await translateText(textsToTranslate, targetLang);

    // Apply translations
    textNodes.forEach((item, index) => {
        if (item.node.textContent) {
            item.node.textContent = translatedTexts[index];
        }
    });
}

// Function to restore original texts
function restoreOriginalTexts(): void {
    // Find all elements with translation IDs
    const elements = document.querySelectorAll('[data-translation-id]');

    elements.forEach(element => {
        const translationId = element.getAttribute('data-translation-id');
        if (translationId) {
            const originalText = originalTexts.get(translationId);
            if (originalText) {
                element.textContent = originalText;
            }
        }
    });
} 