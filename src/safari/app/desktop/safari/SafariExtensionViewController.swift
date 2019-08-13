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
        webViewConfig.preferences.setValue(true, forKey: "developerExtrasEnabled")
        webViewConfig.userContentController.add(self, name: "bitwardenApp")
        webView = WKWebView(frame: CGRect(x: 0, y: 0, width: parentWidth, height: parentHeight), configuration: webViewConfig)
        webView.navigationDelegate = self
        webView.allowsLinkPreview = false
        webView.loadFileURL(html, allowingReadAccessTo:bundleURL)
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
                let command = m?.command ?? "\"null\""
                print(command)
                replyMessage(message: m!)
            }
        }
    }
    
    func replyMessage(message: AppMessage) {
        let json = jsonSerialize(obj: message) ?? "\"null\""
        webView.evaluateJavaScript("bitwardenSafariAppMessageReceiver('\(json)');", completionHandler: nil)
    }

}

func jsonSerialize<T: Encodable>(obj: T) -> String? {
    let encoder = JSONEncoder()
    encoder.outputFormatting = .prettyPrinted
    do {
        let data = try encoder.encode(obj)
        return String(data: data, encoding: .utf8)!
    } catch _ {
        return nil
    }
}

func jsonDeserialize<T: Decodable>(json: String) -> T? {
    let decoder = JSONDecoder()
    do {
        let obj = try decoder.decode(T.self, from: json.data(using: .utf8)!)
        return obj
    } catch _ {
        return nil
    }
}

class AppMessage : Decodable, Encodable {
    var id: String
    var command: String
    var data: String
}
