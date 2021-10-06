const inputTags = ['input', 'textarea', 'select'];
const labelTags = ['label', 'span'];
const attributes = ['id', 'name', 'label-aria', 'placeholder'];
const invalidElement = chrome.i18n.getMessage('copyCustomFieldNameInvalidElement');
const noUniqueIdentifier = chrome.i18n.getMessage('copyCustomFieldNameNotUnique');

let clickedEl: HTMLElement = null;

// Find the best attribute to be used as the Name for an element in a custom field.
function getClickedElementIdentifier() {
    if (clickedEl == null) {
        return invalidElement;
    }

    const tagName = clickedEl.nodeName.toLowerCase();
    let inputEl = null;

    // Try to identify the input element (which may not be the clicked element)
    if (inputTags.includes(tagName)) {
        inputEl = clickedEl;
    } else if (labelTags.includes(tagName)) {
        let inputName = null;
        if (tagName === 'label') {
            inputName = clickedEl.getAttribute('for');
        } else {
            inputName = clickedEl.closest('label')?.getAttribute('for');
        }

        if (inputName != null) {
            inputEl = document.querySelector('input[name=' + inputName + '], select[name=' + inputName +
                '], textarea[name=' + inputName + ']');
        }
    }

    if (inputEl == null) {
        return invalidElement;
    }

    for (const attr of attributes) {
        const attributeValue = inputEl.getAttribute(attr);
        const selector = '[' + attr + '="' + attributeValue + '"]';
        if (!isNullOrEmpty(attributeValue) && document.querySelectorAll(selector)?.length === 1) {
            return attributeValue;
        }
    }
    return noUniqueIdentifier;
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
