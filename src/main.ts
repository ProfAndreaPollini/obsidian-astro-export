import {
	App,
	Editor,
	FileSystemAdapter,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import i18next from 'i18next';

i18next.init({
	lng: translationLanguage,
	fallbackLng: "en",
	resources: ressources,
});

import { AstroPublishSettings, DEFAULT_SETTINGS } from "./config";
import AstroPublishSettingTab from "./settings";
// Remember to rename these classes and interfaces!

import path from "path";
import nodewatch from "node-watch";
import { processFile } from "./commands";
import { ressources, translationLanguage } from "./i18next";

function getVaultAbsolutePath(app: App) {
	let adapter = app.vault.adapter;
	if (adapter instanceof FileSystemAdapter) {
		return adapter.getBasePath();
	}
	return "";
}

function isWatchingFolder(folder: string, settings: AstroPublishSettings) {
	return settings.foldersToWatch.includes(folder);
}

export default class AstroPublishPlugin extends Plugin {
	settings: AstroPublishSettings = {} as AstroPublishSettings;

	async onload() {
		await this.loadSettings();


		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AstroPublishSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		new Notice(getVaultAbsolutePath(this.app));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(
		// 	window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		// );
		// nodewatch(getVaultAbsolutePath(this.app), { recursive: true }, function(evt, name) {
		// 	// console.log('%s changed.', name);
		// 	// console.log(`!! File evet ${evt}: ${name}`);
		// 	console.log(`this = ${this}`)
		// 	console.log(this.settings)
		// 	if (name.endsWith("md") && this.settings
		// 		.foldersToWatch.some((folder: string) => {
		// 			console.log(`!! File event ${evt}: ${name} ${folder} ${path.dirname(name).indexOf(folder) > -1}`);
		// 			// new Notice(`@@ File changed: ${path.dirname(name).indexOf(folder)} | ${folder} | path.dirname(name)`);
		// 			return path.dirname(name).indexOf(folder) > -1
		// 		})) { // if it is a folder in the watch list
		// 			console.warn(`!! PROCESSING: ${name}`);
		// 		// new Notice(`${name.split(path.sep).last()} - File changed: ${name}`);
		// 		processFile(name,this, this.settings)
		// 	}
		//   });
		nodewatch(
			getVaultAbsolutePath(this.app),
			{ recursive: true },
			this.onDocumentChange
		);
	}

	onDocumentChange = (evt: any, name: string) => {
		if (
			name.endsWith("md") &&
			this.settings.foldersToWatch.some((folder: string) => {
				console.log(
					`!! File event ${evt}: ${name} ${folder} ${
						path.dirname(name).indexOf(folder) > -1
					}`
				);
				return path.dirname(name).indexOf(folder) > -1;
			})
		) {
			// if it is a folder in the watch list
			console.warn(`!! PROCESSING: ${name}`);
			// new Notice(`${name.split(path.sep).last()} - File changed: ${name}`);
			processFile(name, this);
		}
	};

	startToWatch(settings: AstroPublishSettings) {
		new Notice(`>> Watching: ${this.settings.foldersToWatch}`);
		nodewatch(
			getVaultAbsolutePath(this.app),
			{ recursive: true },
			 (evt, name) => {
				// console.log('%s changed.', name);
				// console.log(`!! File evet ${evt}: ${name}`);
				// console.log(settings)
				if (
					name.endsWith("md") &&
					settings.foldersToWatch.some((folder: string) => {
						console.log(
							`!! File event ${evt}: ${name} ${folder} ${
								path.dirname(name).indexOf(folder) > -1
							}`
						);
						// new Notice(`@@ File changed: ${path.dirname(name).indexOf(folder)} | ${folder} | path.dirname(name)`);
						return path.dirname(name).indexOf(folder) > -1;
					})
				) {
					// if it is a folder in the watch list
					console.warn(`!! PROCESSING: ${name}`);
					// new Notice(`${name.split(path.sep).last()} - File changed: ${name}`);
					processFile(name, this );
				}
			}
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		console.warn("Settings loaded: ", this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
