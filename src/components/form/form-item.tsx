import { Form } from 'antd';
import classNames from 'classnames';
import type { FormItemProps } from 'antd';
import type { FsFC } from '@mapzone/types';

type BizFormItemProps = FormItemProps;

const prefixCls = 'biz-form-item';

const BizFormItem: FsFC<BizFormItemProps> = (props) => {
  const { className, ...restProps } = props;

  return <Form.Item className={classNames(prefixCls, className)} {...restProps} />;
};

export default BizFormItem;
