# VetLink Mobile (Flutter)

This Flutter app is a mobile client for the existing VetLink backend and frontend.

## What is implemented

- Login screen that matches the web style (green/blue VetLink palette)
- Role selector (`farmer`, `veterinarian`, `cahw`, `admin`)
- JWT token persistence using `shared_preferences`
- Role-based dashboard title and user profile summary
- Real backend calls:
  - `POST /api/auth/login`
  - `GET /api/cases`
  - `GET /api/animals`
- Pull-to-refresh and logout

## Run with your backend

The app reads API base URL from a Dart define named `API_BASE`.

### USB phone run command

```bash
flutter run -d <deviceId> --dart-define=API_BASE=http://<YOUR_PC_LAN_IP>:8080/api
```

Example:

```bash
flutter run -d R58N12345AB --dart-define=API_BASE=http://192.168.1.80:8080/api
```

## Important

- `localhost` inside phone means the phone itself, not your PC.
- Your backend must allow your phone origin/network and run on `0.0.0.0:8080`.
- Phone and PC must be on the same Wi-Fi/LAN.

## Android setup without Android Studio

You still need Android SDK + ADB (platform-tools + build-tools + platform APIs).
Install Android command-line tools and configure:

1. Download Android command line tools from Google
2. Install to a path like `C:\Android\Sdk`
3. Set environment variables:
   - `ANDROID_SDK_ROOT=C:\Android\Sdk`
   - Add to PATH:
     - `C:\Android\Sdk\platform-tools`
     - `C:\Android\Sdk\cmdline-tools\latest\bin`
4. Install required packages:
   - `sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"`
5. Accept licenses:
   - `flutter doctor --android-licenses`

Then verify:

```bash
flutter doctor -v
flutter devices
adb devices
```
