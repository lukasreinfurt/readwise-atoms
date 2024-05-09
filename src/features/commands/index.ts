import ReadwiseAtoms from 'src/main';

export default class Commands {
  constructor() {}

  public async sync(plugin: ReadwiseAtoms) {
    try {
      plugin.notifications.setStatusBarText('synchronizing');
      plugin.notifications.notice('synchronizing highlights');
      const highlights = await plugin.readwise.getHighlights();
      await plugin.synchronize.syncHighlights(highlights);
      plugin.notifications.notice('synchronization finished successfully');
      plugin.notifications.setStatusBarText('', false);
    } catch (error) {
      plugin.notifications.notice(`synchronization error: ${error.message}`);
      plugin.notifications.setStatusBarText('', false);
    }
  }
}
