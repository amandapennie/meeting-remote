package com.meetingremote;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.apsl.versionnumber.RNVersionNumberPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import it.innove.BleManagerPackage;
import io.sentry.RNSentryPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.charlires.segmentanalytics.SegmentAnalyticsPackage;
import com.polidea.reactnativeble.BlePackage;
import com.geniem.rnble.RNBLEPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNVersionNumberPackage(),
            new VectorIconsPackage(),
            new BleManagerPackage(),
            new RNSentryPackage(),
            new LinearGradientPackage(),
            new RNDeviceInfo(),
            new SegmentAnalyticsPackage(),
            new BlePackage(),
            new RNBLEPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
