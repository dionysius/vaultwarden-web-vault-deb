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
        let messageBody = message.body as! String
        let m: AppMessage? = jsonDeserialize(json: messageBody)
        if m == nil {
            return
        }
        let command = m!.command
        log("Command: \(command)")
        if command == "storage_get" {
            if m!.data != nil {
                log("DEBUG - 1, \(m!.data!)")
                let obj = UserDefaults.standard.string(forKey: m!.data!)
                log("DEBUG - 2")
                m!.responseData = obj
                replyMessage(message: m!)
                log("DEBUG - 3")
            }
        } else if command == "storage_save" {
            let data: StorageData? = jsonDeserialize(json: m!.data)
            log("DEBUG - 4")
            if data?.key != nil {
                log("DEBUG - 5")
                if data?.obj == nil {
                    log("DEBUG - 6, \(data!.key)")
                    UserDefaults.standard.removeObject(forKey: data!.key)
                    log("DEBUG - 7")
                } else {
                    log("DEBUG - 8, \(data!.key)")
                    UserDefaults.standard.set(data?.obj, forKey: data!.key)
                    log("DEBUG - 9")
                }
                replyMessage(message: m!)
                log("DEBUG - 10")
            }
        } else if command == "storage_remove" {
            if m!.data != nil {
                log("DEBUG - 11, \(m!.data!)")
                UserDefaults.standard.removeObject(forKey: m!.data!)
                log("DEBUG - 12")
                replyMessage(message: m!)
                log("DEBUG - 13")
            }
        } else if command == "getLocaleStrings" {
            let language = m!.data ?? "en"
            log("DEBUG - 14, \(language)")
            let bundleURL = Bundle.main.resourceURL!.absoluteURL
            log("DEBUG - 15, \(bundleURL)")
            let messagesUrl = bundleURL.appendingPathComponent("app/_locales/\(language)/messages.json")
            log("DEBUG - 16, \(messagesUrl)")
            do {
                let json = try String(contentsOf: messagesUrl, encoding: .utf8)
                log("DEBUG - 17")
                webView.evaluateJavaScript("window.bitwardenLocaleStrings = \(json);", completionHandler: nil)
                log("DEBUG - 18")
            } catch {
                log("DEBUG - 19, \(error)")
            }
            replyMessage(message: m!)
            log("DEBUG - 20")
        } else if command == "tabs_query" {
            let options: TabQueryOptions? = jsonDeserialize(json: m!.data)
            log("DEBUG - 21")
            if options?.currentWindow ?? false {
                log("DEBUG - 22")
                SFSafariApplication.getActiveWindow { win in
                    if win != nil {
                        log("DEBUG - 23")
                        processWindowsForTabs(wins: [win!], options: options, complete: { tabs in
                        log("DEBUG - 24")
                            m!.responseData = jsonSerialize(obj: tabs)
                            log("DEBUG - 25")
                            self.replyMessage(message: m!)
                            log("DEBUG - 26")
                        })
                    } else {
                        log("DEBUG - 27")
                        SFSafariApplication.getAllWindows { wins in
                            log("DEBUG - 28")
                            processWindowsForTabs(wins: wins, options: options, complete: { tabs in
                                log("DEBUG - 29")
                                m!.responseData = jsonSerialize(obj: tabs)
                                log("DEBUG - 30")
                                self.replyMessage(message: m!)
                                log("DEBUG - 31")
                            })
                        }
                        log("DEBUG - 32")
                    }
                }
            } else {
                log("DEBUG - 33")
                SFSafariApplication.getAllWindows { wins in
                    log("DEBUG - 34")
                    processWindowsForTabs(wins: wins, options: options, complete: { tabs in
                        log("DEBUG - 35")
                        m!.responseData = jsonSerialize(obj: tabs)
                        log("DEBUG - 36")
                        self.replyMessage(message: m!)
                        log("DEBUG - 37")
                    })
                }
            }
        } else if command == "tabs_message" {
            let tabMsg: TabMessage? = jsonDeserialize(json: m!.data)
            log("DEBUG - 38")
            SFSafariApplication.getAllWindows { wins in
                log("DEBUG - 39")
                var theWin: SFSafariWindow?
                var winIndex = 0
                log("DEBUG - 40")
                for win in wins {
                    log("DEBUG - 40.a")
                    if tabMsg?.tab.windowId == winIndex {
                        log("DEBUG - 40.b")
                        theWin = win
                        break
                    }
                    winIndex = winIndex + 1
                }
                log("DEBUG - 41")
                var theTab: SFSafariTab?
                theWin?.getAllTabs { tabs in
                    log("DEBUG - 42")
                    var tabIndex = 0
                    for tab in tabs {
                        log("DEBUG - 43")
                        if tabMsg?.tab.index == tabIndex {
                            log("DEBUG - 43.a")
                            theTab = tab
                            break
                        }
                        tabIndex = tabIndex + 1
                    }
                    log("DEBUG - 44")
                    theTab?.getActivePage { activePage in
                        log("DEBUG - 45")
                        activePage?.dispatchMessageToScript(withName: "bitwarden", userInfo: ["msg": tabMsg!.obj])
                        log("DEBUG - 46")
                    }
                    log("DEBUG - 47")
                }
            }
        } else if command == "hidePopover" {
            dismissPopover()
            log("DEBUG - 48")
            replyMessage(message: m!)
            log("DEBUG - 49")
        } else if command == "showPopover" {
            if popoverOpenCount <= 0 {
                log("DEBUG - 50")
                SFSafariApplication.getActiveWindow { win in
                    log("DEBUG - 51")
                    win?.getToolbarItem(completionHandler: { item in
                        log("DEBUG - 52")
                        item?.showPopover()
                        log("DEBUG - 53")
                    })
                }
                log("DEBUG - 54")
            }
        } else if command == "isPopoverOpen" {
            m!.responseData = popoverOpenCount > 0 ? "true" : "false"
            log("DEBUG - 55")
            replyMessage(message: m!)
            log("DEBUG - 56")
        } else if command == "createNewTab" {
            if m!.data != nil {
                log("DEBUG - 57")
                SFSafariApplication.getActiveWindow { win in
                    log("DEBUG - 58")
                    win?.openTab(with: URL(string: m!.data!)!, makeActiveIfPossible: true, completionHandler: { _ in
                        log("DEBUG - 59")
                        // Tab opened
                    })
                    log("DEBUG - 60")
                }
                log("DEBUG - 61")
            }
        } else if command == "reloadExtension" {
            webView?.reload()
            log("DEBUG - 62")
            replyMessage(message: m!)
            log("DEBUG - 63")
        } else if command == "copyToClipboard" {
            let pasteboard = NSPasteboard.general
            log("DEBUG - 64")
            pasteboard.declareTypes([NSPasteboard.PasteboardType.string], owner: nil)
            log("DEBUG - 65")
            pasteboard.setString(m!.data ?? "", forType: NSPasteboard.PasteboardType.string)
            log("DEBUG - 66")
            replyMessage(message: m!)
            log("DEBUG - 67")
        } else if command == "readFromClipboard" {
            let pasteboard = NSPasteboard.general
            log("DEBUG - 68")
            m!.responseData = pasteboard.pasteboardItems?.first?.string(forType: .string)
            log("DEBUG - 69")
            replyMessage(message: m!)
            log("DEBUG - 70")
        } else if command == "downloadFile" {
            if m!.data != nil {
                log("DEBUG - 71")
                if let dlMsg: DownloadFileMessage = jsonDeserialize(json: m!.data) {
                    log("DEBUG - 72")
                    var data: Data?
                    if dlMsg.blobOptions?.type == "text/plain" {
                        log("DEBUG - 73")
                        data = dlMsg.blobData?.data(using: .utf8)
                        log("DEBUG - 74")
                    } else if dlMsg.blobData != nil {
                        log("DEBUG - 75")
                        data = Data(base64Encoded: dlMsg.blobData!)
                        log("DEBUG - 76")
                    }
                    if data != nil {
                        log("DEBUG - 76")
                        let panel = NSSavePanel()
                        panel.canCreateDirectories = true
                        panel.nameFieldStringValue = dlMsg.fileName
                        log("DEBUG - 77")
                        panel.begin { response in
                            log("DEBUG - 78")
                            if response == NSApplication.ModalResponse.OK {
                                log("DEBUG - 79")
                                if let url = panel.url {
                                    do {
                                        let fileManager = FileManager.default
                                        if !fileManager.fileExists(atPath: url.absoluteString) {
                                            fileManager.createFile(atPath: url.absoluteString, contents: Data(),
                                                                   attributes: nil)
                                        }
                                        try data!.write(to: url)
                                        log("DEBUG - 80")
                                    } catch {
                                        print(error)
                                        log("DEBUG - 81, \(error)")
                                    }
                                }
                            }
                        }
                        log("DEBUG - 82")
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
        webView.evaluateJavaScript("window.bitwardenSafariAppMessageReceiver(\(json));", completionHandler: nil)
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
        if page == nil {
            complete(t)
        } else {
            page!.getPropertiesWithCompletionHandler({ props in
                t.title = props?.title
                t.url = props?.url?.absoluteString
                complete(t)
            })
        }
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

func log(_ message: String) {
    NSLog("com.bitwarden.desktop.safari: \(message)")
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
