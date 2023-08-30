import { useEffect } from 'react';
import { useModel, useOutlet } from '@umijs/max';
import { Button, ConfigProvider, Spin, message } from 'antd';
// import { Authentication } from '@mapzone/hooks';
import moment from 'moment';
import { UploadOutlined } from '@ant-design/icons';
// import { ConfigProvider as MzConfigProvider } from '@mapzone/config-provider';
// import { getUserInfo } from '@mapzone/utils';
import { getWebAppConfig } from '@/utils';
// import { errorHandle, localProps, getWebAppConfig } from '@/utils';
import { getUserResources } from '@/services';
import zhCN from 'antd/es/locale/zh_CN';
import type { AuthenticationProps } from '@mapzone/hooks';
import type { TAppConfig } from '@mapzone/utils';
import 'moment/locale/zh-cn';
import { localUserInfo } from '@/utils/account/local-user-info';

moment.locale('zh-cn');

// const defaultConfig = { addAppPrefix: false, addCurrentUrl: true };
const transformAppConfig = () => {
  const webAppConfig = getWebAppConfig();
  const appConfig: TAppConfig = {
    prefix: webAppConfig.serviceSettings.apiBaseUrl,
    proxyFileServerUrl: `${webAppConfig.serviceSettings.fileServer.fileUrl}`,
    geoLocation: {
      ...webAppConfig.serviceSettings.geoLocation,
      addAppPrefix: false,
    },
  };
  return { ...webAppConfig.serviceSettings, ...appConfig };
};

const UpdateUserInfo = () => {
  const { setInitialState } = useModel('@@initialState');

  useEffect(() => {
    // const userInfo = getUserInfo();
    // console.log(userInfo);

    setInitialState((preInitialState) => ({
      ...preInitialState,
      userInfo: localUserInfo,
    }));
  }, []);
  return <></>;
};

const UserAuthentication = () => {
  const outlet = useOutlet();

  const useConfigProps: AuthenticationProps['useConfigProps'] = {
    // 异常处理
    errorHandle: (params) => {},
    // 设置应用配置
    getAppConfig: () => transformAppConfig(),
    // 获取用户权限
    getUserFunctions: async (params) => {
      const formData = new FormData();
      formData.append('username', params.userInfo.username);
      const res = await getUserResources(formData).catch(() => undefined);

      if (res) {
        if (res.success && Array.isArray(res.datas)) {
          return res.datas.map((v) => v.functionBH);
        }
        if (res.code === '1042') {
          //|| res.code === '1044'
          // errorHandle(res.code);
          return [];
        }
        if (!res.success) {
          message.error(`获取用户权限错误，${res.msg}`);
          return [];
        }
      }
      return [];
    },
    // ...localProps(),
  };

  // 配置校验规则，决定children什么时候渲染，只有配置required为true的所有属性都有值时才渲染Layout
  const rules: AuthenticationProps['rules'] = {
    appConfig: { required: true },
    userInfo: { required: true },
    functionNames: { required: true },
  };

  const loadingNode = (
    <div className="loading-container">
      <Spin size="large" tip="用户信息获取中..." />
    </div>
  );

  return (
    <ConfigProvider locale={zhCN}>
      {/* <Authentication useConfigProps={useConfigProps} rules={rules} loadingNode={loadingNode}> */}
      <UpdateUserInfo />
      {/* <MzConfigProvider
        value={{
          selectToolProps: { showSelectionsAttrTableFunc: () => false },
          mzForm: {
            select: { displayValueInLabel: false },
            renderUploadBtn: ({ text, loading }) => (
              <Button icon={<UploadOutlined />} loading={loading ? { delay: 300 } : false}>
                {text}
              </Button>
            ),
          },
        }}
      > */}
      {outlet}
      {/* </MzConfigProvider> */}
      {/* </Authentication> */}
    </ConfigProvider>
  );
};

export default UserAuthentication;
