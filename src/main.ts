import { Notice, Plugin, TFile } from "obsidian";

const CSS_CLASS = "full-width";

export default class ToggleFullWidth extends Plugin {
  private statusBarEl!: HTMLElement;

  async onload() {
    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass("mod-clickable");
    this.registerDomEvent(this.statusBarEl, "click", () => {
      const file = this.app.workspace.getActiveFile();
      if (file) {
        this.toggleFullWidth(file);
      }
    });

    this.addCommand({
      id: "toggle-full-width",
      name: "Toggle full width",
      callback: () => {
        const file = this.app.workspace.getActiveFile();
        if (file) {
          this.toggleFullWidth(file);
        }
      },
    });

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.updateStatusBar();
      }),
    );

    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (file === this.app.workspace.getActiveFile()) {
          this.updateStatusBar();
        }
      }),
    );

    this.updateStatusBar();
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
        new Notice("Full width disabled");
      } else {
        classes.push(CSS_CLASS);
        new Notice("Full width enabled");
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
      this.statusBarEl.setText("");
      return;
    }

    const cache = this.app.metadataCache.getFileCache(file);
    const classes = cache?.frontmatter?.cssclasses;
    const isFullWidth = Array.isArray(classes)
      ? classes.includes(CSS_CLASS)
      : classes === CSS_CLASS;

    this.statusBarEl.setText(isFullWidth ? "↔ Full width" : "↔ Normal");
  }
}
