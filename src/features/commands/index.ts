import ReadwiseAtoms from 'src/main';

export default class Commands {
  constructor() {}

  public async sync(plugin: ReadwiseAtoms) {
    try {
      const highlights = await plugin.readwise.getHighlights();
      await plugin.synchronize.syncHighlights(highlights);
    } catch (error) {
      plugin.notifications.notice('synchronization error: ' + error.message);
    }
  }
}
