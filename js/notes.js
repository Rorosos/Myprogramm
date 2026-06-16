// Notes module - handles note management

class Notes {
  static init() {
    this.setupEventListeners();
    this.renderNotesList();
  }

  static setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.add-note-btn')) {
        this.createNewNote();
      }
      if (e.target.matches('[data-action="note-item"]')) {
        this.selectNote(e.target.closest('.note-list-item'));
      }
    });
  }

  static renderNotesList() {
    const sidebarContent = document.getElementById('sidebarContent');
    sidebarContent.innerHTML = '';
    
    const data = storage.projectData;
    if (!data || !data.notes) return;
    
    const header = document.createElement('div');
    header.className = 'notes-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Notes';
    title.style.margin = '0';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.className = 'add-note-btn';
    addBtn.style.cssText = `
      background-color: #27ae60;
      color: white;
      border: none;
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      font-size: 16px;
    `;
    
    header.appendChild(title);
    header.appendChild(addBtn);
    sidebarContent.appendChild(header);
    
    const notesList = document.createElement('div');
    notesList.className = 'notes-list';
    
    const themes = data.notes.themes || [];
    
    if (themes.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color: #999; text-align: center; padding: 32px 16px;';
      empty.textContent = 'No notes yet';
      sidebarContent.appendChild(empty);
    } else {
      themes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-list-item';
        item.dataset.noteId = note.id;
        item.dataset.action = 'note-item';
        item.style.cursor = 'pointer';
        
        const noteTitle = document.createElement('div');
        noteTitle.className = 'note-list-item-title';
        noteTitle.textContent = note.title || 'Untitled';
        
        const preview = document.createElement('div');
        preview.className = 'note-list-item-preview';
        const text = note.content.replace(/<[^>]*>/g, '').substring(0, 50);
        preview.textContent = text || 'Empty note';
        
        item.appendChild(noteTitle);
        item.appendChild(preview);
        notesList.appendChild(item);
      });
      
      sidebarContent.appendChild(notesList);
    }
  }

  static renderNoteContent(noteId) {
    const mainArea = document.getElementById('mainWorkArea');
    mainArea.innerHTML = '';
    
    const note = this.findNoteById(noteId);
    if (!note) return;
    
    const container = document.createElement('div');
    container.className = 'notes-container';
    container.style.cssText = 'display: flex; flex-direction: column; height: 100%; padding: 24px;';
    
    const header = document.createElement('div');
    header.className = 'notes-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--border-color);
    `;
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'note-title-input';
    titleInput.value = note.title || 'Untitled';
    titleInput.style.flex = '1';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.style.cssText = `
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 12px;
    `;
    deleteBtn.addEventListener('click', () => this.deleteNote(noteId));
    
    header.appendChild(titleInput);
    header.appendChild(deleteBtn);
    container.appendChild(header);
    
    // Toolbar
    const toolbar = this.createEditorToolbar();
    container.appendChild(toolbar);
    
    // Editor
    const editor = document.createElement('div');
    editor.className = 'editor-content';
    editor.id = 'noteEditor';
    editor.innerHTML = note.content || '';
    editor.style.flex = '1';
    
    container.appendChild(editor);
    mainArea.appendChild(container);
    
    // Initialize editor
    const editorInstance = new Editor(editor);
    
    // Auto-save
    titleInput.addEventListener('input', () => {
      note.title = titleInput.value;
      storage.saveProjectData();
      this.renderNotesList();
    });
    
    editor.addEventListener('input', () => {
      note.content = editor.innerHTML;
      note.updatedAt = new Date().toISOString();
      storage.saveProjectData();
    });
  }

  static createEditorToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';
    toolbar.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 16px;
      background-color: var(--color-light);
      border-radius: 4px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    `;
    
    const buttons = [
      { icon: '𝐁', action: 'bold', title: 'Bold' },
      { icon: '𝐈', action: 'italic', title: 'Italic' },
      { icon: 'U̲', action: 'underline', title: 'Underline' },
      { icon: '🎨', action: 'textColor', title: 'Text Color' },
      { icon: '📷', action: 'image', title: 'Insert Image' },
      { icon: '🔗', action: 'link', title: 'Insert Link' },
    ];
    
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = 'toolbar-button';
      button.innerHTML = btn.icon;
      button.title = btn.title;
      button.style.cssText = `
        width: 36px;
        height: 36px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: white;
        cursor: pointer;
        transition: all 0.2s;
      `;
      
      button.addEventListener('click', () => {
        switch (btn.action) {
          case 'bold':
            document.execCommand('bold');
            button.classList.toggle('active');
            break;
          case 'italic':
            document.execCommand('italic');
            button.classList.toggle('active');
            break;
          case 'underline':
            document.execCommand('underline');
            button.classList.toggle('active');
            break;
          case 'textColor':
            this.showColorPicker('text');
            break;
          case 'image':
            this.showImagePicker();
            break;
          case 'link':
            this.showLinkPicker();
            break;
        }
      });
      
      toolbar.appendChild(button);
    });
    
    return toolbar;
  }

  static createNewNote() {
    const note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    storage.projectData.notes.themes = storage.projectData.notes.themes || [];
    storage.projectData.notes.themes.push(note);
    storage.saveProjectData();
    
    this.renderNotesList();
    
    // Auto-select the new note
    setTimeout(() => {
      const noteItem = document.querySelector(`[data-note-id="${note.id}"]`);
      if (noteItem) {
        this.selectNote(noteItem);
      }
    }, 100);
  }

  static selectNote(noteElement) {
    document.querySelectorAll('.note-list-item.active').forEach(item => {
      item.classList.remove('active');
    });
    
    noteElement.classList.add('active');
    const noteId = noteElement.dataset.noteId;
    state.setCurrentNote(noteId);
    
    this.renderNoteContent(noteId);
  }

  static deleteNote(noteId) {
    if (!confirm('Delete this note?')) return;
    
    storage.projectData.notes.themes = (storage.projectData.notes.themes || []).filter(
      n => n.id !== noteId
    );
    storage.saveProjectData();
    this.renderNotesList();
    document.getElementById('mainWorkArea').innerHTML = '';
  }

  static showLinkPicker() {
    alert('Link picker coming soon');
  }

  static showColorPicker(type) {
    alert('Color picker coming soon');
  }

  static showImagePicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const imagePath = await storage.saveImage(file, file.name);
        const imageUrl = await storage.loadImage(imagePath);
        
        const editor = document.getElementById('noteEditor');
        if (editor) {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.maxWidth = '100%';
          img.style.margin = '16px 0';
          editor.appendChild(img);
          
          const note = this.findNoteById(state.currentNote);
          if (note) {
            note.content = editor.innerHTML;
            storage.saveProjectData();
          }
        }
      } catch (error) {
        UI.showNotification('Error saving image', 'danger');
      }
    };
    input.click();
  }

  static findNoteById(noteId) {
    const themes = storage.projectData.notes.themes || [];
    return themes.find(n => n.id === noteId);
  }
}
