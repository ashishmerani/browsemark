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

// Allowlist of valid config keys — prevents arbitrary key pollution via POST /api/config
export const VALID_CONFIG_KEYS: ReadonlySet<string> = new Set(Object.keys(defaultConfig));

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
  // Strip unknown keys — only allowlisted config properties are persisted
  const sanitized: Partial<Config> = {};
  for (const key of Object.keys(newConfig)) {
    if (VALID_CONFIG_KEYS.has(key)) {
      (sanitized as Record<string, unknown>)[key] = (newConfig as Record<string, unknown>)[key];
    }
  }
  const currentConfig = getConfig();
  const updatedConfig = { ...currentConfig, ...sanitized };
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
};
