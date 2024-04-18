import { Notice } from 'obsidian';

export default class Notifications {
  prefix = 'Readwise Atoms: ';

  constructor() {}

  public notice(message: string) {
    new Notice(this.prefix + message);
  }
}
