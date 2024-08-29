export default class Timer {
  private intervalId: number | null = null;
  private callback: (() => Promise<void>) | null = null;
  private interval: number = 0;

  constructor(callback: () => Promise<void>, interval: number) {
    this.callback = callback;
    this.interval = interval;
  }

  async start() {
    if (this.intervalId === null) {
      await this.executeCallback();
    } else {
      this.stop();
    }
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  private async executeCallback() {
    if (this.callback) {
      await this.callback();
      this.intervalId = window.setTimeout(() => this.executeCallback(), this.interval);
    }
  }

  reset(newInterval?: number) {
    this.stop();
    if (newInterval !== undefined) {
      this.interval = newInterval;
    }
    this.start();
  }
}
