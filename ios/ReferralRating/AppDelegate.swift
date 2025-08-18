import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore
import GoogleMaps

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var splashWindow: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // get key from GoogleMapsApiKey.plist
    guard let path = Bundle.main.path(forResource: "GoogleMapsApiKey", ofType: "plist"),
          let dict = NSDictionary(contentsOfFile: path),
          let key = dict.object(forKey: "GMSApiKey") as? String else {
      print("ERROR: Could not find GoogleMapsApiKey.plist or GMSApiKey in the bundle")
      fatalError("GoogleMaps API key not found")
    }
    GMSServices.provideAPIKey(key)
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()
    reactNativeDelegate = delegate
    reactNativeFactory = factory
    
    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "ReferralRating",
      in: window,
      launchOptions: launchOptions
    )

    FirebaseApp.configure()
    SplashScreen.show()
    
    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
