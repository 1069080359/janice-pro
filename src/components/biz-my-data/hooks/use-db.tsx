import { getUserInfo } from '@mapzone/utils';
import { getWebAppConfig } from '@/utils';
import { MyDataDatabase } from '../components/stores';

export default () => {
  const { appSettings } = getWebAppConfig();
  const userInfo = getUserInfo();
  const pathNames = appSettings.webAppDeployPath.split('/').filter(Boolean);

  return new MyDataDatabase({
    appName: pathNames.join('-'),
    userId: userInfo.userid,
  });
};
