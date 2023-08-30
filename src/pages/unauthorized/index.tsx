import { Result, Button } from 'antd';
import { getWebAppConfig } from '@/utils';
// import { logout, getWebAppConfig } from '@/utils';
import type { FsFC } from '@mapzone/types';

const UnauthorizedPage: FsFC = () => {
  const webappConfig = getWebAppConfig();

  return (
    <Result
      title="没有权限"
      subTitle="抱歉，你没有权限访问此页面。"
      extra={
        <>
          {webappConfig.appSettings.homeUrl && (
            <Button type="primary" onClick={() => (window.location.href = webappConfig.appSettings.homeUrl!)}>
              返回首页
            </Button>
          )}
          <Button type="primary">退出</Button>
        </>
      }
    />
  );
};

export default UnauthorizedPage;
