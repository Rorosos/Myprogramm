// UI module - handles DOM rendering and updates

class UI {
  static showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  static hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  static hideAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  static showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px 24px;
      background-color: var(--color-${type});
      color: white;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 2000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  static createTreeItem(folder, options = {}) {
    const item = document.createElement('div');
    item.className = 'tree-item';
    item.draggable = true;
    
    const toggle = document.createElement('button');
    toggle.className = 'tree-item-toggle';
    if (!folder.children || folder.children.length === 0) {
      toggle.classList.add('hidden');
    }
    
    const colorBox = document.createElement('div');
    colorBox.className = 'folder-color-box';
    colorBox.style.backgroundColor = folder.color || '#3498db';
    
    const name = document.createElement('span');
    name.className = 'tree-item-name';
    name.textContent = folder.name;
    
    const actions = document.createElement('div');
    actions.className = 'tree-item-actions';
    
    if (!options.hideActions) {
      const addBtn = document.createElement('button');
      addBtn.className = 'tree-item-action-btn';
      addBtn.innerHTML = '+';
      addBtn.title = 'Add subfolder';
      
      actions.appendChild(addBtn);
    }
    
    item.appendChild(toggle);
    item.appendChild(colorBox);
    item.appendChild(name);
    item.appendChild(actions);
    
    return item;
  }

  static createListItem(item) {
    const div = document.createElement('div');
    div.className = 'list-item';
    
    const title = document.createElement('div');
    title.className = 'list-item-title';
    title.textContent = item.title || item.name;
    
    div.appendChild(title);
    
    if (item.subtitle) {
      const subtitle = document.createElement('div');
      subtitle.className = 'list-item-subtitle';
      subtitle.textContent = item.subtitle;
      div.appendChild(subtitle);
    }
    
    return div;
  }

  static createButton(text, options = {}) {
    const button = document.createElement('button');
    button.textContent = text;
    
    if (options.className) button.className = options.className;
    if (options.onClick) button.addEventListener('click', options.onClick);
    if (options.title) button.title = options.title;
    if (options.id) button.id = options.id;
    
    return button;
  }

  static createInput(options = {}) {
    const input = document.createElement('input');
    input.type = options.type || 'text';
    
    if (options.placeholder) input.placeholder = options.placeholder;
    if (options.value) input.value = options.value;
    if (options.id) input.id = options.id;
    if (options.onChange) input.addEventListener('change', options.onChange);
    if (options.onInput) input.addEventListener('input', options.onInput);
    
    return input;
  }

  static enableDarkMode() {
    document.body.classList.add('dark-mode');
  }

  static disableDarkMode() {
    document.body.classList.remove('dark-mode');
  }

  static setGlobalTextSize(multiplier) {
    document.documentElement.style.setProperty('--font-size', `${14 * multiplier}px`);
  }

  static toggleSidebar(show) {
    const sidebar = document.getElementById('leftSidebar');
    if (show) {
      sidebar.classList.remove('hidden');
    } else {
      sidebar.classList.add('hidden');
    }
  }

  static highlightLinks(content) {
    // This will be implemented to auto-link wiki/note references
    // For now, placeholder
    return content;
  }
}
