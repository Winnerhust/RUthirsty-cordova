---
name: cordova-ios-build
description: Build and package Cordova applications as iOS installation packages. Use when user requests building a Cordova app for iOS, creating an iOS ipa file from Cordova project, packaging a Cordova app for App Store distribution, running Cordova iOS builds, or troubleshooting iOS build issues. Requires macOS with Xcode and Cordova CLI installed.
---

# Cordova iOS Build

## Quick Start

Build and package a Cordova iOS app:

```bash
# Check environment
python3 scripts/build_ios.py /workspaces/RUthirsty-cordova check

# Package as .ipa (debug)
python3 scripts/build_ios.py /workspaces/RUthirsty-cordova package

# Package as .ipa (release)
python3 scripts/build_ios.py /workspaces/RUthirsty-cordova package --release
```

## Workflow Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                    Build Cordova iOS App                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Check Environment  │
                    │ - Xcode installed? │
                    │ - Cordova CLI?     │
                    │ - iOS platform?    │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ iOS Platform Added? │
                    │     No → Add it    │
                    │     Yes → Continue │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Choose Destination  │
                    │ - iOS Simulator    │
                    │ - Physical Device  │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Build & Package  │
                    │   Generate .ipa    │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Output IPA Path   │
                    │   Build Location   │
                    └─────────────────────┘
```

## Step 1: Environment Check

Before building, verify the development environment:

```bash
python3 scripts/build_ios.py <project_path> check
```

Output format:
```json
{
  "xcode": {"installed": true, "version": "Xcode 15.0"},
  "cordova": {"installed": true, "version": "12.0.0"},
  "ios_platform": {"installed": true, "version": "7.0.1"},
  "node": {"installed": true, "version": "v18.17.0"}
}
```

**Required components:**
- Xcode (includes iOS SDK)
- Cordova CLI
- iOS platform added to project
- Node.js

**Installation (if missing):**
```bash
# Install Cordova
npm install -g cordova

# Add iOS platform
cordova platform add ios
```

## Step 2: List Available Schemes

```bash
python3 scripts/build_ios.py <project_path> schemes
```

Returns Xcode build schemes (e.g., "App name").

## Step 3: List Available Destinations

```bash
python3 scripts/build_ios.py <project_path> destinations
```

Returns available build targets (simulators and physical devices):
```json
[
  {
    "platform": "iOS Simulator",
    "id": "iPhone 15",
    "name": "iPhone 15"
  },
  {
    "platform": "iOS",
    "id": "00008030-001234567890012E",
    "name": "iPhone"
  }
]
```

## Step 4: Build iOS App

```bash
python3 scripts/build_ios.py <project_path> build
```

Options:
- Default: Debug build with default scheme
- Use scripts with parameters for custom configuration

## Step 5: Package as IPA

```bash
# Debug IPA
python3 scripts/build_ios.py <project_path> package

# Release IPA
python3 scripts/build_ios.py <project_path> package --release
```

Output:
```json
{
  "success": true,
  "ipa_path": "/workspaces/RUthirsty-cordova/build/ipa/AppName_debug.ipa",
  "app_path": ".../DerivedData/.../Debug-iphoneos/AppName.app",
  "size": 12345678,
  "size_mb": 11.78
}
```

## Step 6: Clean Build Artifacts

```bash
python3 scripts/build_ios.py <project_path> clean
```

Removes build directory and derived data.

## Direct Cordova Commands

For simple builds without packaging:

```bash
# Build for iOS
cordova build ios

# Build for iOS device
cordova build ios --device

# Run on iOS simulator
cordova run ios --emulator

# Run on connected iOS device
cordova run ios --device

# Open in Xcode
open platforms/ios/*.xcworkspace
```

## Using Xcode for Advanced Builds

For code signing and App Store distribution:

```bash
# Open Xcode project
open platforms/ios/*.xcworkspace
```

In Xcode:
1. Select your development team
2. Configure code signing
3. Choose scheme (App vs App Store)
4. Archive (Product → Archive)
5. Distribute App (Window → Organizer)

## Troubleshooting

### iOS platform not added
```bash
cordova platform add ios
```

### Build errors
1. Run `cordova clean ios`
2. Remove `platforms/ios` directory
3. Re-add platform: `cordova platform add ios`

### Code signing issues
- Use Xcode to configure signing
- Ensure valid Apple Developer account
- Check provisioning profiles

### Simulator build failing
```bash
# List available simulators
xcrun simctl list devices

# Run specific simulator
cordova run ios --target="iPhone 15"
```

## Resources

### scripts/build_ios.py
Python script that:
- Checks build environment
- Lists Xcode schemes and destinations
- Builds iOS application
- Packages .ipa file
- Cleans build artifacts

Execute without reading context:
```bash
python3 scripts/build_ios.py <project_path> <command>
```

Read for customization:
```bash
cat scripts/build_ios.py
```
