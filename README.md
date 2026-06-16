# Myprogramm 📚

**Documentation & Game Mechanics Manager** - A powerful Single Page Application for organizing wiki, notes, tasks, mechanics, and relationships for game development and documentation projects.

## Features

### 📖 Wiki
- Hierarchical folder structure for organizing documentation
- Rich text editor with formatting (bold, italic, underline)
- Support for images with automatic compression (JPEG, 70% quality, max 1024x1024px)
- Color-coded folders for quick visual identification
- Automatic saving to local file system

### 📝 Notes
- Theme-based note organization
- Rich text editor with formatting tools
- Image support
- Quick preview in sidebar

### 📋 Tasks (Kanban Board)
- Drag-and-drop columns and cards
- Customizable column colors
- Task descriptions and optional images/links
- Real-time synchronization

### ⚙️ Game Mechanics
- Similar Kanban board for organizing game mechanics
- Independent from tasks
- Color-coded columns
- Item descriptions

### 🔗 Relations Graph
- Visual representation of object relationships
- Connection types: Soft reference, Cast, Relation
- Connection reasons: Give info, Ask info, Answer, Other
- Color-coded connections
- Visibility toggle for focused viewing

### 🎨 Hamaynk (Settings)
- Project directory selection
- Global text size adjustment
- Light/Dark theme toggle
- Project management

### 📁 Assets Manager
- Image gallery with metadata
- Relation audit trail
- Search and sorting capabilities

## Technical Stack

- **Language**: Vanilla JavaScript (ES6+)
- **API**: File System Access API (showDirectoryPicker)
- **Storage**: Local file system + IndexedDB for handles
- **Styling**: CSS3 with CSS Variables
- **Architecture**: Modular, no build process required

## Getting Started

### Prerequisites
- Modern web browser with File System Access API support (Chrome, Edge, Brave, Opera)
- Local file system access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rorosos/Myprogramm.git
cd Myprogramm
```

2. Open `index.html` in your web browser

3. Select a project directory when prompted

### Usage

#### First Time Setup
1. Click the folder icon in the top-right corner or wait for the welcome screen
2. Select a directory where you want to store your project files
3. All data will be automatically saved to `project.json` in this directory
4. Images are saved in an `images` subdirectory

#### Creating Content

**Wiki Folders:**
- Click "+ New Folder" in the sidebar
- Use the color box to customize folder color
- Write content in the rich text editor
- Images are automatically compressed before saving

**Notes:**
- Click the "+" button to create a new note
- Edit title and content
- Content is auto-saved

**Tasks/Mechanics:**
- Click "+ Create Column" to add columns
- Click "+" in column header to add cards
- Drag cards and columns to reorganize

**Relations:**
- Create objects and define connections
- Color-coded by connection reason
- Different line styles for connection types

## Data Storage

All data is stored in a single `project.json` file in your selected directory:

```json
{
  "version": "1.0",
  "createdAt": "2026-06-16T...",
  "settings": {
    "themeDark": false,
    "textSizeMultiplier": 1
  },
  "wiki": { "folders": [...] },
  "notes": { "themes": [...] },
  "tasks": { "columns": [...] },
  "mechanics": { "columns": [...] },
  "relations": { "objects": [...], "connections": [...] }
}
```

Directory handles are cached in IndexedDB for automatic directory recovery on next session.

## Image Compression

All uploaded images are automatically:
1. Converted to JPEG format
2. Compressed to 70% quality
3. Resized if larger than 1024px (aspect ratio maintained)
4. Saved to `images/` subdirectory

## Keyboard Shortcuts (Planned)

- `Ctrl+S` / `Cmd+S` - Force save
- `Ctrl+B` - Bold text
- `Ctrl+I` - Italic text
- `Ctrl+U` - Underline text

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ | v100+ |
| Edge | ✅ | v100+ |
| Firefox | ❌ | No File System Access API |
| Safari | ❌ | No File System Access API |
| Opera | ✅ | Recent versions |
| Brave | ✅ | Recent versions |

## Roadmap

- [ ] Advanced relation graph with canvas rendering
- [ ] Drag-and-drop image insertion
- [ ] Full-text search across all tabs
- [ ] Export to Markdown/PDF
- [ ] Collaborative editing (planned)
- [ ] Custom relation type icons
- [ ] Backup and restore functionality
- [ ] Plugin system

## Performance Tips

1. **Large Projects**: Keep wiki folders under 50 levels deep
2. **Images**: Pre-compress large images before uploading
3. **Browser Cache**: Clear cache if experiencing issues
4. **Multiple Projects**: Use different directories for different projects

## Troubleshooting

### Directory access lost
- Select the directory again using the settings tab
- Previous auto-save handle may have expired

### Images not showing
- Check browser permissions for file system access
- Ensure images directory exists in selected folder

### Data not saving
- Verify write permissions for selected directory
- Check browser console for errors
- Try refreshing the page

## Development

### Project Structure
```
Myprogramm/
├── index.html           # Main HTML file
├── styles/              # CSS stylesheets
│   ├── main.css         # Global styles
│   ├── layout.css       # Layout and layout
│   ├── wiki.css         # Wiki styles
│   ├── notes.css        # Notes styles
│   ├── tasks.css        # Tasks/Kanban styles
│   ├── mechanics.css    # Mechanics styles
│   ├── relations.css    # Relations graph styles
│   └── settings.css     # Settings styles
├── js/                  # JavaScript modules
│   ├── app.js           # Main application
│   ├── storage.js       # File system handling
│   ├── state.js         # State management
│   ├── ui.js            # UI utilities
│   ├── editor.js        # Rich text editor
│   ├── image-processor.js # Image compression
│   ├── wiki.js          # Wiki functionality
│   ├── notes.js         # Notes functionality
│   ├── tasks.js         # Tasks/Kanban
│   ├── mechanics.js     # Mechanics/Kanban
│   ├── relations.js     # Relations graph
│   └── settings.js      # Settings/Hamaynk
└── README.md            # This file
```

### Architecture

- **No Build Process**: Pure Vanilla JS, load directly in browser
- **Module Pattern**: Each feature is self-contained
- **State Management**: Simple observer pattern
- **Auto-Save**: Changes are saved immediately to filesystem

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal and commercial purposes

## Support

For issues, feature requests, or questions:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include browser/OS information when reporting bugs

## Author

Created by **Rorosos**

---

**Tip**: Use Myprogramm for game design documentation, project management, knowledge base building, and creative writing organization!
