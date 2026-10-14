# hima Android test build

File: hima-0.3.0-test.apk
Requires Android 8.0+ and an up-to-date Android System WebView/Chrome.

## Install
1. Transfer the APK to your Android phone (USB or a file-sharing service you choose).
2. Open it from Files/Downloads. If prompted, allow that file app to install unknown apps, then install hima. You can disable that permission afterward.
3. Open hima and choose Open my local workspace.

This is a signed personal test build, not a Play Store release. Both testers can use the same APK; their workspaces are separate. No personal planner data is bundled.

## Bring existing plans
On the computer, use Your space → Settings → Download complete backup. Transfer that JSON file privately to your phone. In the Android app, open Settings → Choose backup to restore. Restoring replaces the phone workspace. Backups are not encrypted.

## Included
Bundled offline planner, local IndexedDB persistence, tasks/notes/goals/routines/events, profile/appearance, file selection, native save-file picker for backups/exports/attachments, native clipboard for the AI prompt, and Android Back dismissing the current dialog. Local profile images are resized to 256 pixels. The app requests no Internet or broad storage permissions; selected documents use Android's file picker.

## Limits and testing status
Google Calendar connection is unavailable in this APK: the current Google web OAuth client cannot authorize inside an embedded WebView. Native Android authorization needs a separate implementation and Cloud configuration. There is no background sync or closed-app reminder service.

Web build and 27 automated data/domain tests pass. APK signature, manifest and packaged assets were verified. Installation and behavior on an actual Android device have not yet been verified. Test task creation/reopen, drag/drop, checklist completion, attachments, backup/restore and profile photo selection before relying on it.

Keep backups. Uninstalling or clearing Android app data removes the local planner. Future APK updates must keep package ID app.hima.planner and the same signing key to retain data; do not uninstall to update.
