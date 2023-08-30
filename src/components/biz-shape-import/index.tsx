import { useState } from 'react';
import { ImportOutlined } from '@ant-design/icons';
import { BizImportButton } from '../biz-buttons';
import { ShapeImportModal } from './shape-import-modal';
import type { FsFC } from '@mapzone/types';
import type { ShapeImportModalProps } from './shape-import-modal';

export type BizShapeImportProps = {
  /** 导入成功回调 */
  onImportSuccess?: () => void;
} & Pick<ShapeImportModalProps, 'tableName' | 'allowMaxSize' | 'allowFeatureCount'>;

/** shape导入 */
const BizShapeImport: FsFC<BizShapeImportProps> = (props) => {
  const { onImportSuccess, ...restProps } = props;
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);

  const onImportModalCancel = () => {
    setImportModalOpen(false);
  };

  const onImportModalOk = () => {
    if (onImportSuccess) {
      onImportSuccess();
    }
    onImportModalCancel();
  };

  return (
    <>
      <BizImportButton icon={<ImportOutlined />} onClick={() => setImportModalOpen(true)}>
        Shape导入
      </BizImportButton>
      <ShapeImportModal {...restProps} open={importModalOpen} onOk={onImportModalOk} onCancel={onImportModalCancel} />
    </>
  );
};

export { BizShapeImport };
