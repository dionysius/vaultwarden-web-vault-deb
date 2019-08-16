//
//  SafariExtensionViewController.swift
//  safari
//
//  Created by Kyle Spearrin on 8/1/19.
//  Copyright © 2019 8bit Solutions LLC. All rights reserved.
//

import SafariServices
import WebKit

class SafariExtensionViewController: SFSafariExtensionViewController, WKScriptMessageHandler, WKNavigationDelegate {
    
    var webView: WKWebView!
    
    static let shared: SafariExtensionViewController = {
        let shared = SafariExtensionViewController()
        shared.preferredContentSize = NSSize(width:375, height:600)
        return shared
    }()
    
    func initWebView() {
        let parentHeight = SafariExtensionViewController.shared.preferredContentSize.height
        let parentWidth = SafariExtensionViewController.shared.preferredContentSize.width
        let webViewConfig = WKWebViewConfiguration()
        let bundleURL = Bundle.main.resourceURL!.absoluteURL
        let html = bundleURL.appendingPathComponent("app/popup/index.html")
        webViewConfig.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        webViewConfig.preferences.setValue(true, forKey: "developerExtrasEnabled")
        webViewConfig.userContentController.add(self, name: "bitwardenApp")
        webView = WKWebView(frame: CGRect(x: 0, y: 0, width: parentWidth, height: parentHeight), configuration: webViewConfig)
        webView.navigationDelegate = self
        webView.allowsLinkPreview = false
        webView.loadFileURL(html, allowingReadAccessTo: bundleURL)
        webView.alphaValue = 0.0;
        self.view.addSubview(webView)
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        NSAnimationContext.runAnimationGroup({_ in
            NSAnimationContext.current.duration = 0.35
            webView.animator().alphaValue = 1.0
        })
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        let backgroundColor = NSColor.init(red: (39/255.0), green: (42/255.0), blue: (46/255.0), alpha: 1.0)
        view.setValue(backgroundColor, forKey: "backgroundColor")
        initWebView()
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "bitwardenApp" {
            let messageBody = message.body as! String;
            print(messageBody)
            let m : AppMessage? = jsonDeserialize(json: messageBody)
            if(m == nil) {
                print("m is nil")
            } else {
                let command = m?.command ?? "null"
                print(command)
                if(command == "storage_get") {
                    let obj = UserDefaults.standard.string(forKey: m!.data!)
                    m!.responseData = obj
                    replyMessage(message: m!)
                } else if(command == "storage_save") {
                    let data : StorageData? = jsonDeserialize(json: m!.data)
                    if(data?.obj == nil) {
                        UserDefaults.standard.removeObject(forKey: data!.key)
                    } else {
                        UserDefaults.standard.set(data?.obj, forKey: data!.key)
                    }
                    replyMessage(message: m!)
                } else if(command == "storage_remove") {
                    UserDefaults.standard.removeObject(forKey: m!.data!)
                    replyMessage(message: m!)
                } else if(command == "getLocaleStrings") {
                    let language = m!.data
                    let bundleURL = Bundle.main.resourceURL!.absoluteURL
                    let messagesUrl = bundleURL.appendingPathComponent("app/_locales/en/messages.json")
                    do {
                        let json = try String(contentsOf: messagesUrl, encoding: .utf8)
                        webView.evaluateJavaScript("window.bitwardenLocaleStrings = \(json);", completionHandler: nil)
                    } catch { }
                    replyMessage(message: m!)
                } else if(command == "tabs_query") {
                    let options : TabQueryOptions? = jsonDeserialize(json: m!.data)
                    if(options?.currentWindow ?? false) {
                        SFSafariApplication.getActiveWindow { (win) in
                            processWindowsForTabs(wins: [win!], options: options
                                , complete: { (tabs) in
                                    m!.responseData = jsonSerialize(obj: tabs)
                                    self.replyMessage(message: m!)
                            })
                        }
                    } else {
                        SFSafariApplication.getAllWindows { (wins) in
                            processWindowsForTabs(wins: wins, options: options
                                , complete: { (tabs) in
                                    m!.responseData = jsonSerialize(obj: tabs)
                                    self.replyMessage(message: m!)
                            })
                        }
                    }
                } else if(command == "tabs_message") {
                    let tabMsg: TabMessage? = jsonDeserialize(json: m!.data)
                    SFSafariApplication.getAllWindows { (wins) in
                        var theWin: SFSafariWindow?
                        var winIndex = 0
                        for win in wins {
                            if(tabMsg?.tab.windowId == winIndex) {
                                theWin = win
                                break
                            }
                            winIndex = winIndex + 1
                        }
                        if(theWin == nil) {
                            // TODO: error
                        } else {
                            var theTab: SFSafariTab?
                            theWin!.getAllTabs { (tabs) in
                                var tabIndex = 0
                                for tab in tabs {
                                    if(tabMsg?.tab.index == tabIndex) {
                                        theTab = tab
                                        break
                                    }
                                    tabIndex = tabIndex + 1
                                }
                                if(theTab == nil) {
                                    // TODO: error
                                } else {
                                    theTab!.getActivePage { (activePage) in
                                        if(activePage != nil) {
                                            activePage?.dispatchMessageToScript(withName: "bitwarden", userInfo: ["msg": tabMsg!.obj])
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    func replyMessage(message: AppMessage) {
        if(webView == nil) {
            return;
        }
        let json = (jsonSerialize(obj: message) ?? "null")
        webView.evaluateJavaScript("window.bitwardenSafariAppMessageReceiver(\(json));", completionHandler: nil)
    }
    
    func replyMessageFromScript(msg: [String : Any]?) {
        if(webView == nil) {
            return;
        }
        let newMsg = AppMessage()
        newMsg.command = "cs_message"
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: msg as Any, options: [])
            newMsg.data = String(data: jsonData, encoding: .utf8)
        } catch let error {
            print("error converting to json: \(error)")
        }
        replyMessage(message: newMsg)
    }
}

func processWindowsForTabs(wins: [SFSafariWindow], options: TabQueryOptions?, complete: @escaping ([Tab]) -> Void) {
    if(wins.count == 0) {
        complete([])
        return
    }
    var newTabs: [Tab] = []
    let winGroup = DispatchGroup()
    var windowIndex = 0
    for win in wins {
        winGroup.enter()
        win.getActiveTab { (activeTab) in
            win.getAllTabs { (allTabs) in
                let tabGroup = DispatchGroup()
                var tabIndex = 0
                for tab in allTabs {
                    tabGroup.enter()
                    if(options?.active ?? false) {
                        if(activeTab != nil && activeTab == tab) {
                            makeTabObject(tab: tab, activeTab: activeTab, windowIndex: windowIndex, tabIndex: tabIndex, complete: { (t) in
                                newTabs.append(t)
                                tabIndex = tabIndex + 1
                                tabGroup.leave()
                            })
                        } else {
                            tabIndex = tabIndex + 1
                            tabGroup.leave()
                        }
                    } else {
                        makeTabObject(tab: tab, activeTab: activeTab, windowIndex: windowIndex, tabIndex: tabIndex, complete: { (t) in
                            newTabs.append(t)
                            tabIndex = tabIndex + 1
                            tabGroup.leave()
                        })
                    }
                }
                tabGroup.notify(queue: .main){
                    windowIndex = windowIndex + 1
                    winGroup.leave()
                }
            }
        }
    }
    winGroup.notify(queue: .main){
        complete(newTabs)
    }
}

func makeTabObject(tab: SFSafariTab, activeTab: SFSafariTab?, windowIndex: Int, tabIndex: Int, complete: @escaping (Tab) -> Void) {
    let t = Tab()
    t.active = activeTab != nil && tab == activeTab
    t.windowId = windowIndex
    t.index = tabIndex
    t.id = "\(windowIndex)_\(tabIndex)"
    tab.getActivePage { (page) in
        if(page == nil) {
            complete(t)
        } else {
            page!.getPropertiesWithCompletionHandler({ (props) in
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
    if(json == nil) {
        return nil;
    }
    let decoder = JSONDecoder()
    do {
        let obj = try decoder.decode(T.self, from: json!.data(using: .utf8)!)
        return obj
    } catch _ {
        return nil
    }
}

class AppMessage : Decodable, Encodable {
    init() {
        id = ""
        command = ""
        data = nil
        responseData = nil
    }
    var id: String
    var command: String
    var data: String?
    var responseData: String?
}

class StorageData : Decodable, Encodable {
    var key: String
    var obj: String?
}

class TabQueryOptions : Decodable, Encodable {
    var currentWindow: Bool?
    var active: Bool?
}

class Tab : Decodable, Encodable {
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
