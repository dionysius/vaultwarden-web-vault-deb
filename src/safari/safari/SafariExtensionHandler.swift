import SafariServices

class SafariExtensionHandler: SFSafariExtensionHandler {
    override init() {
        super.init()
        SafariExtensionViewController.shared.initWebView()
    }

    override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String: Any]?) {
        // This method will be called when a content script provided by your extension
        // calls safari.extension.dispatchMessage("message").
        if messageName == "bitwarden" {
            page.getPropertiesWithCompletionHandler { properties in
                DispatchQueue.main.async {
                    makeSenderTabObject(page: page, props: properties, complete: { senderTab in
                        DispatchQueue.main.async {
                            self.sendMessage(msg: userInfo, sender: senderTab)
                        }
                    })
                }
            }
        }
    }

    override func toolbarItemClicked(in _: SFSafariWindow) {
        // This method will be called when your toolbar item is clicked.
    }

    override func validateToolbarItem(in _: SFSafariWindow, validationHandler: @escaping ((Bool, String) -> Void)) {
        // This is called when Safari's state changed in some way that would require the extension's
        // toolbar item to be validated again.
        validationHandler(true, "")
    }

    override func popoverViewController() -> SFSafariExtensionViewController {
        return SafariExtensionViewController.shared
    }

    override func popoverWillShow(in _: SFSafariWindow) {
        SafariExtensionViewController.shared.popoverOpenCount += 1
        DispatchQueue.main.async {
            self.sendMessage(msg: ["command": "reloadPopup"], sender: nil)
        }
    }

    override func popoverDidClose(in _: SFSafariWindow) {
        SafariExtensionViewController.shared.popoverOpenCount -= 1
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
            guard let window = win else {
                t.active = false;
                t.windowId = -100
                SFSafariApplication.getAllWindows(completionHandler: { allWins in
                    if (allWins.count == 0) {
                        return
                    }
                    allWins[0].getAllTabs { allWinTabs in
                        t.index = allWinTabs.firstIndex(of: tab) ?? -1
                        t.id = "\(t.windowId)_\(t.index)"
                        complete(t)
                    }
                })
                return
            }
            window.getActiveTab(completionHandler: { activeTab in
                t.active = activeTab != nil && tab == activeTab
                SFSafariApplication.getAllWindows(completionHandler: { allWins in
                    t.windowId = allWins.firstIndex(of: window) ?? -100
                    window.getAllTabs { allWinTabs in
                        t.index = allWinTabs.firstIndex(of: tab) ?? -1
                        t.id = "\(t.windowId)_\(t.index)"
                        complete(t)
                    }
                })
            })
        })
    }
}
