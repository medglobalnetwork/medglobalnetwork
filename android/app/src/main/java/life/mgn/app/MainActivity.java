package life.mgn.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebSettings settings = this.bridge.getWebView().getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setSupportMultipleWindows(false);

            // Clean User Agent to standard mobile Chrome format so Google OAuth works seamlessly in-app
            String defaultUa = settings.getUserAgentString();
            if (defaultUa != null) {
                String cleanUa = defaultUa.replaceAll(";\\s*wv", "").replaceAll("Version/[0-9.]+\\s*", "");
                settings.setUserAgentString(cleanUa);
            }

            // Ensure cookies & 3rd-party auth cookies are accepted and persisted
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(this.bridge.getWebView(), true);
            // Flush cookies immediately so any Set-Cookie from the initial load is persisted
            cookieManager.flush();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Flush cookies whenever the app comes to foreground — ensures session cookies
        // set by fetch() are written to disk before the next page navigation reads them.
        CookieManager.getInstance().flush();
    }
}

