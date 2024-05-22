import { Notice } from 'obsidian';
import ReadwiseAtoms from 'src/main';

export default class Notifications {
  plugin: ReadwiseAtoms;
  Notice = Notice;
  prefix = 'Readwise Atoms: ';
  statusBarItem: HTMLElement;

  constructor(plugin: ReadwiseAtoms) {
    this.update(plugin);
    this.createStatusBarItem();
  }

  update(plugin: ReadwiseAtoms) {
    this.plugin = plugin;
  }

  public notice(message: string) {
    new this.Notice(this.prefix + message);
    this.log(message);
  }

  public log(message: string) {
    console.log(this.prefix + message);
  }

  public createStatusBarItem() {
    if (!this.plugin.isMobile && !this.statusBarItem) {
      this.statusBarItem = this.plugin.addStatusBarItem();
    }
  }

  public setStatusBarText(text: string, log = true) {
    if (!this.plugin.isMobile) {
      this.statusBarItem?.setText(text);
    }
    if (log) this.log(text);
  }
}
