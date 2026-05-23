#!/bin/bash

VERSION=$1
BUILD=$2

echo "Updating to version $VERSION ($BUILD)"

# app.json
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" app.json
sed -i '' "s/\"versionCode\": [0-9]*/\"versionCode\": $BUILD/" app.json
sed -i '' "s/\"buildNumber\": \".*\"/\"buildNumber\": \"$BUILD\"/" app.json

# iOS plist
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" ios/SproutDiary/Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD" ios/SproutDiary/Info.plist

echo "Done."