import EventEmitter from 'events';

import { keysingMessage } from './config';
class KeysingController extends EventEmitter {
  secretCode: string | null = null;
  constructor() {
    super();
  }

  messageConfirm(message: string) {
    return message === keysingMessage['get'] || message === keysingMessage['set'];
  }
  messageProcess(message, callback) {
    const key = message.type === keysingMessage['get'] ? 'GET' : 'SET';
    const dataValue = {};
    if (key === 'SET') {
      dataValue[keysingMessage['key']] = message.value;
    }
    callback(key, dataValue);
  }
  lock(): void {
    this.secretCode = null;
    chrome.runtime.sendMessage({ type: keysingMessage['set'], key: keysingMessage['key'], value: null });
  }
  booted(password: string): void {
    this.secretCode = password;
    chrome.runtime.sendMessage({ type: keysingMessage['set'], key: keysingMessage['key'], value: password });
  }
  getSecretCode() {
    chrome.runtime.sendMessage({ type: keysingMessage['get'], key: keysingMessage['key'] }, response => {
      this.secretCode = response?.value;
      this.emit('EventSecretCode', this.secretCode);
    });

    if (this.secretCode) return this.secretCode;
  }
}

export default new KeysingController();
