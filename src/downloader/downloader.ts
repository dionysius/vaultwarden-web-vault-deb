document.addEventListener('DOMContentLoaded', () => {
    const isSafari = (typeof safari !== 'undefined') && navigator.userAgent.indexOf(' Safari/') !== -1 &&
        navigator.userAgent.indexOf('Chrome') === -1;

    if (!isSafari) {
        return;
    }

    safari.self.addEventListener('message', (msgEvent: any) => {
        // tslint:disable-next-line
        console.log('GOT MESSAGE');
        // tslint:disable-next-line
        console.log(msgEvent);
        doDownload(JSON.parse(msgEvent.message.msg));
    }, false);

    function doDownload(msg: any) {
        if (msg.command === 'downloaderPageData' && msg.data) {
            const blob = new Blob([msg.data.blobData], msg.data.blobOptions);
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

        window.setTimeout(() => window.close(), 1500);
    }
});
