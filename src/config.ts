
export interface AstroPublishSettings {
	outContentFolder: string;
	foldersToWatch: string[];
}

export const DEFAULT_SETTINGS: AstroPublishSettings = {
	outContentFolder: 'default',
	foldersToWatch: ['default'],
}
