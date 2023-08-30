import { appRequest } from '@mapzone/request';
import { formatUserInfo, getWebAppConfig } from '@/utils';
import type { UserInfo } from '@mapzone/utils';
import type { ApiRes } from '@mapzone/types';

type Authority = {
  functionName: string;
  functionBH: string;
};

/** 获取用户权限标签 */
export const getUserResources = (data: Record<string, any>) => {
  const webappConfig = getWebAppConfig();
  const prefixUrl = webappConfig.serviceSettings.sso.type === 'sso' ? '/sso' : '/';
  return appRequest.post<ApiRes<Authority[]>>(`${prefixUrl}auth/getUserResources.do`, {
    data,
  });
};

/** 获取用户信息 */
export const getUserInfo = async () => {
  const res = await appRequest.post<ApiRes<UserInfo>>('/sso/getUserInfoByTicket.do');
  if (res && res.success) {
    res.datas = formatUserInfo(res.datas);
  }
  return res;
};

/** 根据ticket获取token */
export const doLoginByTicket = (params: string) => {
  return appRequest.get('/sso/doLoginByTicket?' + params);
};

/** 退出登录 */
export const logoutService = () => {
  return appRequest.get(`/sso/logout.do`);
};
