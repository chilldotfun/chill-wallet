import encryptor from 'browser-passworder';
import EventEmitter from 'events';

import { ErrorObject } from '@/popup/background/service';

class PassworderController extends EventEmitter {
  encryptor: typeof encryptor = encryptor;
  constructor() {
    super();
  }

  encrypt = async (password: string, secrets: string) => {
    try {
      return await this.encryptor.encrypt(password, secrets);
    } catch (error) {
      throw new Error((error as ErrorObject).message || 'Error encrypting password');
    }
  };

  decrypt = async (password: string, encrypted: string) => {
    try {
      return await this.encryptor.decrypt(password, encrypted);
    } catch (error) {
      throw new Error((error as ErrorObject).message || 'Error decryption password');
    }
  };
}

export default new PassworderController();
