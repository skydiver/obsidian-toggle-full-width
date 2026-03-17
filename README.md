# Toggle Full Width

An Obsidian plugin that lets you toggle any note between readable line length and full viewport width with a single click.

## Usage

1. Enable "Readable line length" in Obsidian Settings → Editor
2. Open any note
3. Toggle full width using one of:
   - **Command palette:** Search for "Toggle full width"
   - **Status bar:** Click the width indicator in the bottom-right corner
   - **Hotkey:** Assign a custom hotkey in Settings → Hotkeys

The plugin adds `full-width` to the note's `cssclasses` frontmatter property. This means:

- The setting persists across sessions
- It works even if you disable the plugin (as long as you keep the CSS)
- You can also add `full-width` manually to any note's frontmatter

## How it works

The plugin ships a CSS rule that sets `--file-line-width: 100%` on notes with the `full-width` class. When you toggle, it adds or removes this class from the note's frontmatter.

## Requirements

- Obsidian v1.4.0 or later
- "Readable line length" must be enabled (Settings → Editor)

## Installation

### From Community Plugins

1. Open Settings → Community plugins → Browse
2. Search for "Toggle Full Width"
3. Click Install, then Enable

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder `.obsidian/plugins/toggle-full-width/` in your vault
3. Copy the three files into that folder
4. Enable the plugin in Settings → Community plugins
