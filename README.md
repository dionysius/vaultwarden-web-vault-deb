[![Github Workflow build on master](https://github.com/bitwarden/browser/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/bitwarden/browser/actions/workflows/build.yml?query=branch:master)
[![Crowdin](https://d322cqt584bo4o.cloudfront.net/bitwarden-browser/localized.svg)](https://crowdin.com/project/bitwarden-browser)
[![Join the chat at https://gitter.im/bitwarden/Lobby](https://badges.gitter.im/bitwarden/Lobby.svg)](https://gitter.im/bitwarden/Lobby)

# Bitwarden Browser Extension

<a href="https://chrome.google.com/webstore/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb" target="_blank"><img src="https://imgur.com/3C4iKO0.png" width="64" height="64"></a>
<a href="https://addons.mozilla.org/firefox/addon/bitwarden-password-manager/" target="_blank"><img src="https://imgur.com/ihXsdDO.png" width="64" height="64"></a>
<a href="https://www.microsoft.com/store/p/bitwarden-free-password-manager/9p6kxl0svnnl" target="_blank"><img src="https://imgur.com/vMcaXaw.png" width="64" height="64"></a>
<a href="https://addons.opera.com/extensions/details/bitwarden-free-password-manager/" target="_blank"><img src="https://imgur.com/nSJ9htU.png" width="64" height="64"></a>
<a href="https://bitwarden.com/download/" target="_blank"><img src="https://imgur.com/ENbaWUu.png" width="64" height="64"></a>
<a href="https://chrome.google.com/webstore/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb" target="_blank"><img src="https://imgur.com/EuDp4vP.png" width="64" height="64"></a>
<a href="https://chrome.google.com/webstore/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb" target="_blank"><img src="https://imgur.com/z8yjLZ2.png" width="64" height="64"></a>
<a href="https://addons.mozilla.org/firefox/addon/bitwarden-password-manager/" target="_blank"><img src="https://imgur.com/MQYBSrD.png" width="64" height="64"></a>

The Bitwarden browser extension is written using the Web Extension API and Angular.

![](https://raw.githubusercontent.com/bitwarden/brand/master/screenshots/browser-chrome.png "My Vault")

# Build/Run

**Requirements**

- [Node.js](https://nodejs.org) v14.17 or greater
- NPM v7
- [Gulp](https://gulpjs.com/) (`npm install --global gulp-cli`)
- Chrome (preferred), Opera, or Firefox browser

**Run the app**

```
npm install
npm run build:watch
```

You can now load the extension into your browser through the browser's extension tools page:

- Chrome/Opera:
  1. Type `chrome://extensions` in your address bar to bring up the extensions page.
  2. Enable developer mode (toggle switch)
  3. Click the "Load unpacked extension" button, navigate to the `build` folder of your local extension instance, and click "Ok".
- Firefox
  1. Type `about:debugging` in your address bar to bring up the add-ons page.
  2. Click the `Load Temporary Add-on` button, navigate to the `build/manifest.json` file, and "Open".

**Desktop communication**

Native Messaging (communication between the desktop application and browser extension) works by having the browser start a lightweight proxy baked into our desktop application.

Out of the box, the desktop application can only communicate with the production browser extension. When you enable browser integration in the desktop application, the application generates manifests which contain the production IDs of the browser extensions. To enable communication between the desktop application and development versions of browser extensions, add the development IDs to the `allowed_extensions` section of the corresponding manifests.

Manifests are located in the `browser` subdirectory of the Bitwarden configuration directory. For instance, on Windows the manifests are located at `C:\Users\<user>\AppData\Roaming\Bitwarden\browsers` and on macOS these are in `Application Support` for various browsers ([for example](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location)). Note that disabling the desktop integration will delete the manifests, and the files will need to be updated again.

# Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch. Learn more about how to contribute by reading the [`CONTRIBUTING.md`](CONTRIBUTING.md) file.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.
