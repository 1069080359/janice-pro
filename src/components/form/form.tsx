import { Form } from 'antd';
import classNames from 'classnames';
import type { FormProps } from 'antd';
import type { FsFC } from '@mapzone/types';

const prefixCls = 'biz-form';

export type MzFormProps = FormProps;

const BizForm: FsFC<MzFormProps> = (props) => {
  const { className, ...restProps } = props;

  return <Form className={classNames(prefixCls, className)} {...restProps} />;
};

export default BizForm;
