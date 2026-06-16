// Rich text editor module

class Editor {
  constructor(editorElement) {
    this.element = editorElement;
    this.selectedText = null;
    this.selectedRange = null;
    this.init();
  }

  init() {
    this.element.contentEditable = 'true';
    this.element.addEventListener('mouseup', () => this.updateSelection());
    this.element.addEventListener('keyup', () => this.updateSelection());
  }

  updateSelection() {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      this.selectedText = selection.toString();
      this.selectedRange = selection.getRangeAt(0);
    } else {
      this.selectedText = null;
      this.selectedRange = null;
    }
  }

  hasSelection() {
    return !!this.selectedText && this.selectedText.length > 0;
  }

  applyBold() {
    document.execCommand('bold', false, null);
  }

  applyItalic() {
    document.execCommand('italic', false, null);
  }

  applyUnderline() {
    document.execCommand('underline', false, null);
  }

  setTextColor(color) {
    document.execCommand('foreColor', false, color);
  }

  setBackgroundColor(color) {
    document.execCommand('backColor', false, color);
  }

  setFontSize(size) {
    document.execCommand('fontSize', false, size);
  }

  createLink(href) {
    if (this.hasSelection()) {
      document.execCommand('createLink', false, href);
    }
  }

  insertImage(imagePath) {
    const img = document.createElement('img');
    img.src = imagePath;
    img.className = 'editor-image';
    img.style.maxWidth = '100%';
    img.style.cursor = 'pointer';
    
    if (this.selectedRange) {
      this.selectedRange.insertNode(img);
    } else {
      this.element.appendChild(img);
    }
  }

  getContent() {
    return this.element.innerHTML;
  }

  setContent(html) {
    this.element.innerHTML = html;
  }

  clear() {
    this.element.innerHTML = '';
  }

  isBoldActive() {
    return document.queryCommandState('bold');
  }

  isItalicActive() {
    return document.queryCommandState('italic');
  }

  isUnderlineActive() {
    return document.queryCommandState('underline');
  }
}
