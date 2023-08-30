import { history } from '@umijs/max';
import { message } from 'antd';
import { UserInfo, removeAuthority, removeToken, setAppConfig, setUserInfo } from '@mapzone/utils';
import { getWebAppConfig } from '@/utils';
import { logoutService } from '@/services';
import { localUserInfo } from './local-user-info';

const getLoginUrl = () => {
  const webAppConfig = getWebAppConfig();
  const { sso, apiBaseUrl } = webAppConfig.serviceSettings;
  const loginUrl = sso.type === 'sso' ? `${sso.url}/login?redirect=` : `${apiBaseUrl}/sso/serviceValidate.do?client=`;
  return loginUrl;
};

export const errorHandle = (code: string, msg?: string) => {
  if (code === '1042') {
    const loginUrl = getLoginUrl();
    const url = `${loginUrl}${window.location.href}`;
    window.location.href = url;
  } else if (code === '1044') {
    history.push({ pathname: '/unauthorized' });
  } else if (msg) {
    message.error(msg);
  }
};

/** 开发环境解决获取用户信息cas重复登录问题 */
export const localProps = () => {
  const webAppConfig = getWebAppConfig();
  if (WEBAPP_ENV === 'local' && webAppConfig.serviceSettings.sso.type === 'cas') {
    return {
      getUserInfo: async () => localUserInfo,
    };
  }
  return {};
};

/** 退出登录 */
export const logout = async (type?: string) => {
  const locationUrl = type === 'no-auth' ? window.location.origin : window.location.href;
  const webAppConfig = getWebAppConfig();
  const { sso, apiBaseUrl } = webAppConfig.serviceSettings;
  const loginUrl = getLoginUrl();
  if (sso.type === 'sso') {
    const res = await logoutService();
    if (res?.success) {
      removeToken();
      window.location.href = `${loginUrl}${locationUrl}`;
    } else {
      message.error(res?.msg);
    }
  } else {
    setUserInfo();
    removeAuthority();
    setAppConfig();
    window.location.href = `${apiBaseUrl}/sso/logout.do?client=${locationUrl}`;
  }
};

/** 默认用户信息 */
const getDefaultUserInfo = () => ({
  realname: '',
  userid: '',
  username: '',
  sysCode: '',
  maskid: undefined,
  orgid: undefined,
  orgname: undefined,
  sysName: undefined,
});

/** 格式化用户信息 */
export const formatUserInfo = (userInfo: Record<string, any>) => {
  const defaultUserInfo = getDefaultUserInfo();
  const data = Object.keys(defaultUserInfo).reduce(
    (acc, key) => {
      const item = key === 'sysCode' ? userInfo[key] || userInfo.System_Code : userInfo[key];
      if (typeof item !== undefined) {
        acc[key] = item;
      }
      return acc;
    },
    { original: { ...userInfo } } as Record<string, any>,
  );
  return data as UserInfo;
};
