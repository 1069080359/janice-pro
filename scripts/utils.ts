import { dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

export const createEsRequire = (url: string) => createRequire(url);

export const getDirname = (url: string) => dirname(fileURLToPath(url));

export const execAsync = async (command: string, options: Record<string, any> = {}) => {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command) : undefined;
  return await import('child_process').then((r) => r.spawnSync(cmd, cmdArgs, options));
};
