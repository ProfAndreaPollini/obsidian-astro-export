import {moment} from "obsidian";
import * as en from "../locales/en.json";
import * as it from "../locales/it.json";

export const ressources = {
	it: { translation: it },
	en: { translation: en },
} as const;

export const translationLanguage = Object.keys(ressources).find(i => i==moment.locale()) ? moment.locale() : "en";
