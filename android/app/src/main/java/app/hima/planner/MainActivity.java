package app.hima.planner;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.*;
import android.net.Uri;
import android.content.Intent;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.widget.Toast;
import android.util.Base64;
import java.io.*;
import java.util.*;

/** Offline-only shell. No network/storage permissions, no remote pages in the WebView. */
public final class MainActivity extends Activity {
 private static final String HOST="appassets.androidplatform.net";
 private WebView web;
 private ValueCallback<Uri[]> fileCallback;
 private File pendingExport;
 private final Map<String,File> exports=new HashMap<>();
 @Override public void onCreate(Bundle saved){super.onCreate(saved);
  for(File f:Objects.requireNonNull(getCacheDir().listFiles()))if(f.getName().startsWith("hima-export-"))f.delete();
  web=new WebView(this);setContentView(web);
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(true);s.setAllowFileAccessFromFileURLs(false);s.setAllowUniversalAccessFromFileURLs(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setSupportMultipleWindows(false);s.setJavaScriptCanOpenWindowsAutomatically(false);
  CookieManager.getInstance().setAcceptCookie(false);CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
  WebView.setWebContentsDebuggingEnabled(false);
  web.addJavascriptInterface(new DeviceBridge(),"HimaAndroid");
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest req){Uri u=req.getUrl();if(!"https".equals(u.getScheme())||!HOST.equals(u.getHost())||!"GET".equals(req.getMethod()))return blocked();String path=u.getPath();if(path==null||path.contains("..")||path.contains("\\"))return blocked();if(path.equals("/"))path="/index.html";if(!(path.equals("/index.html")||path.startsWith("/assets/")||path.matches("/(icon-(192|512)|apple-touch-icon)\\.png")||path.equals("/manifest.webmanifest")))return blocked();try{String mime=path.endsWith(".js")?"application/javascript":path.endsWith(".css")?"text/css":path.endsWith(".png")?"image/png":path.endsWith(".webmanifest")?"application/manifest+json":"text/html";return new WebResourceResponse(mime,"UTF-8",200,"OK",Collections.singletonMap("Cache-Control","no-store"),getAssets().open("web"+path));}catch(IOException e){return blocked();}}
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest req){Uri uri=req.getUrl();if("https".equals(uri.getScheme())&&HOST.equals(uri.getHost()))return false;if(req.isForMainFrame()&&("https".equals(uri.getScheme())||"http".equals(uri.getScheme()))){try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception e){toast("No browser available to open this link.");}}return true;}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> callback,FileChooserParams params){if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("*/*");try{startActivityForResult(intent,10);}catch(Exception e){fileCallback.onReceiveValue(null);fileCallback=null;toast("No file picker is available.");}return true;}
  });
  web.loadUrl("https://"+HOST+"/");
 }
 private WebResourceResponse blocked(){return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
 private void toast(String message){runOnUiThread(()->Toast.makeText(this,message,Toast.LENGTH_LONG).show());}
 public final class DeviceBridge {
  @JavascriptInterface public void copyText(String text){if(text==null||text.length()>2000000)return;runOnUiThread(()->{((ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("hima",text));toast("Copied");});}
  @JavascriptInterface public synchronized String beginExport(){if(!exports.isEmpty()||pendingExport!=null)throw new IllegalStateException("Finish the current download first.");String id=UUID.randomUUID().toString();File file=new File(getCacheDir(),"hima-export-"+id);exports.put(id,file);return id;}
  @JavascriptInterface public synchronized void appendExport(String id,String data)throws IOException{File file=exports.get(id);if(file==null||data.length()>70000)throw new IOException("Invalid download chunk");byte[] bytes=Base64.decode(data,Base64.DEFAULT);if(file.length()+bytes.length>160L*1024*1024)throw new IOException("Download too large");try(FileOutputStream out=new FileOutputStream(file,true)){out.write(bytes);}}
  @JavascriptInterface public synchronized void cancelExport(String id){File f=exports.remove(id);if(f!=null)f.delete();}
  @JavascriptInterface public synchronized void finishExport(String id,String name,String mime){File file=exports.remove(id);if(file==null)return;pendingExport=file;runOnUiThread(()->{Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType(mime!=null&&mime.matches("[a-zA-Z0-9.+-]+/[a-zA-Z0-9.+-]+")?mime:"application/octet-stream");intent.putExtra(Intent.EXTRA_TITLE,name.replaceAll("[/\\\\\\p{Cntrl}]","_").substring(0,Math.min(name.length(),180)));try{startActivityForResult(intent,11);}catch(Exception e){file.delete();pendingExport=null;toast("Could not open the save picker.");}});}
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==10&&fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK&&data!=null&&data.getData()!=null?new Uri[]{data.getData()}:null);fileCallback=null;}if(request==11){File file=pendingExport;pendingExport=null;if(file==null)return;if(result==RESULT_OK&&data!=null&&data.getData()!=null){Uri dest=data.getData();new Thread(()->{try(InputStream in=new FileInputStream(file);OutputStream out=getContentResolver().openOutputStream(dest)){if(out==null)throw new IOException();byte[] chunk=new byte[65536];int n;while((n=in.read(chunk))!=-1)out.write(chunk,0,n);toast("File saved");}catch(Exception e){toast("File could not be saved. Please try again.");}finally{file.delete();}}).start();}else file.delete();}}
 @Override public void onBackPressed(){web.evaluateJavascript("(()=>{const ds=[...document.querySelectorAll('dialog[open]')];const d=ds.at(-1);if(!d)return false;d.dispatchEvent(new Event('cancel',{cancelable:true}));return true;})()",result->{if(!"true".equals(result))super.onBackPressed();});}
}
