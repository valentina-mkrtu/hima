# Android test shell

Lightweight Android Activity with a WebView serving only bundled assets from a reserved HTTPS origin. Remote content is blocked; external HTTP(S) links open in the system browser. No INTERNET/storage permissions, cloud backup disabled, WebView debugging disabled. Native bridge is confined to a WebView that never loads remote pages and provides clipboard and bounded chunked exports through ACTION_CREATE_DOCUMENT. File inputs use ACTION_OPEN_DOCUMENT.

Build from the project root:

    npm run build
    python3 scripts/build-android.py

Requires installed Android SDK platform 34, build-tools 37.0.0 and a JDK. Override ANDROID_SDK_ROOT/HIMA_JAVA_HOME for other locations. Test signing key is generated under .runtime/android-signing and must be retained locally for compatible updates. It is not a production signing setup; do not publish the key. The APK contains no user workspace data. See downloads/ANDROID-TESTING.md for limitations.
