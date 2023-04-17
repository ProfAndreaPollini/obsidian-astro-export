import { App, PluginSettingTab, Setting } from "obsidian";
import AstroPublishPlugin from "./main";

import i18next from 'i18next';

import fs from "fs"
import path from "path"

const t = (key: string) => i18next.t(key);

export default class AstroPublishSettingTab extends PluginSettingTab {
	plugin: AstroPublishPlugin;
	plugin_ok: HTMLDivElement;

	constructor(app: App, plugin: AstroPublishPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		
		
	}	

	updateWorkingStatus(): void {
		const {containerEl} = this;
		if(this.plugin.settings.isWorking) {
			
			this.plugin_ok.setText(t("Plugin is working."));
		} else {
			this.plugin_ok.setText(t("Plugin is not working. Please check the settings."));
		}
		this.plugin_ok.toggleClass("astro_plugin__danger", !this.plugin.settings.isWorking);
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		
		containerEl.createEl('h2', {text: t("Settings for Astro Exporter plugin.")});
		this.plugin_ok  = containerEl.createDiv({text: ''});
		
		this.updateWorkingStatus();
	

		new Setting(containerEl)
			.setName(t("output folder"))
			.setDesc(t("select the base path the astro project you want to export to."))
			.addText(text => text
				.setPlaceholder(t("output folder absolute path"))
				.setValue(this.plugin.settings.outContentFolder)
				.onChange(async (value) => {
					
					this.plugin.settings.outContentFolder = value;
					
					this.plugin.settings.isWorking = fs.existsSync(path.join(value,"astro.config.mjs")) || fs.existsSync(path.join(value,"astro.config.js"))
					this.updateWorkingStatus();
					await this.plugin.saveSettings();
				}));
	
		new Setting(containerEl)
			.setName(t("Folders to watch"))
			.setDesc(t("Select the folders to watch for changes,comma separated."))
			.addText(text => text
				.setPlaceholder(t("folders names, comma separated"))
				.setValue(this.plugin.settings.foldersToWatch.join(", "))
				.onChange(async (value) => {
					
					this.plugin.settings.foldersToWatch = value.split(",").map((s) => s.trim());
					await this.plugin.saveSettings();
				}
			));

		new Setting(containerEl)
			.setName(t("Frontmatter property to activate export"))
			.setDesc(t("Select the property to use to activate export."))
			.addText(text => text
				.setPlaceholder(t("property name"))
				.setValue(this.plugin.settings.exportProperty)
				.onChange(async (value) => {
					
					this.plugin.settings.exportProperty = value;
					await this.plugin.saveSettings();
				}
			));
	}
}
