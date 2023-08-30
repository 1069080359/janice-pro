import { Input } from 'antd';
import { BizModal } from '@/components';
import { prefixCls } from './utils';
import type { FsFC, ErrorInfoItem, RndModalProps } from '@mapzone/types';
import './style.less';

export type QualityCheckErrorDetailModalProps = Omit<RndModalProps, 'onOk'> & {
  errorInfo?: ErrorInfoItem;
};

const QualityCheckErrorDetailModal: FsFC<QualityCheckErrorDetailModalProps> = (props) => {
  const { errorInfo, ...restProps } = props;

  return (
    <BizModal
      mask={false}
      title="查看错误原因"
      width={600}
      belowClickable
      className={`${prefixCls}-error-detail-modal`}
      footer={false}
      {...restProps}
    >
      {errorInfo && (
        <>
          <p>检查规则【{errorInfo.name}】执行失败原因：</p>
          <Input.TextArea value={errorInfo.detail} rows={10} readOnly />
        </>
      )}
    </BizModal>
  );
};

export default QualityCheckErrorDetailModal;
