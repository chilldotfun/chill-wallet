import keysing from './index';

class LockTimerController {
  private defaultLockTime: number;
  constructor() {
    this.defaultLockTime = 60000;
  }

  async consideration(lockTime) {
    const lockTimeHistory = localStorage.getItem('lockTimeHistory');
    if (lockTimeHistory) {
      const time = parseFloat(lockTimeHistory);
      const now = new Date().getTime();

      if (now - time > lockTime * 1000) {
        keysing.lock();
      }
    }
  }
}

export const lockController = new LockTimerController();
