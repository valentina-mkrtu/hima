#!/usr/bin/env python3
"""Build a small offline APK with installed Android SDK tools (no Gradle downloads)."""
from pathlib import Path
import subprocess, shutil, zipfile, os
root=Path(__file__).resolve().parent.parent
sdk=Path(os.environ.get('ANDROID_SDK_ROOT',str(Path.home()/'Library/Android/sdk')))
jdk=Path(os.environ.get('HIMA_JAVA_HOME','/Applications/Android Studio.app/Contents/jbr/Contents/Home'))
tools=sdk/'build-tools/37.0.0'; platform=sdk/'platforms/android-34/android.jar'
build=root/'android/build';build.mkdir(parents=True,exist_ok=True)
assets=root/'android/app/src/main/assets/web'
if assets.exists():shutil.rmtree(assets)
shutil.copytree(root/'dist/web',assets)
# Only bundled app resources are available to the native shell. No network policy.
html=assets/'index.html';text=html.read_text();start=text.index('<meta http-equiv="Content-Security-Policy"');end=text.index('>',start)+1
text=text[:start]+'''<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; font-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">'''+text[end:];html.write_text(text)
def run(*args):subprocess.run([str(a) for a in args],check=True,env={**os.environ,'JAVA_HOME':str(jdk)})
run(tools/'aapt2','compile','--dir',root/'android/app/src/main/res','-o',build/'resources.zip')
run(tools/'aapt2','link','-o',build/'base.apk','-I',platform,'--manifest',root/'android/app/src/main/AndroidManifest.xml','-A',root/'android/app/src/main/assets',build/'resources.zip')
classes=build/'classes';classes.mkdir(exist_ok=True)
run(jdk/'bin/javac','--release','8','-g','-classpath',platform,'-d',classes,*list((root/'android/app/src/main/java').rglob('*.java')))
run(jdk/'bin/jar','cf',build/'classes.jar','-C',classes,'.')
run(tools/'d8','--lib',platform,'--min-api','26','--output',build,build/'classes.jar')
with zipfile.ZipFile(build/'base.apk','a',zipfile.ZIP_DEFLATED) as archive:archive.write(build/'classes.dex','classes.dex')
run(tools/'zipalign','-f','4',build/'base.apk',build/'aligned.apk')
keys=root/'.runtime/android-signing';keys.mkdir(parents=True,exist_ok=True);key=keys/'hima-test.jks'
if not key.exists():run(jdk/'bin/keytool','-genkeypair','-keystore',key,'-storepass','android','-keypass','android','-alias','hima-test','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=hima local testing, O=hima, C=AM')
os.chmod(key,0o600)
output=root/'downloads/hima-0.3.3-test.apk'
run(tools/'apksigner','sign','--ks',key,'--ks-key-alias','hima-test','--ks-pass','pass:android','--key-pass','pass:android','--out',output,build/'aligned.apk')
run(tools/'apksigner','verify','--verbose',output)
print(f'APK: {output} ({output.stat().st_size/1024/1024:.2f} MB)')
