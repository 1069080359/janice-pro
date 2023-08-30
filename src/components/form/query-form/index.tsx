import { useRef } from 'react';
import { Form, Space, Row, Col, Button } from 'antd';
import classNames from 'classnames';
import type { FormInstance } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { BizQueryFormProps } from './types';
import './index.less';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

const prefixCls = 'biz-query-form';

export const BizQueryForm: FsFC<BizQueryFormProps> = (props) => {
  const {
    showActions = true,
    okText = '查询',
    okType = 'primary',
    resetText = '重置',
    children,
    onResetMethod,
    className,
    showReset = true,
    unspacingTheForm = true,
    isPeerPresentation = false,
    formRowProps = {},
    extratActions = [],
    ...restProps
  } = props;

  const formRef = useRef<FormInstance>(null);
  const { className: rowClassName, ...restRowProps } = formRowProps;

  const onReset = () => {
    if (formRef.current) {
      formRef.current.resetFields();
    }
    if (onResetMethod) {
      onResetMethod();
    }
  };

  const renderButton = () => (
    <Row
      className={classNames(`${prefixCls}-row`, rowClassName, {
        'mz-query-form-not-padding': unspacingTheForm,
      })}
      {...restRowProps}
    >
      {children}
      {showActions && (
        <Col className={`${prefixCls}-actions`}>
          <Space>
            <Button type={okType} icon={<SearchOutlined />} htmlType="submit" className="form-submit-btn">
              {okText}
            </Button>
            {showReset && (
              <Button htmlType="button" icon={<ReloadOutlined />} type="default" className="form-reset-btn" onClick={onReset}>
                {resetText}
              </Button>
            )}
            {extratActions.map((action) => action)}
          </Space>
        </Col>
      )}
    </Row>
  );

  return (
    <Form className={classNames(prefixCls, className)} ref={formRef} {...restProps}>
      {isPeerPresentation ? <Form.Item>{renderButton()}</Form.Item> : renderButton()}
    </Form>
  );
};

export type { BizQueryFormProps };
