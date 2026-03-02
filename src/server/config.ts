import fs from 'fs';
import path from 'path';
import os from 'os';

export interface Config {
  fontFamily: string;
  fontFamilyMonospace: string;
  fontSize: number;
  theme: string
  syntaxHighlighterTheme: string;
}

const defaultConfig: Config = {
  fontFamily: 'Inter',
  fontFamilyMonospace: 'JetBrains Mono',
  fontSize: 16,
  theme: 'default',
  syntaxHighlighterTheme: 'auto',
};

const configDir = path.join(os.homedir(), '.config', 'browsemark');
const configPath = path.join(configDir, 'config.json');
const legacyConfigPath = path.join(os.homedir(), '.config', 'markdown-vault', 'config.json');

export const getConfig = (): Config => {
  // Migrate from legacy config path if new path doesn't exist yet
  if (!fs.existsSync(configPath) && fs.existsSync(legacyConfigPath)) {
    fs.mkdirSync(configDir, { recursive: true });
    fs.copyFileSync(legacyConfigPath, configPath);
  }

  if (!fs.existsSync(configPath)) {
    return defaultConfig;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return { ...defaultConfig, ...config };
};

export const saveConfig = (newConfig: Partial<Config>): void => {
  const currentConfig = getConfig();
  const updatedConfig = { ...currentConfig, ...newConfig };
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
};
