//
//  SafariExtensionHandler.swift
//  safari
//
//  Created by Kyle Spearrin on 8/1/19.
//  Copyright © 2019 8bit Solutions LLC. All rights reserved.
//

import SafariServices

class SafariExtensionHandler: SFSafariExtensionHandler {
    override init() {
        super.init()
        SafariExtensionViewController.shared.initWebView()
    }
    
    override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String: Any]?) {
        // This method will be called when a content script provided by your extension calls safari.extension.dispatchMessage("message").
        if messageName == "bitwarden" {
            page.getPropertiesWithCompletionHandler { _ in
                // NSLog("The extension received a message (\(messageName)) from a script injected into (\(String(describing: properties?.url))) with userInfo (\(userInfo ?? [:]))")
                DispatchQueue.main.async {
                    SafariExtensionViewController.shared.sendMessage(msg: userInfo)
                }
            }
        }
    }

    override func toolbarItemClicked(in _: SFSafariWindow) {
        // This method will be called when your toolbar item is clicked.
        //  NSLog("The extension's toolbar item was clicked")
    }

    override func validateToolbarItem(in _: SFSafariWindow, validationHandler: @escaping ((Bool, String) -> Void)) {
        // This is called when Safari's state changed in some way that would require the extension's toolbar item to be validated again.
        validationHandler(true, "")
    }

    override func popoverViewController() -> SFSafariExtensionViewController {
        return SafariExtensionViewController.shared
    }

    override func popoverWillShow(in _: SFSafariWindow) {
        DispatchQueue.main.async {
            SafariExtensionViewController.shared.sendMessage(msg: ["command": "reloadPopup"])
        }
    }
}
