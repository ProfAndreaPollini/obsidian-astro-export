
export interface AstroPublishSettings {
	outContentFolder: string;
	isWorking: boolean;
	foldersToWatch: string[];
	exportProperty: string;
}

export const DEFAULT_SETTINGS: AstroPublishSettings = {
	outContentFolder: 'default',
	isWorking: false,
	foldersToWatch: ['default'],
	exportProperty: 'default',
}
