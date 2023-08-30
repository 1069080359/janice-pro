import { existsSync, renameSync, rmSync } from 'fs';
import { join } from 'path';
import pkg from '../package.json';
import webAppConfig from '../config/webapp-config';
import { getDirname } from './utils';

const _dirname = getDirname(import.meta.url);

async function core() {
  const { webAppDeployPath } = webAppConfig.appSettings;
  const { WEBAPP_ENV = 'prod' } = process.env;
  const WEBAPP_VERSION: string = pkg.version;

  let outputPath = `dist-${WEBAPP_ENV}`;
  if (webAppDeployPath.length > 1) {
    const pathNames = webAppDeployPath.split('/').filter(Boolean);
    pathNames.push(WEBAPP_ENV);
    outputPath = pathNames.join('-');
  }
  const targetPath = `${outputPath}-v${WEBAPP_VERSION}`;

  const outputAbsPath = join(_dirname, '../', outputPath);
  const targetAbsPath = join(_dirname, '../', targetPath);
  if (existsSync(targetAbsPath)) {
    rmSync(targetAbsPath, { recursive: true, force: true });
  }
  if (existsSync(outputAbsPath)) {
    renameSync(outputAbsPath, targetAbsPath);
    console.log(`🌻 打包成功，文件夹：${targetPath}`);
  } else {
    console.error(`输出目录（${outputAbsPath}）不存在，重命名失败`);
  }
}

core();
