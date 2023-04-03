
export interface AstroPublishSettings {
	outContentFolder: string;
	isWorking: boolean;
	foldersToWatch: string[];
}

export const DEFAULT_SETTINGS: AstroPublishSettings = {
	outContentFolder: 'default',
	isWorking: false,
	foldersToWatch: ['default'],
}
