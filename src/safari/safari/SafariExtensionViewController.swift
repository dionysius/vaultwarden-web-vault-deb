import SafariServices
import WebKit

class SafariExtensionViewController: SFSafariExtensionViewController, WKScriptMessageHandler, WKNavigationDelegate {
    var webView: WKWebView!
    var initedWebView: Bool = false
    var popoverOpenCount: Int = 0

    static let shared: SafariExtensionViewController = {
        let shared = SafariExtensionViewController()
        shared.preferredContentSize = NSSize(width: 375, height: 600)
        return shared
    }()

    func initWebView() {
        if initedWebView {
            return
        }
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
        initedWebView = true
        let parentHeight = SafariExtensionViewController.shared.preferredContentSize.height
        let parentWidth = SafariExtensionViewController.shared.preferredContentSize.width
        let webViewConfig = WKWebViewConfiguration()
        let bundleURL = Bundle.main.resourceURL!.absoluteURL
        let html = bundleURL.appendingPathComponent("app/popup/index.html")
        let url = URL(string: "\(html.absoluteString)?appVersion=\(version!)")
        webViewConfig.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        webViewConfig.preferences.setValue(true, forKey: "developerExtrasEnabled")
        webViewConfig.userContentController.add(self, name: "bitwardenApp")
        webView = WKWebView(frame: CGRect(x: 0, y: 0, width: parentWidth, height: parentHeight),
                            configuration: webViewConfig)
        webView.navigationDelegate = self
        webView.allowsLinkPreview = false
        webView.loadFileURL(url!, allowingReadAccessTo: bundleURL)
        webView.alphaValue = 0.0
        webView.uiDelegate = self
        view.addSubview(webView)
    }

    func webView(_ webView: WKWebView, didFinish _: WKNavigation!) {
        if #available(OSXApplicationExtension 10.12, *) {
            NSAnimationContext.runAnimationGroup({ _ in
                NSAnimationContext.current.duration = 0.35
                webView.animator().alphaValue = 1.0
            })
        } else {
            // Fallback on earlier versions
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        let backgroundColor = NSColor(red: (39 / 255.0), green: (42 / 255.0), blue: (46 / 255.0), alpha: 1.0)
        view.setValue(backgroundColor, forKey: "backgroundColor")
        initWebView()
    }

    func userContentController(_: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name != "bitwardenApp" {
            return
        }
        guard let messageBody = message.body as? String else {
            return
        }
        guard let m: AppMessage = jsonDeserialize(json: messageBody) else {
            return
        }
        let command = m.command
        NSLog("Command: \(command)")
        if command == "storage_get" {
            if let data = m.data {
                let obj = UserDefaults.standard.string(forKey: data)
                m.responseData = obj
                replyMessage(message: m)
            }
        } else if command == "storage_save" {
            guard let data: StorageData = jsonDeserialize(json: m.data) else {
                return
            }
            if let obj = data.obj {
                UserDefaults.standard.set(obj, forKey: data.key)
            } else {
                UserDefaults.standard.removeObject(forKey: data.key)
            }
            replyMessage(message: m)
        } else if command == "storage_remove" {
            if let data = m.data {
                UserDefaults.standard.removeObject(forKey: data)
                replyMessage(message: m)
            }
        } else if command == "getLocaleStrings" {
            let language = m.data ?? "en"
            guard let bundleUrl = Bundle.main.resourceURL?.absoluteURL else {
                return
            }
            let messagesUrl = bundleUrl.appendingPathComponent("app/_locales/\(language)/messages.json")
            do {
                let json = try String(contentsOf: messagesUrl, encoding: .utf8)
                webView.evaluateJavaScript("window.bitwardenLocaleStrings = \(json);", completionHandler: {(result, error) in
                    guard let err = error else {
                        return;
                    }
                    NSLog("evaluateJavaScript error : %@", err.localizedDescription);
                })
            } catch {
                NSLog("ERROR on getLocaleStrings, \(error)")
            }
            replyMessage(message: m)
        } else if command == "tabs_query" {
            guard let options: TabQueryOptions = jsonDeserialize(json: m.data) else {
                return
            }
            if options.currentWindow ?? false {
                SFSafariApplication.getActiveWindow { win in
                    if win != nil {
                        processWindowsForTabs(wins: [win!], options: options, complete: { tabs in
                            m.responseData = jsonSerialize(obj: tabs)
                            self.replyMessage(message: m)
                        })
                    } else {
                        SFSafariApplication.getAllWindows { wins in
                            processWindowsForTabs(wins: wins, options: options, complete: { tabs in
                                m.responseData = jsonSerialize(obj: tabs)
                                self.replyMessage(message: m)
                            })
                        }
                    }
                }
            } else {
                SFSafariApplication.getAllWindows { wins in
                    processWindowsForTabs(wins: wins, options: options, complete: { tabs in
                        m.responseData = jsonSerialize(obj: tabs)
                        self.replyMessage(message: m)
                    })
                }
            }
        } else if command == "tabs_message" {
            guard let tabMsg: TabMessage = jsonDeserialize(json: m.data) else {
                return
            }
            SFSafariApplication.getAllWindows { wins in
                var theWin: SFSafariWindow?
                var winIndex = 0
                for win in wins {
                    if tabMsg.tab.windowId == winIndex {
                        theWin = win
                        break
                    }
                    winIndex = winIndex + 1
                }
                var theTab: SFSafariTab?
                theWin?.getAllTabs { tabs in
                    var tabIndex = 0
                    for tab in tabs {
                        if tabMsg.tab.index == tabIndex {
                            theTab = tab
                            break
                        }
                        tabIndex = tabIndex + 1
                    }
                    theTab?.getActivePage { activePage in
                        activePage?.dispatchMessageToScript(withName: "bitwarden", userInfo: ["msg": tabMsg.obj])
                    }
                }
            }
        } else if command == "hidePopover" {
            dismissPopover()
            replyMessage(message: m)
        } else if command == "showPopover" {
            if popoverOpenCount <= 0 {
                SFSafariApplication.getActiveWindow { win in
                    win?.getToolbarItem(completionHandler: { item in
                        item?.showPopover()
                    })
                }
            }
        } else if command == "isPopoverOpen" {
            m.responseData = popoverOpenCount > 0 ? "true" : "false"
            replyMessage(message: m)
        } else if command == "createNewTab" {
            if let data = m.data, let url = URL(string: data) {
                SFSafariApplication.getActiveWindow { win in
                    win?.openTab(with: url, makeActiveIfPossible: true, completionHandler: { _ in
                        // Tab opened
                    })
                }
            }
        } else if command == "reloadExtension" {
            webView?.reload()
            replyMessage(message: m)
        } else if command == "copyToClipboard" {
            let pasteboard = NSPasteboard.general
            pasteboard.declareTypes([NSPasteboard.PasteboardType.string], owner: nil)
            pasteboard.setString(m.data ?? "", forType: NSPasteboard.PasteboardType.string)
            replyMessage(message: m)
        } else if command == "readFromClipboard" {
            let pasteboard = NSPasteboard.general
            m.responseData = pasteboard.pasteboardItems?.first?.string(forType: .string)
            replyMessage(message: m)
        } else if command == "downloadFile" {
            guard let jsonData = m.data else {
                return
            }
            guard let dlMsg: DownloadFileMessage = jsonDeserialize(json: jsonData) else {
                return
            }
            var blobData: Data?
            if dlMsg.blobOptions?.type == "text/plain" {
                blobData = dlMsg.blobData?.data(using: .utf8)
            } else if let blob = dlMsg.blobData {
                blobData = Data(base64Encoded: blob)
            }
            guard let data = blobData else {
                return
            }
            let panel = NSSavePanel()
            panel.canCreateDirectories = true
            panel.nameFieldStringValue = dlMsg.fileName
            panel.begin { response in
                if response == NSApplication.ModalResponse.OK {
                    if let url = panel.url {
                        do {
                            let fileManager = FileManager.default
                            if !fileManager.fileExists(atPath: url.absoluteString) {
                                fileManager.createFile(atPath: url.absoluteString, contents: Data(),
                                                       attributes: nil)
                            }
                            try data.write(to: url)
                        } catch {
                            print(error)
                            NSLog("ERROR in downloadFile, \(error)")
                        }
                    }
                }
            }
        }
    }

    func replyMessage(message: AppMessage) {
        if webView == nil {
            return
        }
        let json = (jsonSerialize(obj: message) ?? "null")
        webView.evaluateJavaScript("window.bitwardenSafariAppMessageReceiver(\(json));", completionHandler: {(result, error) in
            guard let err = error else {
                return;
            }
            NSLog("evaluateJavaScript error : %@", err.localizedDescription);
        })
    }
}

extension SafariExtensionViewController: WKUIDelegate {
    @available(OSXApplicationExtension 10.12, *)
    func webView(_: WKWebView, runOpenPanelWith _: WKOpenPanelParameters, initiatedByFrame _: WKFrameInfo,
                 completionHandler: @escaping ([URL]?) -> Void) {
        let openPanel = NSOpenPanel()
        openPanel.canChooseFiles = true
        openPanel.begin { result in
            if result == NSApplication.ModalResponse.OK && openPanel.url != nil {
                completionHandler([openPanel.url!])
            } else {
                completionHandler(nil)
            }
        }
    }
}

func processWindowsForTabs(wins: [SFSafariWindow], options: TabQueryOptions?, complete: @escaping ([Tab]) -> Void) {
    if wins.count == 0 {
        complete([])
        return
    }
    var newTabs: [Tab] = []
    let winGroup = DispatchGroup()
    for win in wins {
        winGroup.enter()
        win.getActiveTab { activeTab in
            win.getAllTabs { allTabs in
                let tabGroup = DispatchGroup()
                for tab in allTabs {
                    tabGroup.enter()
                    if options?.active ?? false {
                        if activeTab != nil && activeTab == tab {
                            let windowIndex = wins.firstIndex(of: win) ?? -100
                            let tabIndex = allTabs.firstIndex(of: tab) ?? -1
                            makeTabObject(tab: tab, activeTab: activeTab, windowIndex: windowIndex,
                                          tabIndex: tabIndex, complete: { t in
                                              newTabs.append(t)
                                              tabGroup.leave()
                            })
                        } else {
                            tabGroup.leave()
                        }
                    } else {
                        let windowIndex = wins.firstIndex(of: win) ?? -100
                        let tabIndex = allTabs.firstIndex(of: tab) ?? -1
                        makeTabObject(tab: tab, activeTab: activeTab, windowIndex: windowIndex,
                                      tabIndex: tabIndex, complete: { t in
                                          newTabs.append(t)
                                          tabGroup.leave()
                        })
                    }
                }
                tabGroup.notify(queue: .main) {
                    winGroup.leave()
                }
            }
        }
    }
    winGroup.notify(queue: .main) {
        complete(newTabs)
    }
}

func makeTabObject(tab: SFSafariTab, activeTab: SFSafariTab?, windowIndex: Int, tabIndex: Int,
                   complete: @escaping (Tab) -> Void) {
    let t = Tab()
    t.active = activeTab != nil && tab == activeTab
    t.windowId = windowIndex
    t.index = tabIndex
    t.id = "\(windowIndex)_\(tabIndex)"
    tab.getActivePage { page in
        guard let activePage = page else {
            complete(t)
            return
        }
        activePage.getPropertiesWithCompletionHandler({ props in
            t.title = props?.title
            t.url = props?.url?.absoluteString
            complete(t)
        })
    }
}

func jsonSerialize<T: Encodable>(obj: T?) -> String? {
    let encoder = JSONEncoder()
    do {
        let data = try encoder.encode(obj)
        return String(data: data, encoding: .utf8) ?? "null"
    } catch _ {
        return "null"
    }
}

func jsonDeserialize<T: Decodable>(json: String?) -> T? {
    if json == nil {
        return nil
    }
    let decoder = JSONDecoder()
    do {
        let obj = try decoder.decode(T.self, from: json!.data(using: .utf8)!)
        return obj
    } catch _ {
        return nil
    }
}

class AppMessage: Decodable, Encodable {
    init() {
        id = ""
        command = ""
        data = nil
        responseData = nil
        responseError = nil
    }

    var id: String
    var command: String
    var data: String?
    var responseData: String?
    var responseError: Bool?
    var senderTab: Tab?
}

class StorageData: Decodable, Encodable {
    var key: String
    var obj: String?
}

class TabQueryOptions: Decodable, Encodable {
    var currentWindow: Bool?
    var active: Bool?
}

class Tab: Decodable, Encodable {
    init() {
        id = ""
        index = -1
        windowId = -100
        title = ""
        active = false
        url = ""
    }

    var id: String
    var index: Int
    var windowId: Int
    var title: String?
    var active: Bool
    var url: String?
}

class TabMessage: Decodable, Encodable {
    var tab: Tab
    var obj: String
    var options: TabMessageOptions?
}

class TabMessageOptions: Decodable, Encodable {
    var frameId: Int?
}

class DownloadFileMessage: Decodable, Encodable {
    var fileName: String
    var blobData: String?
    var blobOptions: DownloadFileMessageBlobOptions?
}

class DownloadFileMessageBlobOptions: Decodable, Encodable {
    var type: String?
}
