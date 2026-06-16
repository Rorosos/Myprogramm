// State management module

class State {
  constructor() {
    this.currentTab = 'wiki';
    this.currentWikiFolder = null;
    this.currentNote = null;
    this.selectedObjects = [];
    this.observers = {};
  }

  subscribe(event, callback) {
    if (!this.observers[event]) {
      this.observers[event] = [];
    }
    this.observers[event].push(callback);
  }

  unsubscribe(event, callback) {
    if (!this.observers[event]) return;
    this.observers[event] = this.observers[event].filter(cb => cb !== callback);
  }

  notify(event, data) {
    if (!this.observers[event]) return;
    this.observers[event].forEach(callback => callback(data));
  }

  setCurrentTab(tab) {
    this.currentTab = tab;
    this.notify('tabChanged', tab);
  }

  setCurrentWikiFolder(folderId) {
    this.currentWikiFolder = folderId;
    this.notify('wikifolderChanged', folderId);
  }

  setCurrentNote(noteId) {
    this.currentNote = noteId;
    this.notify('noteChanged', noteId);
  }

  addSelectedObject(objectId) {
    if (!this.selectedObjects.includes(objectId)) {
      this.selectedObjects.push(objectId);
      this.notify('selectionChanged', this.selectedObjects);
    }
  }

  removeSelectedObject(objectId) {
    this.selectedObjects = this.selectedObjects.filter(id => id !== objectId);
    this.notify('selectionChanged', this.selectedObjects);
  }

  clearSelection() {
    this.selectedObjects = [];
    this.notify('selectionChanged', this.selectedObjects);
  }
}

const state = new State();