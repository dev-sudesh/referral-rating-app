package com.referralrating.native_module

import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SplashScreenModule(reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "SplashScreen"
    }

    @ReactMethod
    fun show() {
        SplashScreen.show(reactApplicationContext.currentActivity)
    }

    @ReactMethod
    fun hide() {
        SplashScreen.hide(reactApplicationContext.currentActivity)
    }
}