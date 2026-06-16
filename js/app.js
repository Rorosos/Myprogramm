// Main application initialization

class App {
  static async init() {
    console.log('Initializing Myprogramm...');
    
    // Wait for storage to be ready
    await this.waitForStorage();
    
    // Load project data
    if (!storage.dirHandle) {
      this.showWelcomeScreen();
      return;
    }
    
    await storage.loadProjectData();
    
    // Apply saved settings
    this.applySavedSettings();
    
    // Initialize modules
    this.setupTabSwitching();
    this.setupMenuHandlers();
    
    // Render default tab
    const lastTab = storage.projectData?.settings?.lastOpenedTab || 'wiki';
    this.switchTab(lastTab);
    
    console.log('Myprogramm initialized successfully');
  }

  static waitForStorage() {
    return new Promise((resolve) => {
      const checkStorage = setInterval(() => {
        if (storage.projectData !== null) {
          clearInterval(checkStorage);
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkStorage);
        resolve();
      }, 5000);
    });
  }

  static showWelcomeScreen() {
    const mainArea = document.getElementById('mainWorkArea');
    const sidebar = document.getElementById('leftSidebar');
    
    // Hide sidebar
    UI.toggleSidebar(false);
    
    mainArea.innerHTML = '';
    
    const welcome = document.createElement('div');
    welcome.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    `;
    
    const logo = document.createElement('h1');
    logo.textContent = '📚 Myprogramm';
    logo.style.cssText = 'font-size: 48px; margin-bottom: 20px;';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Documentation & Game Mechanics Manager';
    subtitle.style.cssText = 'font-size: 20px; margin-bottom: 40px; opacity: 0.9;';
    
    const description = document.createElement('p');
    description.textContent = 'Select a project directory to get started';
    description.style.cssText = 'font-size: 16px; margin-bottom: 30px; opacity: 0.8;';
    
    const button = document.createElement('button');
    button.textContent = '📂 Select Project Directory';
    button.style.cssText = `
      padding: 16px 32px;
      font-size: 16px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    `;
    
    button.addEventListener('mouseover', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    });
    
    button.addEventListener('click', async () => {
      try {
        await storage.pickDirectory();
        location.reload();
      } catch (error) {
        if (error.name !== 'AbortError') {
          UI.showNotification('Error selecting directory', 'danger');
        }
      }
    });
    
    welcome.appendChild(logo);
    welcome.appendChild(subtitle);
    welcome.appendChild(description);
    welcome.appendChild(button);
    
    mainArea.appendChild(welcome);
  }

  static applySavedSettings() {
    const settings = storage.projectData?.settings || {};
    
    // Apply theme
    if (settings.themeDark) {
      UI.enableDarkMode();
    }
    
    // Apply text size
    if (settings.textSizeMultiplier) {
      UI.setGlobalTextSize(settings.textSizeMultiplier);
    }
  }

  static setupTabSwitching() {
    document.querySelectorAll('.menu-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });
    
    // Folder button
    document.querySelector('.folder-btn').addEventListener('click', () => {
      this.switchTab('folder');
    });
  }

  static setupMenuHandlers() {
    // These will be connected to tab modules
    document.addEventListener('click', (e) => {
      // Tab switching is handled above
    });
  }

  static switchTab(tabName) {
    // Update active tab indicator
    document.querySelectorAll('.menu-tab').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Hide/show sidebar
    if (tabName === 'folder') {
      UI.toggleSidebar(false);
    } else {
      UI.toggleSidebar(true);
    }
    
    // Update state
    state.setCurrentTab(tabName);
    
    // Save current tab
    if (storage.projectData) {
      storage.projectData.settings.lastOpenedTab = tabName;
      storage.saveProjectData();
    }
    
    // Clear main area
    const mainArea = document.getElementById('mainWorkArea');
    mainArea.innerHTML = '';
    
    // Load tab content
    switch (tabName) {
      case 'wiki':
        Wiki.init();
        Wiki.renderFolderTree();
        break;
      case 'notes':
        Notes.init();
        Notes.renderNotesList();
        break;
      case 'tasks':
        Tasks.init();
        Tasks.renderBoard();
        break;
      case 'mechanics':
        Mechanics.init();
        Mechanics.renderBoard();
        break;
      case 'relations':
        Relations.init();
        Relations.renderRelationsView();
        break;
      case 'hamaynk':
        Settings.init();
        Settings.renderSettings();
        break;
      case 'folder':
        this.renderAssetsManager();
        break;
      default:
        Wiki.init();
        Wiki.renderFolderTree();
    }
  }

  static renderAssetsManager() {
    const mainArea = document.getElementById('mainWorkArea');
    mainArea.innerHTML = '';
    
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; flex-direction: column; height: 100%; padding: 24px;';
    
    const header = document.createElement('h2');
    header.textContent = 'Assets Manager';
    header.style.cssText = 'margin-bottom: 24px;';
    container.appendChild(header);
    
    const tabs = document.createElement('div');
    tabs.style.cssText = 'display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;';
    
    const imagesTab = document.createElement('button');
    imagesTab.textContent = '🖼️ Images';
    imagesTab.style.cssText = 'background: none; border: none; padding: 8px 12px; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;';
    imagesTab.classList.add('active');
    imagesTab.style.borderBottomColor = '#3498db';
    imagesTab.style.color = '#3498db';
    
    const relationsTab = document.createElement('button');
    relationsTab.textContent = '🔗 Relations';
    relationsTab.style.cssText = 'background: none; border: none; padding: 8px 12px; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;';
    
    const imagesContent = document.createElement('div');
    imagesContent.id = 'imagesTab';
    imagesContent.style.cssText = 'flex: 1; overflow-y: auto;';
    
    const relationsContent = document.createElement('div');
    relationsContent.id = 'relationsTab';
    relationsContent.style.cssText = 'flex: 1; overflow-y: auto; display: none;';
    
    imagesTab.addEventListener('click', () => {
      imagesContent.style.display = 'block';
      relationsContent.style.display = 'none';
      imagesTab.style.color = '#3498db';
      imagesTab.style.borderBottomColor = '#3498db';
      relationsTab.style.color = 'inherit';
      relationsTab.style.borderBottomColor = 'transparent';
    });
    
    relationsTab.addEventListener('click', () => {
      imagesContent.style.display = 'none';
      relationsContent.style.display = 'block';
      imagesTab.style.color = 'inherit';
      imagesTab.style.borderBottomColor = 'transparent';
      relationsTab.style.color = '#3498db';
      relationsTab.style.borderBottomColor = '#3498db';
    });
    
    tabs.appendChild(imagesTab);
    tabs.appendChild(relationsTab);
    container.appendChild(tabs);
    
    // Images content
    const imagesTable = this.createImagesTable();
    imagesContent.appendChild(imagesTable);
    container.appendChild(imagesContent);
    
    // Relations content placeholder
    const relationsText = document.createElement('div');
    relationsText.style.cssText = 'color: #999; text-align: center; padding: 40px;';
    relationsText.textContent = 'Relations audit table - coming soon';
    relationsContent.appendChild(relationsText);
    container.appendChild(relationsContent);
    
    mainArea.appendChild(container);
  }

  static createImagesTable() {
    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse;';
    
    // Header
    const header = table.createTHead();
    const headerRow = header.insertRow();
    headerRow.style.cssText = 'border-bottom: 2px solid var(--border-color);';
    
    const headers = ['Name', 'Used In', 'Size', 'Created', 'Preview'];
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      th.style.cssText = 'padding: 12px; text-align: left; font-weight: 600;';
      headerRow.appendChild(th);
    });
    
    // Body
    const body = table.createTBody();
    body.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #999;">No images yet</td></tr>';
    
    return table;
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
