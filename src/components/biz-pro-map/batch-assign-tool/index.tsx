import { useRef, useState } from 'react';
import FsBatchAssignCommand from './fs-batch-assign-command';
import { useSelectionsWithState } from '@mapzone/map-toolset';
import { BizBatchAssiModal } from '../../biz-batch-assi';
import type { MouseEvent } from 'react';
import type { FsFC } from '@mapzone/types';
import type { UnoinBaseToolProps } from '@mapzone/types';
import type { BizBatchAssiModalProps } from '../../biz-batch-assi';
import type { IFsBatchAssignCommand } from './fs-batch-assign-command';

export type BatchAssignProps = UnoinBaseToolProps;

const toolName = 'fs-batch-assign-command';

export const BatchAssignTool: FsFC<BatchAssignProps> = (props) => {
  const { fsMap, children, className } = props;
  const divRef = useRef<HTMLDivElement>(null);
  const [batchAssignProps, setBatchAssignProps] = useState<BizBatchAssiModalProps>();

  const [{ disabled }, batchAssignTool] = useSelectionsWithState<IFsBatchAssignCommand>({
    ...props,
    fsMap,
    initialValue: fsMap.fsTools[toolName] as IFsBatchAssignCommand,
    mount: () => new FsBatchAssignCommand({ fsMap }),
  });

  const onBatchAssignModalCancel = () => {
    setBatchAssignProps(undefined);
  };

  const onBatchAssignModalOK: Required<BizBatchAssiModalProps>['onOk'] = async (params) => {
    const { layerId } = batchAssignTool.currentEditLayer!;
    const features = await batchAssignTool.currentEditLayer!.getFeatureByIds(params.selectedKeys);
    fsMap.event.emit('updateLayerFeatureProps', {
      layerId,
      addOrEditIds: params.selectedKeys,
      features,
    });
    onBatchAssignModalCancel();
  };

  const onToolClick = (e: MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.stopPropagation();
      return;
    }
    const layer = batchAssignTool.currentEditLayer!;
    const { tableName, primaryKey } = layer;
    const selections = fsMap.selections.getSelections();
    const selectedKeys = selections.map((f) => {
      const featureProps = f.getProperties();
      return featureProps[primaryKey];
    });
    setBatchAssignProps({
      tableName,
      selectedKeys,
      recordCount: 0,
      open: true,
    });
  };

  return (
    <>
      <div ref={divRef} className={className} onClick={onToolClick}>
        {children}
      </div>
      {batchAssignProps && (
        <BizBatchAssiModal showUpdateAll={false} {...batchAssignProps} onCancel={onBatchAssignModalCancel} onOk={onBatchAssignModalOK} />
      )}
    </>
  );
};
