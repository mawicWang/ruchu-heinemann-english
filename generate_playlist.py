import os
import json
import urllib.parse
import sys
import argparse

AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.m4a'}
R2_BASE_URL = 'https://pub-bf941e18a2b946d588e85e7141c87b2c.r2.dev'
PLAYLIST_FILE = 'playlist.json'

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
        web_path_str = full_path.replace(os.sep, '/')

        # Prepare relative path for URL (remove leading ./)
        if web_path_str.startswith('./'):
            clean_path = web_path_str[2:]
        else:
            clean_path = web_path_str

        if os.path.isdir(full_path):
            children = scan_directory(full_path)
            # Add directory (even if empty, matching previous behavior)
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

def count_files(items):
    count = 0
    for item in items:
        if item.get('type') == 'file':
            count += 1
        elif item.get('type') == 'directory':
            count += count_files(item.get('children', []))
    return count

def main():
    parser = argparse.ArgumentParser(description='Generate playlist.json from local files.')
    parser.add_argument('--force', action='store_true', help='Force overwrite even if playlist becomes empty.')
    args = parser.parse_args()

    # Check existing playlist
    existing_count = 0
    if os.path.exists(PLAYLIST_FILE):
        try:
            with open(PLAYLIST_FILE, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
                existing_count = count_files(existing_data)
        except Exception:
            pass # Ignore if invalid json or error

    root_items = scan_directory('.')
    new_count = count_files(root_items)

    # Safety check
    if new_count == 0 and existing_count > 0 and not args.force:
        msg = f"WARNING: No local audio files found, but '{PLAYLIST_FILE}' currently contains {existing_count} files.\n" \
              f"Running this script will EMPTY your playlist.\n"

        if sys.stdin.isatty():
            print(msg)
            try:
                response = input("Do you want to continue? (y/N): ").strip().lower()
            except EOFError:
                response = 'n'

            if response != 'y':
                print("Operation cancelled. Playlist was not updated.")
                return
        else:
            print(msg + "Aborting. Use --force to override.")
            sys.exit(1)

    with open(PLAYLIST_FILE, 'w', encoding='utf-8') as f:
        json.dump(root_items, f, ensure_ascii=False, indent=2)
    print(f"playlist.json generated successfully with {new_count} files.")

if __name__ == '__main__':
    main()
