//
//  SafariExtensionViewController.swift
//  safari
//
//  Created by Kyle Spearrin on 8/1/19.
//  Copyright © 2019 8bit Solutions LLC. All rights reserved.
//

import SafariServices

class SafariExtensionViewController: SFSafariExtensionViewController {
    
    static let shared: SafariExtensionViewController = {
        let shared = SafariExtensionViewController()
        shared.preferredContentSize = NSSize(width:320, height:240)
        return shared
    }()

}
