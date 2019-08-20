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
            page.getPropertiesWithCompletionHandler { properties in
                // NSLog("The extension received a message (\(messageName)) from a script injected into (\(String(describing: properties?.url))) with userInfo (\(userInfo ?? [:]))")
                DispatchQueue.main.async {
                    makeSenderTabObject(page: page, props: properties, complete: { senderTab in
                        self.sendMessage(msg: userInfo, sender: senderTab)
                    })
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
            self.sendMessage(msg: ["command": "reloadPopup"], sender: nil)
        }
    }
    
    func sendMessage(msg: [String: Any]?, sender: Tab? = nil) {
        if SafariExtensionViewController.shared.webView == nil {
            return
        }
        let newMsg = AppMessage()
        newMsg.command = "app_message"
        newMsg.senderTab = sender
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: msg as Any, options: [])
            newMsg.data = String(data: jsonData, encoding: .utf8)
        } catch let error {
            print("error converting to json: \(error)")
        }
        SafariExtensionViewController.shared.replyMessage(message: newMsg)
    }
}

func makeSenderTabObject(page: SFSafariPage, props: SFSafariPageProperties?, complete: @escaping (Tab) -> Void) {
    let t = Tab()
    t.title = props?.title
    t.url = props?.url?.absoluteString
    page.getContainingTab { tab in
        tab.getContainingWindow(completionHandler: { win in
            win?.getActiveTab(completionHandler: { activeTab in
                t.active = activeTab != nil && tab == activeTab
                SFSafariApplication.getAllWindows(completionHandler: { allWins in
                    t.windowId = allWins.firstIndex(of: win!) ?? -100
                    let winGroup = DispatchGroup()
                    for allWin in allWins {
                        winGroup.enter()
                        allWin.getAllTabs { allWinTabs in
                            t.index = allWinTabs.firstIndex(of: tab) ?? -1
                            winGroup.leave()
                        }
                    }
                    winGroup.notify(queue: .main) {
                        t.id = "\(t.windowId)_\(t.index)"
                        complete(t)
                    }
                })
            })
        })
    }
}
