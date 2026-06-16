// Mechanics (Kanban) module - identical to Tasks but independent data

class Mechanics {
  static init() {
    this.setupEventListeners();
    this.renderBoard();
  }

  static setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.create-mechanic-column-btn')) {
        this.showCreateColumnModal();
      }
    });
  }

  static renderBoard() {
    const mainArea = document.getElementById('mainWorkArea');
    mainArea.innerHTML = '';
    
    const data = storage.projectData;
    if (!data || !data.mechanics) return;
    
    const board = document.createElement('div');
    board.className = 'mechanics-board';
    
    const header = document.createElement('div');
    header.className = 'mechanics-header';
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
    
    const title = document.createElement('h2');
    title.textContent = 'Game Mechanics';
    title.style.margin = '0';
    
    const createBtn = document.createElement('button');
    createBtn.textContent = '+ Create Column';
    createBtn.className = 'create-mechanic-column-btn';
    
    header.appendChild(title);
    header.appendChild(createBtn);
    board.appendChild(header);
    
    const columns = document.createElement('div');
    columns.className = 'mechanics-columns';
    
    const mechColumns = data.mechanics.columns || [];
    
    if (mechColumns.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color: #999; text-align: center; padding: 32px; flex: 1;';
      empty.textContent = 'No mechanics columns yet.';
      board.appendChild(empty);
    } else {
      mechColumns.forEach((column) => {
        const columnEl = this.createColumnElement(column);
        columns.appendChild(columnEl);
      });
      board.appendChild(columns);
    }
    
    mainArea.appendChild(board);
  }

  static createColumnElement(column) {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'mechanics-column';
    columnDiv.draggable = true;
    columnDiv.dataset.columnId = column.id;
    columnDiv.style.borderTopColor = column.color || '#3498db';
    
    const header = document.createElement('div');
    header.className = 'mechanics-column-header';
    
    const title = document.createElement('h3');
    title.className = 'mechanics-column-title';
    title.textContent = column.name;
    
    const actions = document.createElement('div');
    actions.className = 'mechanics-column-actions';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.style.cssText = 'background: none; border: none; font-size: 16px; cursor: pointer;';
    addBtn.addEventListener('click', () => this.showCreateMechanicModal(column.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.style.cssText = 'background: none; border: none; font-size: 16px; cursor: pointer; color: #e74c3c;';
    deleteBtn.addEventListener('click', () => this.deleteColumn(column.id));
    
    actions.appendChild(addBtn);
    actions.appendChild(deleteBtn);
    header.appendChild(title);
    header.appendChild(actions);
    columnDiv.appendChild(header);
    
    // Items container
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'mechanics-items';
    itemsContainer.dataset.columnId = column.id;
    
    const items = column.items || [];
    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color: #999; text-align: center; padding: 16px;';
      empty.textContent = 'No items';
      itemsContainer.appendChild(empty);
    } else {
      items.forEach(item => {
        const itemEl = this.createItemElement(item, column.id);
        itemsContainer.appendChild(itemEl);
      });
    }
    
    columnDiv.appendChild(itemsContainer);
    return columnDiv;
  }

  static createItemElement(item, columnId) {
    const card = document.createElement('div');
    card.className = 'mechanics-item';
    card.draggable = true;
    card.dataset.itemId = item.id;
    card.dataset.columnId = columnId;
    
    const title = document.createElement('div');
    title.style.cssText = 'font-weight: 600; margin-bottom: 8px;';
    title.textContent = item.name;
    card.appendChild(title);
    
    if (item.description) {
      const desc = document.createElement('div');
      desc.style.cssText = 'font-size: 12px; color: #666; word-break: break-word;';
      desc.textContent = item.description;
      card.appendChild(desc);
    }
    
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
    title.textContent = 'Create Mechanics Column';
    content.appendChild(title);
    
    const form = document.createElement('div');
    
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Column Name:';
    nameLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;';
    form.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'e.g., Combat System';
    nameInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px;';
    form.appendChild(nameInput);
    
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
      items: [],
    };
    
    storage.projectData.mechanics.columns = storage.projectData.mechanics.columns || [];
    storage.projectData.mechanics.columns.push(column);
    storage.saveProjectData();
    this.renderBoard();
  }

  static deleteColumn(columnId) {
    if (!confirm('Delete this column?')) return;
    
    storage.projectData.mechanics.columns = (storage.projectData.mechanics.columns || []).filter(
      c => c.id !== columnId
    );
    storage.saveProjectData();
    this.renderBoard();
  }

  static showCreateMechanicModal(columnId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = 'background: white; padding: 24px; border-radius: 4px; max-width: 500px; width: 90%;';
    
    const title = document.createElement('h3');
    title.textContent = 'Create Mechanic';
    content.appendChild(title);
    
    const form = document.createElement('div');
    
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Mechanic Name:';
    nameLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;';
    form.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Mechanic name';
    nameInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px;';
    form.appendChild(nameInput);
    
    const descLabel = document.createElement('label');
    descLabel.textContent = 'Description:';
    descLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;';
    form.appendChild(descLabel);
    
    const descInput = document.createElement('textarea');
    descInput.placeholder = 'Mechanic description';
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
      
      this.createMechanic(columnId, name, descInput.value);
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

  static createMechanic(columnId, name, description = '') {
    const column = (storage.projectData.mechanics.columns || []).find(c => c.id === columnId);
    if (!column) return;
    
    const item = {
      id: Date.now().toString(),
      name,
      description,
    };
    
    column.items = column.items || [];
    column.items.push(item);
    storage.saveProjectData();
    this.renderBoard();
  }
}
