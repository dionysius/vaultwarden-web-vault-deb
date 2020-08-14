window.addEventListener("message", function(event) {
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "AUTH_RESULT")) {
        chrome.runtime.sendMessage({
            type: event.data.type,
            code: event.data.code,
            state: event.data.state,
            referrer: event.source.location.hostname
        });
    }
}, false)