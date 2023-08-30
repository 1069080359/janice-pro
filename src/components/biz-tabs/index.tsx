import { Tabs } from 'antd';
import classNames from 'classnames';
import type { TabsProps } from 'antd';
import type { FsFC } from '@mapzone/types';
import './index.less';

export type BizTabsProps = TabsProps;
const prefixCls = 'biz-tabs';

const BizTabs: FsFC<BizTabsProps> = (props) => {
  const { className, activeKey, ...restProps } = props;
  return <Tabs className={classNames(prefixCls, activeKey, className)} size="small" activeKey={activeKey} {...restProps} />;
};

export { BizTabs };
