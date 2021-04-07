import SafariServices
import os.log
import LocalAuthentication

let SFExtensionMessageKey = "message"
let ServiceName = "Bitwarden"

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

	func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems[0] as! NSExtensionItem
        let message = item.userInfo?[SFExtensionMessageKey] as AnyObject?
        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@", message as! CVarArg)

        let response = NSExtensionItem()
        
        guard let command = message?["command"] as? String else {
            return
        }
        
        switch (command) {
        case "readFromClipboard":
            let pasteboard = NSPasteboard.general
            response.userInfo = [ SFExtensionMessageKey: pasteboard.pasteboardItems?.first?.string(forType: .string) as Any ]
            break
        case "copyToClipboard":
            guard let msg = message?["data"] as? String else {
                return
            }
            let pasteboard = NSPasteboard.general
            pasteboard.clearContents()
            pasteboard.setString(msg, forType: .string)
        case "showPopover":
            SFSafariApplication.getActiveWindow { win in
                win?.getToolbarItem(completionHandler: { item in
                    item?.showPopover()
                })
            }
            break
        case "downloadFile":
            guard let jsonData = message?["data"] as? String else {
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
            panel.isFloatingPanel = true
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
            break
        case "sleep":
            DispatchQueue.main.asyncAfter(deadline: .now() + 10) {
                context.completeRequest(returningItems: [response], completionHandler: nil)
            }
            return
        case "biometricUnlock":
            
            var error: NSError?
            let laContext = LAContext()
            
            guard laContext.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
                response.userInfo = [
                    SFExtensionMessageKey: [
                        "message": [
                            "command": "biometricUnlock",
                            "response": "not supported",
                            "timestamp": Int64(NSDate().timeIntervalSince1970 * 1000),
                        ],
                    ],
                ]
                break;
            }

            laContext.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "Bitwarden Safari Extension") { (success, error) in
                if success {
                    let passwordName = "key"
                    var passwordLength: UInt32 = 0
                    var passwordPtr: UnsafeMutableRawPointer? = nil
                    
                    let status = SecKeychainFindGenericPassword(nil, UInt32(ServiceName.utf8.count), ServiceName, UInt32(passwordName.utf8.count), passwordName, &passwordLength, &passwordPtr, nil)
                    
                    if status == errSecSuccess {
                        let result = NSString(bytes: passwordPtr!, length: Int(passwordLength), encoding: String.Encoding.utf8.rawValue) as String?
                                    SecKeychainItemFreeContent(nil, passwordPtr)
                        
                        response.userInfo = [ SFExtensionMessageKey: [
                            "message": [
                                "command": "biometricUnlock",
                                "response": "unlocked",
                                "timestamp": Int64(NSDate().timeIntervalSince1970 * 1000),
                                "keyB64": result!.replacingOccurrences(of: "\"", with: ""),
                            ],
                        ]]
                    } else {
                        response.userInfo = [
                            SFExtensionMessageKey: [
                                "message": [
                                    "command": "biometricUnlock",
                                    "response": "not enabled",
                                    "timestamp": Int64(NSDate().timeIntervalSince1970 * 1000),
                                ],
                            ],
                        ]
                    }
                }
                
                context.completeRequest(returningItems: [response], completionHandler: nil)
            }
            
            return;
        default:
            return
        }

        context.completeRequest(returningItems: [response], completionHandler: nil)
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

class DownloadFileMessage: Decodable, Encodable {
    var fileName: String
    var blobData: String?
    var blobOptions: DownloadFileMessageBlobOptions?
}

class DownloadFileMessageBlobOptions: Decodable, Encodable {
    var type: String?
}
