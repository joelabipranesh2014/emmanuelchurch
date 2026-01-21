#!/bin/bash
# Firebase Admin SDK Credentials Setup Script
# This script helps you set up Firebase Admin SDK credentials for local development

echo ""
echo "🔥 Firebase Admin SDK Credentials Setup"
echo ""

echo "To use Firebase Admin SDK, you need a service account key file."
echo ""
echo "Follow these steps:"
echo ""
echo "1. Go to Firebase Console:"
echo "   https://console.firebase.google.com/"
echo ""
echo "2. Select your project: emmanuel-church-e7274"
echo ""
echo "3. Go to Project Settings → Service Accounts"
echo ""
echo "4. Click 'Generate New Private Key'"
echo ""
echo "5. Save the JSON file (e.g., as 'service-account-key.json')"
echo ""
read -p "6. Enter the full path to your service account key file: " keyPath

if [ -f "$keyPath" ]; then
    # Set environment variable for current session
    export GOOGLE_APPLICATION_CREDENTIALS="$keyPath"
    echo ""
    echo "✅ Environment variable set for current session!"
    echo "   GOOGLE_APPLICATION_CREDENTIALS = $keyPath"
    echo ""
    echo "⚠️  Note: This setting is only for the current shell session."
    echo "   To make it permanent, add this to your ~/.bashrc or ~/.zshrc:"
    echo "   export GOOGLE_APPLICATION_CREDENTIALS=\"$keyPath\""
    echo ""
    echo "🚀 You can now restart your dev server (npm run dev)"
else
    echo ""
    echo "❌ File not found: $keyPath"
    echo "   Please check the path and try again."
fi

echo ""

