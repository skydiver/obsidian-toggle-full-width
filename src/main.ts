import { App, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

const CSS_CLASS = 'full-width';
const WIDTH_OPTIONS = ['100%', '90%', '80%'] as const;
type WidthOption = (typeof WIDTH_OPTIONS)[number];

interface ToggleFullWidthSettings {
  width: WidthOption;
}

const DEFAULT_SETTINGS: ToggleFullWidthSettings = {
  width: '100%',
};

export default class ToggleFullWidth extends Plugin {
  settings!: ToggleFullWidthSettings;
  private statusBarEl!: HTMLElement;
  private styleEl!: HTMLStyleElement;

  async onload() {
    await this.loadSettings();

    this.styleEl = document.createElement('style');
    document.head.appendChild(this.styleEl);
    this.updateStyle();

    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass('mod-clickable');
    this.registerDomEvent(this.statusBarEl, 'click', () => {
      const file = this.app.workspace.getActiveFile();
      if (file) {
        this.toggleFullWidth(file);
      }
    });

    this.addCommand({
      id: 'toggle-full-width',
      name: 'Toggle full width',
      callback: () => {
        const file = this.app.workspace.getActiveFile();
        if (file) {
          this.toggleFullWidth(file);
        }
      },
    });

    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.updateStatusBar();
      })
    );

    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        if (file === this.app.workspace.getActiveFile()) {
          this.updateStatusBar();
        }
      })
    );

    this.addSettingTab(new ToggleFullWidthSettingTab(this.app, this));

    this.updateStatusBar();
  }

  onunload() {
    this.styleEl.remove();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.updateStyle();
  }

  private updateStyle() {
    this.styleEl.textContent = `.full-width { --file-line-width: ${this.settings.width}; }`;
  }

  async toggleFullWidth(file: TFile): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      let classes: string[] = [];

      if (frontmatter.cssclasses) {
        classes = Array.isArray(frontmatter.cssclasses)
          ? frontmatter.cssclasses
          : [frontmatter.cssclasses];
      }

      const index = classes.indexOf(CSS_CLASS);
      if (index >= 0) {
        classes.splice(index, 1);
      } else {
        classes.push(CSS_CLASS);
      }

      if (classes.length > 0) {
        frontmatter.cssclasses = classes;
      } else {
        delete frontmatter.cssclasses;
      }
    });
  }

  private updateStatusBar(): void {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      this.statusBarEl.setText('');
      return;
    }

    const cache = this.app.metadataCache.getFileCache(file);
    const classes = cache?.frontmatter?.cssclasses;
    const isFullWidth = Array.isArray(classes)
      ? classes.includes(CSS_CLASS)
      : classes === CSS_CLASS;

    this.statusBarEl.setText(isFullWidth ? '↔ Full width' : '↔ Normal');
  }
}

class ToggleFullWidthSettingTab extends PluginSettingTab {
  plugin: ToggleFullWidth;

  constructor(app: App, plugin: ToggleFullWidth) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Width')
      .setDesc('The width to use when full width is enabled.')
      .addDropdown((dropdown) => {
        for (const option of WIDTH_OPTIONS) {
          dropdown.addOption(option, option);
        }
        dropdown.setValue(this.plugin.settings.width);
        dropdown.onChange(async (value) => {
          this.plugin.settings.width = value as WidthOption;
          await this.plugin.saveSettings();
        });
      });
  }
}
