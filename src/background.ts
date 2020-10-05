import MainBackground from './background/main.background';

const bitwardenMain = (window as any).bitwardenMain = new MainBackground();
bitwardenMain.bootstrap().then(() => {
    // Finished bootstrapping
});

const port = chrome.runtime.connectNative('com.8bit.bitwarden');

port.onMessage.addListener((msg: any) => {
    console.log('Received' + msg);
});
port.onDisconnect.addListener(() => {
    console.log('Disconnected');
});
port.postMessage({ text: 'Hello, my_application' });
