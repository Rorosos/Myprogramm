// Wiki module - handles wiki folder structure and editing

class Wiki {
  static init() {
    this.setupEventListeners();
    this.renderFolderTree();
  }

  static setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="create-wiki-folder"]')) {
        this.createFolder();
      }
      if (e.target.matches('[data-action="wiki-folder-item"]')) {
        this.selectFolder(e.target.closest('.tree-item'));
      }
      if (e.target.matches('[data-action="wiki-edit-title"]')) {
        this.editFolderTitle();
      }
      if (e.target.matches('[data-action="wiki-delete"]')) {
        this.deleteFolder();
      }
      if (e.target.matches('[data-action="wiki-change-color"]')) {
        this.changeColor();
      }
      if (e.target.matches('[data-action="wiki-move"]')) {
        this.moveFolder();
      }
      if (e.target.matches('[data-action="wiki-insert-link"]')) {
        this.insertLink();
      }
      if (e.target.matches('[data-action="wiki-insert-image"]')) {
        this.insertImage();
      }
    });
  }

  static renderFolderTree() {
    const sidebarContent = document.getElementById('sidebarContent');
    sidebarContent.innerHTML = '';
    
    const data = storage.projectData;
    if (!data || !data.wiki) return;
    
    // Root folders
    const rootContainer = document.createElement('div');
    rootContainer.id = 'wikiTree';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = '+ New Folder';
    addBtn.className = 'add-root-btn';
    addBtn.style.cssText = `
      width: 100%;
      margin-bottom: 16px;
      background-color: #27ae60;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
    `;
    addBtn.addEventListener('click', () => this.createRootFolder());
    
    sidebarContent.appendChild(addBtn);
    sidebarContent.appendChild(rootContainer);
    
    data.wiki.folders.forEach(folder => {
      const treeItem = this.renderFolder(folder);
      rootContainer.appendChild(treeItem);
    });
  }

  static renderFolder(folder, level = 0) {
    const container = document.createElement('div');
    container.style.marginLeft = `${level * 16}px`;
    
    const item = document.createElement('div');
    item.className = 'tree-item';
    item.draggable = true;
    item.dataset.folderId = folder.id;
    item.dataset.action = 'wiki-folder-item';
    
    const toggle = document.createElement('button');
    toggle.className = 'tree-item-toggle';
    if (!folder.children || folder.children.length === 0) {
      toggle.classList.add('hidden');
    } else {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const childrenDiv = item.nextElementSibling;
        if (childrenDiv && childrenDiv.classList.contains('tree-children')) {
          childrenDiv.classList.toggle('collapsed');
          toggle.classList.toggle('expanded');
        }
      });
    }
    
    const colorBox = document.createElement('div');
    colorBox.className = 'folder-color-box';
    colorBox.style.backgroundColor = folder.color || '#3498db';
    colorBox.style.cursor = 'pointer';
    colorBox.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectFolder(item);
      this.changeColor(folder.id);
    });
    
    const name = document.createElement('span');
    name.className = 'tree-item-name';
    name.textContent = folder.name;
    
    const actions = document.createElement('div');
    actions.className = 'tree-item-actions';
    
    const addBtn = document.createElement('button');
    addBtn.className = 'tree-item-action-btn';
    addBtn.innerHTML = '+';
    addBtn.title = 'Add subfolder';
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.createSubfolder(folder.id);
    });
    
    actions.appendChild(addBtn);
    
    item.appendChild(toggle);
    item.appendChild(colorBox);
    item.appendChild(name);
    item.appendChild(actions);
    
    container.appendChild(item);
    
    if (folder.children && folder.children.length > 0) {
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'tree-children';
      
      folder.children.forEach(child => {
        const childItem = this.renderFolder(child, level + 1);
        childrenDiv.appendChild(childItem);
      });
      
      container.appendChild(childrenDiv);
    }
    
    return container;
  }

  static selectFolder(folderElement) {
    document.querySelectorAll('.tree-item.active').forEach(item => {
      item.classList.remove('active');
    });
    
    folderElement.classList.add('active');
    const folderId = folderElement.dataset.folderId;
    state.setCurrentWikiFolder(folderId);
    
    this.renderFolderContent(folderId);
  }

  static renderFolderContent(folderId) {
    const mainArea = document.getElementById('mainWorkArea');
    mainArea.innerHTML = '';
    
    const folder = this.findFolderById(folderId);
    if (!folder) return;
    
    const container = document.createElement('div');
    container.className = 'wiki-editor';
    
    const header = document.createElement('div');
    header.className = 'wiki-header';
    
    const title = document.createElement('h2');
    title.textContent = folder.name;
    
    const actions = document.createElement('div');
    actions.className = 'wiki-actions';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.data-action = 'wiki-delete';
    deleteBtn.addEventListener('click', () => this.deleteFolder(folderId));
    
    const renameBtn = document.createElement('button');
    renameBtn.textContent = '✏️ Rename';
    renameBtn.addEventListener('click', () => this.editFolderTitle(folderId));
    
    const moveBtn = document.createElement('button');
    moveBtn.textContent = '📍 Move';
    moveBtn.data-action = 'wiki-move';
    moveBtn.addEventListener('click', () => this.moveFolder(folderId));
    
    actions.appendChild(renameBtn);
    actions.appendChild(moveBtn);
    actions.appendChild(deleteBtn);
    
    header.appendChild(title);
    header.appendChild(actions);
    container.appendChild(header);
    
    // Toolbar
    const toolbar = this.createEditorToolbar();
    container.appendChild(toolbar);
    
    // Editor
    const editor = document.createElement('div');
    editor.className = 'editor-content';
    editor.id = 'wikiEditor';
    editor.innerHTML = folder.content || '';
    
    container.appendChild(editor);
    
    mainArea.appendChild(container);
    
    // Initialize editor
    const editorInstance = new Editor(editor);
    
    // Auto-save on change
    editor.addEventListener('input', () => {
      folder.content = editor.innerHTML;
      storage.saveProjectData();
    });
  }

  static createEditorToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';
    
    const buttons = [
      { icon: '𝐁', action: 'bold', title: 'Bold' },
      { icon: '𝐈', action: 'italic', title: 'Italic' },
      { icon: 'U̲', action: 'underline', title: 'Underline' },
      { icon: '🎨', action: 'textColor', title: 'Text Color' },
      { icon: '🖼️', action: 'image', title: 'Insert Image' },
      { icon: '🔗', action: 'link', title: 'Insert Link' },
      { icon: '⚙️', action: 'folderColor', title: 'Folder Color' },
    ];
    
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.className = 'toolbar-button';
      button.innerHTML = btn.icon;
      button.title = btn.title;
      button.dataset.action = `editor-${btn.action}`;
      
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
          case 'folderColor':
            this.changeColor();
            break;
        }
      });
      
      toolbar.appendChild(button);
    });
    
    return toolbar;
  }

  static createRootFolder() {
    const name = prompt('Folder name:');
    if (!name) return;
    
    const folder = {
      id: Date.now().toString(),
      name,
      color: '#3498db',
      content: '',
      children: [],
    };
    
    storage.projectData.wiki.folders.push(folder);
    storage.saveProjectData();
    this.renderFolderTree();
  }

  static createSubfolder(parentId) {
    const name = prompt('Subfolder name:');
    if (!name) return;
    
    const parentFolder = this.findFolderById(parentId);
    if (!parentFolder) return;
    
    const subfolder = {
      id: Date.now().toString(),
      name,
      color: '#3498db',
      content: '',
      children: [],
    };
    
    parentFolder.children = parentFolder.children || [];
    parentFolder.children.push(subfolder);
    storage.saveProjectData();
    this.renderFolderTree();
  }

  static editFolderTitle(folderId = state.currentWikiFolder) {
    const folder = this.findFolderById(folderId);
    if (!folder) return;
    
    const newName = prompt('New folder name:', folder.name);
    if (newName && newName.trim()) {
      folder.name = newName;
      storage.saveProjectData();
      this.renderFolderTree();
      this.renderFolderContent(folderId);
    }
  }

  static deleteFolder(folderId = state.currentWikiFolder) {
    if (!confirm('Are you sure?')) return;
    
    storage.projectData.wiki.folders = storage.projectData.wiki.folders.filter(
      f => f.id !== folderId
    );
    storage.saveProjectData();
    this.renderFolderTree();
    document.getElementById('mainWorkArea').innerHTML = '';
  }

  static changeColor(folderId = state.currentWikiFolder) {
    const folder = this.findFolderById(folderId);
    if (!folder) return;
    
    UI.showModal('colorPickerModal');
    
    const colorInput = document.getElementById('colorInput');
    colorInput.value = folder.color || '#3498db';
    
    const confirmBtn = document.querySelector('#colorPickerModal .btn-confirm');
    const cancelBtn = document.querySelector('#colorPickerModal .btn-cancel');
    
    const handleConfirm = () => {
      folder.color = colorInput.value;
      storage.saveProjectData();
      this.renderFolderTree();
      this.renderFolderContent(folderId);
      UI.hideModal('colorPickerModal');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };
    
    const handleCancel = () => {
      UI.hideModal('colorPickerModal');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  }

  static moveFolder(folderId = state.currentWikiFolder) {
    // TODO: Implement folder moving with modal
    alert('Move functionality coming soon');
  }

  static showLinkPicker() {
    // TODO: Implement link picker
    alert('Link picker coming soon');
  }

  static showColorPicker(type) {
    // TODO: Implement color picker for text
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
        
        const editor = document.getElementById('wikiEditor');
        if (editor) {
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.maxWidth = '100%';
          img.style.margin = '16px 0';
          editor.appendChild(img);
          
          const folder = this.findFolderById(state.currentWikiFolder);
          if (folder) {
            folder.content = editor.innerHTML;
            storage.saveProjectData();
          }
        }
      } catch (error) {
        UI.showNotification('Error saving image', 'danger');
      }
    };
    input.click();
  }

  static findFolderById(folderId, folders = null) {
    if (!folders) {
      folders = storage.projectData.wiki.folders;
    }
    
    for (let folder of folders) {
      if (folder.id === folderId) return folder;
      if (folder.children) {
        const found = this.findFolderById(folderId, folder.children);
        if (found) return found;
      }
    }
    return null;
  }
}
