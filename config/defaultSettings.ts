import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
  primaryColor: string;
} = {
  // 拂晓蓝
  primaryColor: '#0daa70',
  layout: 'side',
  theme: 'light',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  siderWidth: 210,
  colorWeak: false,
  title: 'Janice 专属',
  menuProps: { theme: 'dark' },
  logo: 'logo.svg',
  menu: { locale: false },
};

export default Settings;
