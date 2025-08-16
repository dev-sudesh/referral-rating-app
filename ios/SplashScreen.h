#import <React/RCTBridgeModule.h>

@interface SplashScreen : NSObject <RCTBridgeModule>

+ (void)show;
+ (void)hide;

@end

@interface RCT_EXTERN_MODULE(SplashScreen, NSObject)

RCT_EXTERN_METHOD(show)
RCT_EXTERN_METHOD(hide)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end 
