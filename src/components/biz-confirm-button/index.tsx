import { Button, Popconfirm } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import type { PopconfirmProps } from 'antd';
import type { FsFC } from '@mapzone/types';

type BizConfirmButtonProps = Omit<PopconfirmProps, 'title'> & {
  tipTitle: string;
  loading: boolean;
  disabled?: boolean;
  buttonText?: string;
};

const BizConfirmButton: FsFC<BizConfirmButtonProps> = (props) => {
  const { tipTitle, onConfirm, loading, buttonText = '确定', disabled } = props;
  return (
    <Popconfirm
      icon={<ExclamationCircleFilled style={{ color: '#FF0000' }} />}
      title={<span style={{ color: 'rgba(51, 51, 51, 1)' }}>{tipTitle}</span>}
      onConfirm={() => (!disabled ? onConfirm && onConfirm() : null)}
      okText="是"
      cancelText="否"
      cancelButtonProps={{ style: { backgroundColor: '#e8effb', color: '#2e7cef', borderColor: '#e8effb' } }}
      overlayStyle={{ width: '326px' }}
      disabled={disabled}
    >
      <Button type={!disabled ? 'primary' : 'default'} ghost={!!disabled} loading={loading} disabled={disabled}>
        {buttonText}
      </Button>
    </Popconfirm>
  );
};

export { BizConfirmButton };
