"""
ReactionFusion Extension Packaging Utility
Packages the Chrome/Edge extension into a standalone ZIP file ready to share with testers.
"""

import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLUGIN_DIR = ROOT / "platform/plugin"
OUTPUT_DIR = ROOT / "outputs"
ZIP_NAME = "ReactionFusion-Facebook-Extension.zip"

README_TEXT = """======================================================================
  REACTIONFUSION: FACEBOOK SINHALA SENTIMENT AI EXTENSION
======================================================================

HOW TO INSTALL & TEST IN GOOGLE CHROME / MICROSOFT EDGE:

1. EXTRACT THIS ZIP ARCHIVE:
   - Extract the contents of this ZIP file to a folder on your computer
     (e.g., C:\\ReactionFusion-Extension or ~/ReactionFusion-Extension).

2. OPEN EXTENSION MANAGER IN YOUR BROWSER:
   - In Google Chrome: Open a new tab and go to:  chrome://extensions/
   - In Microsoft Edge: Open a new tab and go to: edge://extensions/

3. ENABLE DEVELOPER MODE:
   - Toggle the "Developer mode" switch ON (in the top-right corner).

4. LOAD THE EXTENSION:
   - Click the "Load unpacked" button (top-left).
   - Select the folder where you extracted these files (the folder containing manifest.json).
   - You will see the "ReactionFusion: Facebook Sinhala Sentiment AI" card appear!

5. CONFIGURE BACKEND API SERVER:
   - Click the ReactionFusion icon in your browser toolbar.
   - By default, it connects to: http://127.0.0.1:8000
   - If testing with a remote or hosted server, type your server URL in the
     "Backend API Server" box and click "Save".
   - Verify that the status badge shows "API Online" (green).

6. TEST ON FACEBOOK:
   - Go to https://www.facebook.com
   - Scroll to any post with Sinhala comments.
   - The "Audience Pulse" badge will automatically appear over the post,
     analyzing the post's comments fused with the post's reaction distribution!

======================================================================
"""

def package():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = OUTPUT_DIR / ZIP_NAME

    print("=" * 60)
    print("  PACKAGING REACTIONFUSION EXTENSION")
    print("=" * 60)
    print(f"Source Directory: {PLUGIN_DIR}")
    print(f"Target ZIP:       {zip_path}\n")

    files_to_pack = [
        "manifest.json",
        "background.js",
        "scripts/content.js",
        "scripts/styles.css",
        "popup/popup.html",
        "popup/popup.css",
        "popup/popup.js",
        "icons/icon16.png",
        "icons/icon48.png",
        "icons/icon128.png",
    ]

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add instruction file
        zf.writestr("README_TESTER_GUIDE.txt", README_TEXT)
        print("  + Added README_TESTER_GUIDE.txt")

        for rel_file in files_to_pack:
            file_path = PLUGIN_DIR / rel_file
            if file_path.exists():
                zf.write(file_path, arcname=rel_file)
                print(f"  + Added {rel_file}")
            else:
                print(f"  ! Warning: {rel_file} not found")

    print("\n" + "=" * 60)
    print(f"SUCCESS! Extension packaged successfully.")
    print(f"ZIP File Location: {zip_path}")
    print(f"File Size:         {zip_path.stat().st_size:,} bytes")
    print("=" * 60)

if __name__ == "__main__":
    package()
