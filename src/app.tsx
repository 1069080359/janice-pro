import { HeartTwoTone, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { SettingDrawer } from '@ant-design/pro-components';
import classNames from 'classnames';
import { simpleRequest } from '@mapzone/request';
import { setStoreageKeyPrefix } from '@mapzone/utils';
import { configRequestInterceptors, setWebAppConfig } from '@/utils';
import defaultSettings from '../config/defaultSettings';
import { RightContent } from './components/right-content';
import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-components';
import { Link, type RunTimeLayoutConfig } from '@umijs/max';
import type { FsFC } from '@mapzone/types';
import type { InitialState } from '@/types';
import type { ReactNode } from 'react';

// const isDev = process.env.NODE_ENV === 'development';

type CollapsedIconProps = {
  /** 当前收起状态 */
  collapsed: boolean;
  /** 展开-收起时的回调函数 */
  onCollapse: (collapsed: boolean) => void;
  /** 布局模式 */
  layout?: LayoutSettings['layout'];
};

const CollapsedIcon: FsFC<CollapsedIconProps> = (props) => {
  const { collapsed, onCollapse, layout } = props;

  if (layout === 'top') {
    return null;
  }

  return (
    <div className={classNames('biz-sider-collapsed-btn', { collapsed })} onClick={() => onCollapse(!collapsed)}>
      {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
    </div>
  );
};

// 利用对象进行图标映射
const iconMapping: Record<string, ReactNode> = {
  'menu-home': <HeartTwoTone />,
  'menu-sc': <HeartTwoTone />,
  'menu-bzgl': <HeartTwoTone />,
  'menu-scgl': <HeartTwoTone />,
  'menu-xmgl': <HeartTwoTone />,
  'menu-xntbgl': <HeartTwoTone />,
  'menu-xtgl': <HeartTwoTone />,
  'menu-zhyajgl': <HeartTwoTone />,
  'menu-zygl': <HeartTwoTone />,
};

const getIcon = (icon?: string | React.ReactNode): React.ReactNode => {
  if (typeof icon === 'string' && icon !== '') {
    // 可加入多种图标类型的兼容写法，此处省略
    if (icon.startsWith('menu-')) {
      return iconMapping[icon] || null;
    }
  }
  return icon;
};

const BizSubMenuItem: FsFC<MenuDataItem> = (menuItemProps) => {
  const { icon, name } = menuItemProps;
  const defaultTitle = icon ? (
    <span className="ant-pro-menu-item" title={name}>
      {getIcon(icon)}
      <span className="ant-menu-item-title">{name}</span>
    </span>
  ) : (
    <span className="ant-pro-menu-item" title={name}>
      {name}
    </span>
  );
  return defaultTitle;
};

const BizMenuItem: FsFC<MenuDataItem> = (menuItemProps) => {
  const { isUrl: isLink, path, icon, name } = menuItemProps;
  const itemContent = (
    <span className="ant-pro-menu-item">
      {getIcon(icon)}
      <span className="ant-menu-item-title">{name}</span>
    </span>
  );
  return isLink || !path || location.pathname === path ? itemContent : <Link to={path}>{itemContent}</Link>;
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<InitialState> {
  /** 获取应用配置 */
  // const getAppConfigJson = async () => {
  //   const res = await simpleRequest.get(`${PUBLIC_PATH}config/webapp-config.json?t=${Date.now()}`).catch(() => undefined);
  //   if (res && res.serviceSettings) {
  //     return res;
  //   }
  //   return {};
  // };

  // const webAppConfig = await getAppConfigJson();
  // const { webAppDeployPath } = webAppConfig.appSettings;
  // setStoreageKeyPrefix(webAppDeployPath.split('/').filter(Boolean).join('-'));
  // setWebAppConfig(webAppConfig);
  // configRequestInterceptors();

  return {
    loading: false,
    collapsed: false,
    // webAppConfig,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const onCollapse = (collapsed: boolean) => {
    setInitialState((preInitialState) => ({
      ...preInitialState,
      collapsed,
    }));
  };

  return {
    rightContentRender: () => <RightContent />,
    breadcrumbProps: {
      itemRender: (route) => route.breadcrumbName,
    },
    footerRender: false,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
    },
    headerContentRender(_props, defaultDom) {
      return (
        <div className="biz-header-content">
          <CollapsedIcon collapsed={!!initialState?.collapsed} onCollapse={onCollapse} layout={initialState?.settings?.layout} />
          <div>Janice 专属</div>
          {defaultDom}
        </div>
      );
    },
    collapsed: initialState?.collapsed,
    collapsedButtonRender: false,
    // collapsedButtonRender: (collapsed) => {
    //   return <CollapsedIcon collapsed={!!collapsed} onCollapse={onCollapse} />;
    // },
    subMenuItemRender: (menuItemProps: any) => <BizSubMenuItem {...menuItemProps} />,
    menuItemRender: (menuItemProps: any) => <BizMenuItem {...menuItemProps} />,
    onCollapse,
    onMenuHeaderClick: () => {},
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          <SettingDrawer
            hideHintAlert
            hideCopyButton
            disableUrlParams
            enableDarkTheme
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((preInitialState) => ({
                ...preInitialState,
                settings: { ...settings, contentWidth: 'Fluid' },
              }));
            }}
          />
        </>
      );
    },
    ...initialState?.settings,
  };
};
