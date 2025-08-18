import Foundation
import React

// MARK: - SplashScreen Class
@objc(SplashScreen)
class SplashScreen: NSObject {
    
    // Static properties to manage splash screen state
    private static var waiting = true
    private static var addedJsLoadErrorObserver = false
    private static var loadingView: UIView?
    
    // Required for RCTBridgeModule
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // MARK: - Public Methods
    
    /// Shows the splash screen and waits until hide is called
    @objc
    class func show() {
        // Add JavaScript load error observer if not already added
        if !addedJsLoadErrorObserver {
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(jsLoadError),
                name: NSNotification.Name("RCTJavaScriptDidFailToLoadNotification"),
                object: nil
            )
            addedJsLoadErrorObserver = true
        }
        
        // Wait until hide is called
        while waiting {
            RunLoop.main.run(until: Date(timeIntervalSinceNow: 0.1))
        }
    }
    
    /// Hides the splash screen
    @objc
    class func hide() {
        if waiting {
            DispatchQueue.main.async {
                waiting = false
            }
        } else {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                loadingView?.removeFromSuperview()
            }
        }
    }
    
    // MARK: - Private Methods
    
    /// Handles JavaScript load errors
    @objc
    private class func jsLoadError(_ notification: Notification) {
        // If there was an error loading javascript, hide the splash screen
        // Otherwise the splash screen will remain forever, which is a hassle to debug
        hide()
    }
    
    // MARK: - React Native Methods
    
    /// Exposed method to hide splash screen from React Native
    @objc
    func hide() {
        SplashScreen.hide()
    }
    
    /// Exposed method to show splash screen from React Native
    @objc
    func show() {
        SplashScreen.show()
    }
}
