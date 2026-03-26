package in.monetra.app;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebView;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Match WebView background to app's light background (#FAFAFA)
    // This eliminates the white flash before the web content loads
    WebView webView = getBridge().getWebView();
    webView.setBackgroundColor(Color.parseColor("#FAFAFA"));

    // Disable Android's blue overscroll glow — not appropriate for a finance app
    webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);

    // Hardware-accelerate the WebView for smooth animations
    webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
  }
}
