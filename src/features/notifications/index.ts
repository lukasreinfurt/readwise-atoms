import { Notice } from 'obsidian';

export default class Notifications {
  Notice = Notice;
  prefix = 'Readwise Atoms: ';

  constructor() {}

  public notice(message: string) {
    new this.Notice(this.prefix + message);
  }
}
