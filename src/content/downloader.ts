document.addEventListener('DOMContentLoaded', (event) => {
    const isSafari = (typeof safari !== 'undefined') && navigator.userAgent.indexOf(' Safari/') !== -1 &&
        navigator.userAgent.indexOf('Chrome') === -1;

    if (!isSafari) {
        return;
    }

    safari.self.addEventListener('message', (msgEvent: any) => {
        const msg = JSON.parse(msgEvent.message.msg);
        if (msg.command === 'downloaderPageData') {
            let data: any = msg.data.blobData;
            if (msg.data.blobOptions == null || msg.data.blobOptions.type !== 'text/plain') {
                const binaryString = window.atob(msg.data.blobData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                data = bytes.buffer;
            }
            const blob = new Blob([data], msg.data.blobOptions);
            if (navigator.msSaveOrOpenBlob) {
                navigator.msSaveBlob(blob, msg.data.fileName);
            } else {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = msg.data.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }
    }, false);
});
