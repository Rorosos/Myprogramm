// Storage module - handles File System Access API and data persistence

class Storage {
  constructor() {
    this.dirHandle = null;
    this.projectData = null;
    this.init();
  }

  async init() {
    // Try to restore previous directory handle from IndexedDB
    const savedHandle = await this.getFromIndexedDB('dirHandle');
    if (savedHandle) {
      try {
        // Verify permission
        const permission = await savedHandle.queryPermission({ mode: 'readwrite' });
        if (permission === 'granted') {
          this.dirHandle = savedHandle;
          await this.loadProjectData();
        } else {
          // Request permission
          const newPermission = await savedHandle.requestPermission({ mode: 'readwrite' });
          if (newPermission === 'granted') {
            this.dirHandle = savedHandle;
            await this.loadProjectData();
          }
        }
      } catch (error) {
        console.log('Saved directory handle is no longer valid');
        this.dirHandle = null;
      }
    }
  }

  async pickDirectory() {
    try {
      this.dirHandle = await window.showDirectoryPicker();
      await this.saveToIndexedDB('dirHandle', this.dirHandle);
      await this.loadProjectData();
      return this.dirHandle;
    } catch (error) {
      console.error('Directory picker error:', error);
      throw error;
    }
  }

  async loadProjectData() {
    if (!this.dirHandle) return null;

    try {
      const file = await this.dirHandle.getFileHandle('project.json');
      const content = await file.getFile();
      const text = await content.text();
      this.projectData = JSON.parse(text);
      return this.projectData;
    } catch (error) {
      console.log('Creating new project data...');
      this.projectData = this.getDefaultProjectData();
      await this.saveProjectData();
      return this.projectData;
    }
  }

  async saveProjectData() {
    if (!this.dirHandle || !this.projectData) return;

    try {
      const writable = await this.dirHandle.getFileHandle('project.json', { create: true });
      const writer = await writable.createWritable();
      await writer.write(JSON.stringify(this.projectData, null, 2));
      await writer.close();
    } catch (error) {
      console.error('Error saving project data:', error);
      throw error;
    }
  }

  async saveImage(file, imageName) {
    if (!this.dirHandle) throw new Error('No directory selected');

    try {
      // Create images directory if it doesn't exist
      let imagesDir = await this.dirHandle.getDirectoryHandle('images', { create: true });
      
      // Process image (compress)
      const compressedBlob = await ImageProcessor.processImage(file);
      
      // Save to disk
      const fileHandle = await imagesDir.getFileHandle(imageName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(compressedBlob);
      await writable.close();
      
      return `images/${imageName}`;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  async loadImage(imagePath) {
    if (!this.dirHandle) return null;

    try {
      const parts = imagePath.split('/');
      let handle = this.dirHandle;
      
      for (let i = 0; i < parts.length - 1; i++) {
        handle = await handle.getDirectoryHandle(parts[i]);
      }
      
      const fileHandle = await handle.getFileHandle(parts[parts.length - 1]);
      const file = await fileHandle.getFile();
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  }

  async deleteImage(imagePath) {
    if (!this.dirHandle) return;

    try {
      const parts = imagePath.split('/');
      let handle = this.dirHandle;
      
      for (let i = 0; i < parts.length - 1; i++) {
        handle = await handle.getDirectoryHandle(parts[i]);
      }
      
      await handle.removeEntry(parts[parts.length - 1]);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  async listImages() {
    if (!this.dirHandle) return [];

    try {
      const imagesDir = await this.dirHandle.getDirectoryHandle('images');
      const images = [];
      
      for await (const entry of imagesDir.values()) {
        if (entry.kind === 'file') {
          images.push(entry.name);
        }
      }
      
      return images;
    } catch (error) {
      return [];
    }
  }

  getDefaultProjectData() {
    return {
      version: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        themeDark: false,
        textSizeMultiplier: 1,
        lastOpenedTab: 'wiki',
      },
      wiki: {
        folders: [],
      },
      notes: {
        themes: [],
      },
      tasks: {
        columns: [],
      },
      mechanics: {
        columns: [],
      },
      relations: {
        objects: [],
        connections: [],
        relationTypes: [],
      },
    };
  }

  async saveToIndexedDB(key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MyprogrammDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['store'], 'readwrite');
        const store = transaction.objectStore('store');
        store.put({ key, value });
        transaction.oncomplete = () => resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store', { keyPath: 'key' });
        }
      };
    });
  }

  async getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MyprogrammDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['store'], 'readonly');
        const store = transaction.objectStore('store');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          resolve(result ? result.value : null);
        };
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store', { keyPath: 'key' });
        }
      };
    });
  }
}

const storage = new Storage();