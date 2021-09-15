const inputTags = ['input', 'textarea', 'select'];
const attributes = ['id', 'name', 'label-aria', 'placeholder'];
let clickedEl: HTMLElement = null;

// Find the best attribute to be used as the Name for an element in a custom field.
function getClickedElementIdentifier() {
    if (clickedEl == null) {
        return 'Unable to identify clicked element.';
    }

    if (!inputTags.includes(clickedEl.nodeName.toLowerCase())) {
        return 'Invalid element type.';
    }

    for (const attr of attributes) {
        const attributeValue = clickedEl.getAttribute(attr);
        const selector = '[' + attr + '="' + attributeValue + '"]';
        if (!isNullOrEmpty(attributeValue) && document.querySelectorAll(selector)?.length === 1) {
            return attributeValue;
        }
    }
    return 'No unique identifier found.';
}

function isNullOrEmpty(s: string) {
    return s == null || s === '';
}

// We only have access to the element that's been clicked when the context menu is first opened.
// Remember it for use later.
document.addEventListener('contextmenu', event => {
    clickedEl = event.target as HTMLElement;
});

// Runs when the 'Copy Custom Field Name' context menu item is actually clicked.
chrome.runtime.onMessage.addListener(event => {
    if (event.command === 'getClickedElement') {
        const identifier = getClickedElementIdentifier();
        chrome.runtime.sendMessage({
            command: 'getClickedElementResponse',
            sender: 'contextMenuHandler',
            identifier: identifier,
        });
    }
});
