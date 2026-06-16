// Settings module - Hamaynk tab

class Settings {
  static init() {
    this.setupEventListeners();
    this.renderSettings();
  }

  static setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.pick-directory-btn')) {
        this.pickDirectory();
      }
    });
    
    document.addEventListener('change', (e) => {
      if (e.target.id === 'globalTextSize') {
        this.changeTextSize(e.target.value);
      }
    });
  }

  static renderSettings() {
    const mainArea = document.getElementById('mainWorkArea');
    mainArea.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'settings-container';
    
    // Directory section
    const dirSection = document.createElement('div');
    dirSection.className = 'settings-section';
    
    const dirTitle = document.createElement('h3');
    dirTitle.textContent = 'Project Directory';
    dirSection.appendChild(dirTitle);
    
    const dirItem = document.createElement('div');
    dirItem.className = 'settings-item';
    dirItem.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--color-light); border-radius: 4px;';
    
    const dirLabel = document.createElement('div');
    dirLabel.textContent = 'Save Location';
    dirLabel.style.cssText = 'font-weight: 500; flex: 1;';
    
    const dirPath = document.createElement('div');
    dirPath.className = 'directory-path';
    dirPath.textContent = storage.dirHandle ? 'Directory selected' : 'No directory';
    dirPath.style.cssText = 'flex: 1; margin: 0 12px; padding: 8px; background: white; border: 1px solid var(--border-color); border-radius: 4px;';
    
    const pickBtn = document.createElement('button');
    pickBtn.textContent = '📁 Select';
    pickBtn.className = 'pick-directory-btn';
    pickBtn.style.cssText = 'background: #3498db; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;';
    
    dirItem.appendChild(dirLabel);
    dirItem.appendChild(dirPath);
    dirItem.appendChild(pickBtn);
    dirSection.appendChild(dirItem);
    container.appendChild(dirSection);
    
    // Text size section
    const textSection = document.createElement('div');
    textSection.className = 'settings-section';
    
    const textTitle = document.createElement('h3');
    textTitle.textContent = 'Display';
    textSection.appendChild(textTitle);
    
    const textItem = document.createElement('div');
    textItem.className = 'settings-item';
    textItem.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--color-light); border-radius: 4px;';
    
    const textLabel = document.createElement('div');
    textLabel.textContent = 'Text Size';
    textLabel.style.cssText = 'font-weight: 500; flex: 1;';
    
    const sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = 'display: flex; align-items: center; gap: 12px; flex: 2;';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = 'globalTextSize';
    slider.min = '0.8';
    slider.max = '1.5';
    slider.step = '0.1';
    slider.value = storage.projectData?.settings?.textSizeMultiplier || '1';
    slider.style.cssText = 'flex: 1; min-width: 150px;';
    
    const sliderValue = document.createElement('div');
    sliderValue.textContent = `${Math.round(slider.value * 100)}%`;
    sliderValue.style.cssText = 'min-width: 60px; text-align: right;';
    
    slider.addEventListener('input', () => {
      sliderValue.textContent = `${Math.round(slider.value * 100)}%`;
    });
    
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(sliderValue);
    textItem.appendChild(textLabel);
    textItem.appendChild(sliderContainer);
    textSection.appendChild(textItem);
    
    // Theme section
    const themeItem = document.createElement('div');
    themeItem.className = 'settings-item';
    themeItem.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--color-light); border-radius: 4px; margin-top: 12px;';
    
    const themeLabel = document.createElement('div');
    themeLabel.textContent = 'Theme';
    themeLabel.style.cssText = 'font-weight: 500; flex: 1;';
    
    const themeButtons = document.createElement('div');
    themeButtons.className = 'theme-toggle';
    themeButtons.style.cssText = 'display: flex; gap: 8px; flex: 1;';
    
    const lightBtn = document.createElement('button');
    lightBtn.textContent = '☀️ Light';
    lightBtn.style.cssText = 'flex: 1; padding: 8px; border: 2px solid var(--border-color); background: white; border-radius: 4px; cursor: pointer;';
    lightBtn.classList.add(storage.projectData?.settings?.themeDark ? '' : 'active');
    lightBtn.addEventListener('click', () => this.setTheme(false, lightBtn, darkBtn));
    
    const darkBtn = document.createElement('button');
    darkBtn.textContent = '🌙 Dark';
    darkBtn.style.cssText = 'flex: 1; padding: 8px; border: 2px solid var(--border-color); background: white; border-radius: 4px; cursor: pointer;';
    darkBtn.classList.add(storage.projectData?.settings?.themeDark ? 'active' : '');
    darkBtn.addEventListener('click', () => this.setTheme(true, lightBtn, darkBtn));
    
    themeButtons.appendChild(lightBtn);
    themeButtons.appendChild(darkBtn);
    themeItem.appendChild(themeLabel);
    themeItem.appendChild(themeButtons);
    textSection.appendChild(themeItem);
    
    container.appendChild(textSection);
    
    mainArea.appendChild(container);
  }

  static async pickDirectory() {
    try {
      await storage.pickDirectory();
      UI.showNotification('Directory selected successfully', 'success');
      this.renderSettings();
    } catch (error) {
      if (error.name !== 'AbortError') {
        UI.showNotification('Error selecting directory', 'danger');
      }
    }
  }

  static changeTextSize(multiplier) {
    storage.projectData.settings.textSizeMultiplier = parseFloat(multiplier);
    storage.saveProjectData();
    UI.setGlobalTextSize(multiplier);
  }

  static setTheme(isDark, lightBtn, darkBtn) {
    storage.projectData.settings.themeDark = isDark;
    storage.saveProjectData();
    
    if (isDark) {
      UI.enableDarkMode();
      darkBtn.classList.add('active');
      lightBtn.classList.remove('active');
    } else {
      UI.disableDarkMode();
      lightBtn.classList.add('active');
      darkBtn.classList.remove('active');
    }
  }
}
