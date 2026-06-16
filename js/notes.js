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
      // Handle wiki/note link clicks
      if (e.target.matches('.wiki-link')) {
        e.preventDefault();
        this.openLinkTarget(e.target.dataset.linkId, e.target.dataset.linkType);
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
      transition: all 0.2s;
    `;
    addBtn.addEventListener('mouseover', () => {
      addBtn.style.backgroundColor = '#229954';
    });
    addBtn.addEventListener('mouseout', () => {
      addBtn.style.backgroundColor = '#27ae60';
    });
    
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
    titleInput.style.cssText = 'flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 18px; font-weight: 600;';\n    \n    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.style.cssText = `
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 12px;
      transition: all 0.2s;
    `;
    deleteBtn.addEventListener('mouseover', () => {
      deleteBtn.style.backgroundColor = '#c0392b';
    });
    deleteBtn.addEventListener('mouseout', () => {
      deleteBtn.style.backgroundColor = '#e74c3c';
    });
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
      { icon: '⭐', action: 'link', title: 'Insert Link to Wiki/Note' },
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
    UI.showNotification('Note deleted', 'success');
  }

  static showLinkPicker() {
    const editor = document.getElementById('noteEditor');
    const selection = window.getSelection();
    
    if (!selection.toString().length) {
      UI.showNotification('Please select text first', 'warning');
      return;
    }
    
    const selectedText = selection.toString();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';\n    \n    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = 'background: white; padding: 24px; border-radius: 4px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;';\n    \n    const title = document.createElement('h3');
    title.textContent = 'Create Link: \"' + selectedText.substring(0, 30) + '\"';\n    content.appendChild(title);\n    \n    const searchLabel = document.createElement('label');
    searchLabel.textContent = 'Search Wiki/Notes:';\n    searchLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;';\n    content.appendChild(searchLabel);\n    \n    const searchInput = document.createElement('input');
    searchInput.type = 'text';\n    searchInput.placeholder = 'Search...';\n    searchInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px;';\n    content.appendChild(searchInput);\n    \n    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'border: 1px solid #ddd; border-radius: 4px; max-height: 300px; overflow-y: auto; margin-bottom: 16px;';\n    content.appendChild(listContainer);\n    \n    let selectedTarget = null;\n    \n    const renderTargets = (searchText = '') => {\n      listContainer.innerHTML = '';\n      \n      const targets = this.getAllLinkTargets();\n      const filtered = targets.filter(t => \n        t.name.toLowerCase().includes(searchText.toLowerCase())\n      );\n      \n      if (filtered.length === 0) {\n        const empty = document.createElement('div');
        empty.style.cssText = 'padding: 20px; text-align: center; color: #999;';\n        empty.textContent = 'No results found';\n        listContainer.appendChild(empty);\n      } else {\n        filtered.forEach(target => {\n          const item = document.createElement('div');
          item.style.cssText = 'padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; transition: all 0.2s;';\n          item.addEventListener('mouseover', () => {\n            item.style.backgroundColor = '#f0f0f0';\n          });\n          item.addEventListener('mouseout', () => {\n            item.style.backgroundColor = 'transparent';\n          });\n          item.addEventListener('click', () => {\n            selectedTarget = target;\n            document.querySelectorAll('[data-target-selected]').forEach(el => {\n              el.removeAttribute('data-target-selected');\n              el.style.backgroundColor = 'transparent';\n            });\n            item.setAttribute('data-target-selected', 'true');\n            item.style.backgroundColor = '#3498db';\n            item.style.color = 'white';\n          });\n          \n          const targetName = document.createElement('div');
          targetName.style.cssText = 'font-weight: 500;';\n          targetName.textContent = target.name;\n          item.appendChild(targetName);\n          \n          const targetType = document.createElement('div');
          targetType.style.cssText = 'font-size: 12px; opacity: 0.7; margin-top: 4px;';\n          targetType.textContent = target.type === 'wiki' ? '📖 Wiki' : '📝 Note';\n          item.appendChild(targetType);\n          \n          listContainer.appendChild(item);\n        });\n      }\n    };\n    \n    renderTargets();\n    \n    searchInput.addEventListener('input', (e) => {\n      renderTargets(e.target.value);\n    });\n    \n    const buttons = document.createElement('div');
    buttons.className = 'modal-buttons';
    buttons.style.cssText = 'display: flex; gap: 12px; justify-content: flex-end;';\n    \n    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Create Link';\n    confirmBtn.className = 'btn-confirm';\n    confirmBtn.addEventListener('click', () => {\n      if (!selectedTarget) {\n        UI.showNotification('Please select a target', 'warning');\n        return;\n      }\n      \n      this.createLink(selectedText, selectedTarget);\n      modal.remove();\n    });\n    \n    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';\n    cancelBtn.className = 'btn-cancel';\n    cancelBtn.addEventListener('click', () => modal.remove());\n    \n    buttons.appendChild(confirmBtn);\n    buttons.appendChild(cancelBtn);\n    content.appendChild(buttons);\n    \n    modal.appendChild(content);\n    document.body.appendChild(modal);\n  }\n\n  static getAllLinkTargets() {\n    const targets = [];\n    \n    // Add all wiki folders\n    const addWikiFolders = (folders) => {\n      folders.forEach(folder => {\n        targets.push({\n          id: folder.id,\n          name: folder.name,\n          type: 'wiki',\n        });\n        if (folder.children) {\n          addWikiFolders(folder.children);\n        }\n      });\n    };\n    \n    addWikiFolders(storage.projectData.wiki.folders || []);\n    \n    // Add all notes\n    (storage.projectData.notes.themes || []).forEach(note => {\n      targets.push({\n        id: note.id,\n        name: note.title || 'Untitled Note',\n        type: 'note',\n      });\n    });\n    \n    return targets;\n  }\n\n  static createLink(text, target) {\n    const editor = document.getElementById('noteEditor');\n    const selection = window.getSelection();\n    \n    if (!selection.rangeCount) return;\n    \n    const range = selection.getRangeAt(0);\n    \n    const link = document.createElement('a');\n    link.className = 'wiki-link';\n    link.href = '#';\n    link.textContent = text;\n    link.dataset.linkId = target.id;\n    link.dataset.linkType = target.type;\n    link.style.cssText = 'color: #3498db; text-decoration: none; cursor: pointer; transition: all 0.2s;';\n    link.addEventListener('mouseover', () => {\n      link.style.textDecoration = 'underline';\n      link.style.color = '#2980b9';\n    });\n    link.addEventListener('mouseout', () => {\n      link.style.textDecoration = 'none';\n      link.style.color = '#3498db';\n    });\n    \n    range.deleteContents();\n    range.insertNode(link);\n    \n    // Move cursor after link\n    range.setStartAfter(link);\n    range.collapse(true);\n    selection.removeAllRanges();\n    selection.addRange(range);\n    \n    const note = this.findNoteById(state.currentNote);\n    if (note) {\n      note.content = editor.innerHTML;\n      storage.saveProjectData();\n    }\n    \n    UI.showNotification(`Link created to \"${target.name}\"`, 'success');\n  }\n\n  static openLinkTarget(linkId, linkType) {\n    if (linkType === 'wiki') {\n      const folder = Wiki.findFolderById(linkId);\n      if (folder) {\n        state.setCurrentTab('wiki');\n        App.switchTab('wiki');\n        setTimeout(() => {\n          const folderItem = document.querySelector(`[data-folder-id=\"${linkId}\"]`);\n          if (folderItem) {\n            Wiki.selectFolder(folderItem);\n          }\n        }, 100);\n      }\n    } else if (linkType === 'note') {\n      state.setCurrentTab('notes');\n      App.switchTab('notes');\n      setTimeout(() => {\n        const noteItem = document.querySelector(`[data-note-id=\"${linkId}\"]`);\n        if (noteItem) {\n          this.selectNote(noteItem);\n        }\n      }, 100);\n    }\n  }\n\n  static showColorPicker(type) {\n    if (type === 'text') {\n      UI.showModal('colorPickerModal');\n      const colorInput = document.getElementById('colorInput');\n      const confirmBtn = document.querySelector('#colorPickerModal .btn-confirm');\n      const cancelBtn = document.querySelector('#colorPickerModal .btn-cancel');\n      \n      const handleConfirm = () => {\n        document.execCommand('foreColor', false, colorInput.value);\n        UI.hideModal('colorPickerModal');\n        confirmBtn.removeEventListener('click', handleConfirm);\n        cancelBtn.removeEventListener('click', handleCancel);\n      };\n      \n      const handleCancel = () => {\n        UI.hideModal('colorPickerModal');\n        confirmBtn.removeEventListener('click', handleConfirm);\n        cancelBtn.removeEventListener('click', handleCancel);\n      };\n      \n      confirmBtn.addEventListener('click', handleConfirm);\n      cancelBtn.addEventListener('click', handleCancel);\n    }\n  }\n\n  static showImagePicker() {\n    const input = document.createElement('input');\n    input.type = 'file';\n    input.accept = 'image/*';\n    input.onchange = async (e) => {\n      const file = e.target.files[0];\n      if (!file) return;\n      \n      try {\n        const imagePath = await storage.saveImage(file, `${Date.now()}_${file.name}`);\n        const imageUrl = await storage.loadImage(imagePath);\n        \n        const editor = document.getElementById('noteEditor');\n        if (editor) {\n          const img = document.createElement('img');\n          img.src = imageUrl;\n          img.style.maxWidth = '100%';\n          img.style.margin = '16px 0';\n          img.style.borderRadius = '4px';\n          img.style.cursor = 'pointer';\n          img.addEventListener('click', () => {\n            UI.showModal('imagePreviewModal');\n            document.getElementById('previewImage').src = imageUrl;\n            document.querySelector('#imagePreviewModal .close-btn').addEventListener('click', () => {\n              UI.hideModal('imagePreviewModal');\n            });\n          });\n          editor.appendChild(img);\n          \n          const note = this.findNoteById(state.currentNote);\n          if (note) {\n            note.content = editor.innerHTML;\n            storage.saveProjectData();\n          }\n          \n          UI.showNotification('Image inserted and compressed', 'success');\n        }\n      } catch (error) {\n        UI.showNotification('Error saving image', 'danger');\n      }\n    };\n    input.click();\n  }\n\n  static findNoteById(noteId) {\n    const themes = storage.projectData.notes.themes || [];\n    return themes.find(n => n.id === noteId);\n  }\n}\n