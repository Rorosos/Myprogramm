// Tasks (Kanban) module

class Tasks {
  static init() {
    this.setupEventListeners();
    this.renderBoard();
  }

  static setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.create-column-btn')) {
        this.showCreateColumnModal();
      }
    });
  }

  static renderBoard() {
    const mainArea = document.getElementById('mainWorkArea');
    mainArea.innerHTML = '';
    
    const data = storage.projectData;
    if (!data || !data.tasks) return;
    
    const board = document.createElement('div');
    board.className = 'kanban-board';
    
    const header = document.createElement('div');
    header.className = 'kanban-header';
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
    
    const title = document.createElement('h2');
    title.textContent = 'Tasks';
    title.style.margin = '0';
    
    const createBtn = document.createElement('button');
    createBtn.textContent = '+ Create Column';
    createBtn.className = 'create-column-btn';
    
    header.appendChild(title);
    header.appendChild(createBtn);
    board.appendChild(header);
    
    const columns = document.createElement('div');
    columns.className = 'kanban-columns';
    
    const taskColumns = data.tasks.columns || [];
    
    if (taskColumns.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color: #999; text-align: center; padding: 32px; flex: 1;';
      empty.textContent = 'No columns yet. Create one to get started!';
      board.appendChild(empty);
    } else {
      taskColumns.forEach((column, index) => {
        const columnEl = this.createColumnElement(column, index);
        columns.appendChild(columnEl);
      });
      board.appendChild(columns);
    }
    
    mainArea.appendChild(board);
  }

  static createColumnElement(column, index) {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'kanban-column';
    columnDiv.draggable = true;
    columnDiv.dataset.columnId = column.id;
    columnDiv.style.borderTopColor = column.color || '#3498db';
    
    const header = document.createElement('div');
    header.className = 'kanban-column-header';
    
    const title = document.createElement('h3');
    title.className = 'kanban-column-title';
    title.textContent = column.name;
    
    const actions = document.createElement('div');
    actions.className = 'kanban-column-actions';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.style.cssText = 'background: none; border: none; font-size: 16px; cursor: pointer;';
    addBtn.addEventListener('click', () => this.showCreateTaskModal(column.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.style.cssText = 'background: none; border: none; font-size: 16px; cursor: pointer; color: #e74c3c;';
    deleteBtn.addEventListener('click', () => this.deleteColumn(column.id));
    
    actions.appendChild(addBtn);
    actions.appendChild(deleteBtn);
    header.appendChild(title);
    header.appendChild(actions);
    columnDiv.appendChild(header);
    
    // Tasks container
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'kanban-tasks';
    tasksContainer.dataset.columnId = column.id;
    
    const tasks = column.tasks || [];
    if (tasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'kanban-empty-state';
      empty.textContent = 'No tasks';
      tasksContainer.appendChild(empty);
    } else {
      tasks.forEach(task => {
        const cardEl = this.createCardElement(task, column.id);
        tasksContainer.appendChild(cardEl);
      });
    }
    
    columnDiv.appendChild(tasksContainer);
    
    // Drag and drop
    columnDiv.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      columnDiv.classList.add('dragging');
    });
    
    columnDiv.addEventListener('dragend', () => {
      columnDiv.classList.remove('dragging');
    });
    
    return columnDiv;
  }

  static createCardElement(task, columnId) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.dataset.taskId = task.id;
    card.dataset.columnId = columnId;
    
    const title = document.createElement('div');
    title.className = 'kanban-card-title';
    title.textContent = task.name;
    card.appendChild(title);
    
    if (task.description) {
      const desc = document.createElement('div');
      desc.className = 'kanban-card-description';
      desc.textContent = task.description;
      card.appendChild(desc);
    }
    
    if (task.image) {
      const img = document.createElement('img');
      img.className = 'kanban-card-image';
      img.src = task.image;
      img.addEventListener('click', () => this.showImagePreview(task.image));
      card.appendChild(img);
    }
    
    if (task.link) {
      const link = document.createElement('a');
      link.className = 'kanban-card-link';
      link.href = '#';
      link.textContent = task.link;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLink(task.link);
      });
      card.appendChild(link);
    }
    
    // Drag and drop
    card.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
      e.dataTransfer.setData('taskId', task.id);
      e.dataTransfer.setData('fromColumnId', columnId);
    });
    
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
    
    card.addEventListener('click', () => this.showTaskEditor(task, columnId));
    
    return card;
  }

  static showCreateColumnModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = 'background: white; padding: 24px; border-radius: 4px; max-width: 500px; width: 90%;';
    
    const title = document.createElement('h3');
    title.textContent = 'Create Column';
    content.appendChild(title);
    
    const form = document.createElement('div');
    
    // Column name
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Column Name:';
    nameLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;';
    form.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'e.g., To Do';
    nameInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px;';
    form.appendChild(nameInput);
    
    // Color
    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Color:';
    colorLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;';
    form.appendChild(colorLabel);
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#3498db';
    colorInput.style.cssText = 'width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px; cursor: pointer;';
    form.appendChild(colorInput);
    
    content.appendChild(form);
    
    const buttons = document.createElement('div');
    buttons.className = 'modal-buttons';
    buttons.style.cssText = 'display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Create';
    confirmBtn.className = 'btn-confirm';
    confirmBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) return;
      
      this.createColumn(name, colorInput.value);
      modal.remove();
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn-cancel';
    cancelBtn.addEventListener('click', () => modal.remove());
    
    buttons.appendChild(confirmBtn);
    buttons.appendChild(cancelBtn);
    content.appendChild(buttons);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  static createColumn(name, color) {
    const column = {
      id: Date.now().toString(),
      name,
      color,
      tasks: [],
    };
    
    storage.projectData.tasks.columns = storage.projectData.tasks.columns || [];
    storage.projectData.tasks.columns.push(column);
    storage.saveProjectData();
    this.renderBoard();
  }

  static deleteColumn(columnId) {
    if (!confirm('Delete this column?')) return;
    
    storage.projectData.tasks.columns = (storage.projectData.tasks.columns || []).filter(
      c => c.id !== columnId
    );
    storage.saveProjectData();
    this.renderBoard();
  }

  static showCreateTaskModal(columnId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = 'background: white; padding: 24px; border-radius: 4px; max-width: 500px; width: 90%;';
    
    const title = document.createElement('h3');
    title.textContent = 'Create Task';
    content.appendChild(title);
    
    const form = document.createElement('div');
    
    // Task name
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Task Name:';
    nameLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;';
    form.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Task name';
    nameInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px;';
    form.appendChild(nameInput);
    
    // Description
    const descLabel = document.createElement('label');
    descLabel.textContent = 'Description:';
    descLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;';
    form.appendChild(descLabel);
    
    const descInput = document.createElement('textarea');
    descInput.placeholder = 'Task description';
    descInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px; resize: vertical; min-height: 80px;';
    form.appendChild(descInput);
    
    content.appendChild(form);
    
    const buttons = document.createElement('div');
    buttons.className = 'modal-buttons';
    buttons.style.cssText = 'display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end;';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Create';
    confirmBtn.className = 'btn-confirm';
    confirmBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) return;
      
      this.createTask(columnId, name, descInput.value);
      modal.remove();
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn-cancel';
    cancelBtn.addEventListener('click', () => modal.remove());
    
    buttons.appendChild(confirmBtn);
    buttons.appendChild(cancelBtn);
    content.appendChild(buttons);
    
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  static createTask(columnId, name, description = '') {
    const column = (storage.projectData.tasks.columns || []).find(c => c.id === columnId);
    if (!column) return;
    
    const task = {
      id: Date.now().toString(),
      name,
      description,
      image: null,
      link: null,
    };
    
    column.tasks = column.tasks || [];
    column.tasks.push(task);
    storage.saveProjectData();
    this.renderBoard();
  }

  static showTaskEditor(task, columnId) {
    // TODO: Implement task editor
    alert('Task editor coming soon');
  }

  static showImagePreview(imagePath) {
    UI.showModal('imagePreviewModal');
    const img = document.getElementById('previewImage');
    img.src = imagePath;
    
    const closeBtn = document.querySelector('#imagePreviewModal .close-btn');
    closeBtn.addEventListener('click', () => {
      UI.hideModal('imagePreviewModal');
    });
  }

  static openLink(link) {
    // TODO: Open wiki/note link
    alert(`Open link: ${link}`);
  }
}
