import { PageContainer, ProBreadcrumb } from '@ant-design/pro-components';
import classNames from 'classnames';
import type { FsFC } from '@mapzone/types';
import type { BizPageContainerProps, TabBarExtraContent } from './types';
import './index.less';

const prefixCls = 'biz-page-container';

export type { BizPageContainerProps };

export const BizPageContainer: FsFC<BizPageContainerProps> = (props) => {
  const { className, tabBarExtraContentRight, ...restProps } = props;

  const tabBarExtraContent: TabBarExtraContent = {
    left: <ProBreadcrumb />,
    right: tabBarExtraContentRight,
  };

  return (
    <PageContainer
      title={false}
      breadcrumb={{}}
      tabBarExtraContent={tabBarExtraContent}
      className={classNames(prefixCls, className, { 'has-tabs': restProps.tabList?.length })}
      {...restProps}
    />
  );
};
