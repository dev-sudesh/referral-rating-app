import Foundation
import React
import UIKit

// MARK: - SplashScreen Class
@objc(SplashScreen)
class SplashScreen: NSObject, RCTBridgeModule {
    
    // Static properties to manage splash screen state
    private static var isVisible = false
    private static var addedJsLoadErrorObserver = false
    private static var splashWindow: UIWindow?
    
    // Required for RCTBridgeModule
    static func moduleName() -> String! {
        return "SplashScreen"
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // MARK: - Public Methods
    
    /// Shows the splash screen
    @objc
    class func show() {
        DispatchQueue.main.async {
            guard !isVisible else { return }
            
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
            
            // Create launch screen from storyboard
            let storyboard = UIStoryboard(name: "LaunchScreen", bundle: nil)
            guard let launchViewController = storyboard.instantiateInitialViewController() else {
                print("SplashScreen: Could not load LaunchScreen.storyboard")
                return
            }
            
            // Create a new window to display the splash screen
            splashWindow = UIWindow(frame: UIScreen.main.bounds)
            splashWindow?.windowLevel = UIWindow.Level.normal + 1
            splashWindow?.rootViewController = launchViewController
            splashWindow?.makeKeyAndVisible()
            
            isVisible = true
            print("SplashScreen: Splash screen is now visible")
        }
    }
    
    /// Hides the splash screen
    @objc
    class func hide() {
        DispatchQueue.main.async {
            guard isVisible, let window = splashWindow else { 
                print("SplashScreen: No splash screen to hide")
                return 
            }
            
            UIView.animate(withDuration: 0.3, animations: {
                window.alpha = 0
            }) { _ in
                window.isHidden = true
                window.rootViewController = nil
                splashWindow = nil
                isVisible = false
                print("SplashScreen: Splash screen hidden")
            }
        }
    }
    
    // MARK: - Private Methods
    
    /// Handles JavaScript load errors
    @objc
    private class func jsLoadError(_ notification: Notification) {
        print("SplashScreen: JavaScript load error detected, hiding splash screen")
        hide()
    }
    
    // MARK: - React Native Methods
    
    /// Exposed method to hide splash screen from React Native
    @objc
    func hide() {
        print("SplashScreen: Hide called from React Native")
        SplashScreen.hide()
    }
    
    /// Exposed method to show splash screen from React Native
    @objc
    func show() {
        print("SplashScreen: Show called from React Native")
        SplashScreen.show()
    }
}