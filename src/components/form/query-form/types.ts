import type { FormProps, ButtonProps, RowProps } from 'antd';
import type { ReactNode } from 'react';

export type BizQueryFormProps = FormProps & {
  /** 确认按钮文字 */
  okText?: string;
  /** 确认按钮类型 */
  okType?: ButtonProps['type'];
  /** 重置按钮文字 */
  resetText?: string;
  /** 是否显示重置 */
  showReset?: boolean;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  /** 重置事件 */
  onResetMethod?: () => void;
  /** 过滤表单行属性 */
  formRowProps?: RowProps;
  /** 取消表单的间距 */
  unspacingTheForm?: boolean;
  /** 按钮是否与表单同行展示 */
  isPeerPresentation?: boolean;
  /** 扩展操作 */
  extratActions?: ReactNode[];
};
