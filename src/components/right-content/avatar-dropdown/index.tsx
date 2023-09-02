import { useState } from 'react';
import { Link, useModel } from '@umijs/max';
import { EditOutlined, LogoutOutlined, SnippetsOutlined, UserOutlined } from '@ant-design/icons';
import { Spin, Dropdown, Avatar } from 'antd';
// import { logout } from '@/utils';
import ChangePasswordModal from '../change-password-modal';
import type { MenuProps } from 'antd';
import type { FsFC } from '@mapzone/types';
import './style.less';

const prefixCls = 'avatar-dropdown';

export const AvatarDropdown: FsFC = () => {
  const [changePwdModalOpen, setChangePwdModalOpen] = useState<boolean>(false);
  const { initialState = {} } = useModel('@@initialState');
  const { userInfo } = initialState;

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    switch (key) {
      case 'logout':
        // logout();
        break;
      case 'edit-password':
        setChangePwdModalOpen(true);
        break;
      case 'yzq':
        window.open('https://1069080359.github.io/little-baby/', '_blank');
        break;
      case 'versionlog':
        break;
      default:
        break;
    }
  };

  const loading = (
    <span>
      <Spin
        size="small"
        style={{
          marginLeft: '8px',
          marginRight: '8px',
        }}
      />
    </span>
  );

  if (!userInfo || !userInfo.realname) {
    return loading;
  }

  const items: Required<MenuProps>['items'] = [
    // {
    //   key: 'versionlog',
    //   label: (
    //     <Link to="/versionlog" target="_blank">
    //       版本说明
    //     </Link>
    //   ),
    //   icon: <SnippetsOutlined />,
    // },
    // {
    //   key: 'edit-password',
    //   label: '修改密码',
    //   icon: <EditOutlined />,
    // },
    {
      key: 'yzq',
      label: `孕周期`,
    },
    {
      type: 'divider',
    },
    // {
    //   key: 'logout',
    //   label: '退出登录',
    //   icon: <LogoutOutlined />,
    // },
    {
      key: 'version',
      label: `版本号：v${WEBAPP_VERSION}`,
    },
  ];

  return (
    <>
      <Dropdown menu={{ items, onClick: onMenuClick }} className={prefixCls}>
        <span>
          <Avatar size="small" className="biz-avatar" icon={<UserOutlined />} alt="avatar" />
          <span className="biz-avatar-name">{userInfo.realname}</span>
        </span>
      </Dropdown>
      {/* <ChangePasswordModal open={changePwdModalOpen} onCancel={() => setChangePwdModalOpen(false)} onFinish={logout} /> */}
    </>
  );
};
