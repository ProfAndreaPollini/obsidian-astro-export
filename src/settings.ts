import { App, PluginSettingTab, Setting } from "obsidian";
import AstroPublishPlugin from "./main";


export default class AstroPublishSettingTab extends PluginSettingTab {
	plugin: AstroPublishPlugin;

	constructor(app: App, plugin: AstroPublishPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Astro Publish plugin.'});

		new Setting(containerEl)
			.setName('Output Folder')
			.setDesc('select the folder where the output will be generated')
			.addText(text => text
				.setPlaceholder('output floder base path')
				.setValue(this.plugin.settings.outContentFolder)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.outContentFolder = value;
					await this.plugin.saveSettings();
				}));
	
		new Setting(containerEl)
			.setName('Folders to watch')
			.setDesc('select the folders to watch for changes')
			.addText(text => text
				.setPlaceholder('folders to watch')
				.setValue(this.plugin.settings.foldersToWatch.join(", "))
				.onChange(async (value) => {
					console.log('Secret: ' + value + " | " + value.split(",").map((s) => s.trim()) );
					this.plugin.settings.foldersToWatch = value.split(",").map((s) => s.trim());
					await this.plugin.saveSettings();
				}
			));
	}
}
