/*
 * @Description: 批量赋值
 */
import { FsBaseEditTool } from '@mapzone/map-kit';
import type { IFsBaseEditTool, TFsBaseEditToolProps } from '@mapzone/map-kit';

export type IFsBatchAssignCommand = IFsBaseEditTool;

type FsBatchAssignCommandProps = Omit<TFsBaseEditToolProps, 'name' | 'type' | 'redoUndoType'>;

interface IFsBatchAssignCommandStatic {
  new (props: FsBatchAssignCommandProps): IFsBatchAssignCommand;
}

const FsBatchAssignCommandStatic: IFsBatchAssignCommandStatic = class FsDeleteCommand
  extends FsBaseEditTool
  implements IFsBatchAssignCommand
{
  constructor(props: FsBatchAssignCommandProps) {
    super({ ...props, name: 'fs-batch-assign-command', type: 'fs-command' });
  }

  /**
   * 选中大于等于图斑 且 选中的图斑属于一个图层 且 图层允许编辑
   * @returns 是否可以启用
   */
  async exec() {}

  /**
   * 选中大于等于一个图斑 且 选中的图斑属于一个图层 且 图层允许编辑
   * @returns 是否可以启用
   */
  isEnable() {
    this.enableErrorMsg = undefined;
    const selections = this.getFeatures();

    if (selections.length <= 0) {
      this.enableErrorMsg = '请至少选中一个要素！';
      return false;
    }
    const isSameLayer = this.fsMap.selections.isSameLayer();
    if (!isSameLayer) {
      this.enableErrorMsg = '选中的要素不属于同一个图层';
      return false;
    }
    const layerCanEdit = super.isEnable();
    if (!layerCanEdit) {
      this.enableErrorMsg = '选中要素所在的图层不可编辑';
      return false;
    }
    return this.toolIsEnable();
  }

  protected async _afterSaveHandler() {}
};

export default FsBatchAssignCommandStatic;
