window.addEventListener('message', (event) => {
    if (event.source !== window)
        return;

    if (event.data.command && (event.data.command === 'authResult')) {
        if (typeof chrome === typeof undefined) {
            safari.extension.dispatchMessage('bitwarden', {
                command: event.data.command,
                code: event.data.code,
                state: event.data.state,
                referrer: event.source.location.hostname,
            });
            return;
        }
        chrome.runtime.sendMessage({
            command: event.data.command,
            code: event.data.code,
            state: event.data.state,
            referrer: event.source.location.hostname,
        });
    }
}, false);
