import { loadSettings } from './settings';

export const settings = loadSettings(process.cwd(), process.env.APP_ENV, process.env.APP_CONFIG_OVERLAY);
