import type { PageContainerProps } from '@ant-design/pro-components';

export type BizPageContainerProps = Omit<PageContainerProps, 'tabBarExtraContent'> & {
  tabBarExtraContentRight?: React.ReactNode;
};

type PositionType = 'left' | 'right';

export type TabBarExtraContent = Record<PositionType, React.ReactNode>;
