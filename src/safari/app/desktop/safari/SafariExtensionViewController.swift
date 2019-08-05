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
        webViewConfig.userContentController.add(self, name: "bitwardenMessage")
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
        if message.name == "bitwardenMessage" {
            
        }
    }

}
