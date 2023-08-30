import { paramEncryption, getUserInfo } from '@mapzone/utils';
import { batchUseInterceptor, imageRealTimeRequest, request } from '@mapzone/request';
import { getWebAppConfig } from '../utils';
// import { errorHandle } from './utils';

export const configRequestInterceptors = () => {
  request.interceptors.response.use(async (response) => {
    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.clone().json();
        if (data.code === '1042' || data.code === '1044') {
          // errorHandle(data.code);
        }
      }
    } catch (e) {
      console.log(e);
    }
    return response;
  });

  batchUseInterceptor(
    [
      {
        reqInterceptor: (url, options) => {
          const userInfo = getUserInfo() || {
            userId: '',
            account: '',
            userName: '',
          };
          const webAppConfig = getWebAppConfig();
          const appParams: Record<string, any> = {
            appCode: webAppConfig.appSettings.webAppId || '',
            userId: userInfo.userid,
            account: userInfo.username,
            userName: userInfo.realname,
          };

          return {
            url,
            options: {
              ...options,
              headers: {
                ...options.headers,
                'X-Requested-With': 'FetchHttpRequest',
                'Application-Parameter': JSON.stringify(paramEncryption(appParams)),
              },
            },
          };
        },
      },
    ],
    [imageRealTimeRequest],
  );
};
