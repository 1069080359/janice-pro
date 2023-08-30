import { useState } from 'react';
import { Button } from 'antd';
import { PlfzBase } from '@mapzone/icons';
import { BizBatchAssiModal } from './batch-assi-modal';
import type { ButtonProps } from 'antd';
import type { FsFC } from '@mapzone/types';
import type { BizBatchAssiModalProps } from './batch-assi-modal';

export type BizBatchAssiButtonProps = Omit<BizBatchAssiModalProps, 'open' | 'visible' | 'onCancel'> & {
  btnText?: string;
} & Pick<ButtonProps, 'type' | 'disabled' | 'size'>;

/** 批量赋值按钮 */
export const BizBatchAssiButton: FsFC<BizBatchAssiButtonProps> = (props) => {
  const { type = 'default', btnText = '批量赋值', onOk, disabled, size, ...restProps } = props;
  const [batchAssiModalOpen, setBatchAssiModalOpen] = useState<boolean>(false);

  const handleCancel = () => {
    setBatchAssiModalOpen(false);
  };

  const handleOk: BizBatchAssiModalProps['onOk'] = (params) => {
    if (onOk) {
      onOk(params);
    }
  };

  return (
    <>
      <Button
        type={type}
        icon={<PlfzBase />}
        className="mz-batch-assi"
        size={size}
        disabled={disabled}
        onClick={() => setBatchAssiModalOpen(true)}
      >
        {btnText}
      </Button>
      <BizBatchAssiModal open={batchAssiModalOpen} onCancel={handleCancel} onOk={handleOk} {...restProps} />
    </>
  );
};
