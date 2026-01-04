import os
import json
import urllib.parse

AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.m4a'}
R2_BASE_URL = 'https://pub-bf941e18a2b946d588e85e7141c87b2c.r2.dev'

def scan_directory(path):
    entries = []
    try:
        items = sorted(os.listdir(path))
    except OSError:
        return []

    for item in items:
        if item.startswith('.'):
            continue

        full_path = os.path.join(path, item)
        # Normalize path for web use (force forward slashes)
        # This ensures it works if script is run on Windows
        web_path_str = full_path.replace(os.sep, '/')

        # Prepare relative path for URL (remove leading ./)
        if web_path_str.startswith('./'):
            clean_path = web_path_str[2:]
        else:
            clean_path = web_path_str

        if os.path.isdir(full_path):
            children = scan_directory(full_path)
            # Only add directory if it has children or if we want to show empty dirs
            entries.append({
                "name": item,
                "type": "directory",
                "path": urllib.parse.quote(web_path_str),
                "children": children
            })
        elif os.path.isfile(full_path):
            ext = os.path.splitext(item)[1].lower()
            if ext in AUDIO_EXTENSIONS:
                # Construct R2 URL
                url_path = urllib.parse.quote(clean_path)
                full_url = f"{R2_BASE_URL}/{url_path}"

                entries.append({
                    "name": item,
                    "type": "file",
                    "path": full_url
                })

    return entries

def main():
    root_items = scan_directory('.')
    with open('playlist.json', 'w', encoding='utf-8') as f:
        json.dump(root_items, f, ensure_ascii=False, indent=2)
    print("playlist.json generated successfully.")

if __name__ == '__main__':
    main()
