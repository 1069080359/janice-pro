import { useState, useEffect } from 'react';
import { Input, Form } from 'antd';
import { BizForm, BizFormItem, BizModal } from '@/components';
import { InfoCircleOutlined } from '@ant-design/icons';
import { warnTip, Base64 } from '@mapzone/utils';
import Countdown from './countdown';
import { checkOldPwd, resetPwd } from './service';
import { layout, validateMessages, rules, iconRender, trim } from './utils';
import type { FormItemProps } from 'antd';
import type { BizModalProps } from '@/components';
import type { FsFC } from '@mapzone/types';
import './style.less';

export type ChangePasswordModalProps = Omit<BizModalProps, 'onCancel'> & {
  open: boolean;
  onFinish?: () => void;
  onCancel: (manual: boolean) => void;
};

const ChangePasswordModal: FsFC<ChangePasswordModalProps> = (props) => {
  const { onFinish, open, onCancel } = props;
  const [show, setShow] = useState(false);
  const [oldPwdLoading, setOldPwdLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const oldPwdRules: FormItemProps['rules'] = [
    ...rules,
    {
      validator: async (_, value) => {
        try {
          if (!value) {
            return Promise.resolve();
          }
          setOldPwdLoading(true);
          const res = await checkOldPwd.abort().fetch({ old: Base64(Base64(value)) });
          setOldPwdLoading(false);
          if (res.data !== 'true') {
            return Promise.reject('原密码不正确');
          }
        } catch (e) {
          setOldPwdLoading(false);
        }
      },
    },
  ];

  const getPwdRules = (valueField: 'newPwd' | 'affPwd'): FormItemProps['rules'] => {
    return [
      ...rules,
      {
        validator: async () => {
          const { oldPwd, newPwd, affPwd } = form.getFieldsValue();
          const oldPwdValue = trim(oldPwd || '');
          const newPwdValue = trim(newPwd || '');
          const affPwdValue = trim(affPwd || '');
          if (newPwd && valueField === 'newPwd' && oldPwdValue === newPwdValue) {
            return Promise.reject('原密码与新密码不能相同');
          }
          if (!newPwd || !affPwd) {
            return Promise.resolve();
          }
          if (newPwdValue !== affPwdValue) {
            return Promise.reject('两次输入的密码不一致');
          }
        },
      },
    ];
  };

  const handleCancel = (manual: boolean = true) => {
    onCancel(manual);
  };

  const onOk = () => {
    setLoading(true);
    form
      .validateFields()
      .then(async (values) => {
        try {
          const res = await resetPwd({
            newPwd: Base64(Base64(values.newPwd)),
            oldPwd: Base64(Base64(values.oldPwd)),
          });
          if (res.data === 'true') {
            handleCancel(false);
            setShow(true);
          } else {
            warnTip('修改密码失败');
            setLoading(false);
          }
        } catch (e) {
          setLoading(false);
          warnTip('修改密码失败');
        }
      })
      .catch(() => setLoading(false));
  };

  const perform = () => {
    if (onFinish) {
      onFinish();
    }
  };

  useEffect(() => {
    if (form && open) {
      form.resetFields();
    }
  }, [form, open]);

  return (
    <>
      <BizModal
        title="修改密码"
        className="change-password-modal"
        maskClosable={false}
        open={open}
        zIndex={1001}
        width={400}
        okButtonProps={{ loading }}
        onOk={onOk}
        onCancel={() => handleCancel(true)}
      >
        <BizForm {...layout} form={form} validateMessages={validateMessages}>
          <BizFormItem name="oldPwd" label="原密码" rules={oldPwdRules} validateTrigger="onBlur">
            <Input.Password placeholder="请输入原密码" iconRender={(v) => iconRender(v, oldPwdLoading)} />
          </BizFormItem>
          <BizFormItem name="newPwd" label="新密码" rules={getPwdRules('newPwd')} dependencies={['affPwd']}>
            <Input.Password placeholder="请输入新密码" iconRender={iconRender} />
          </BizFormItem>
          <BizFormItem name="affPwd" label="确认密码" rules={getPwdRules('affPwd')} dependencies={['newPwd']}>
            <Input.Password placeholder="请输入确认密码" iconRender={iconRender} />
          </BizFormItem>
        </BizForm>
      </BizModal>
      <BizModal className="tip-modal" maskClosable={false} width={360} open={show} title={null} footer={null} closable={false}>
        <InfoCircleOutlined />
        修改密码成功，
        {show && <Countdown count={5} perform={perform} />}
        后跳转到登录页。
      </BizModal>
    </>
  );
};

export default ChangePasswordModal;
