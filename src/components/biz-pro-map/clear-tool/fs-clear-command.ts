/*
 * @Description: 空状态 工具
 */
import { FsBaseQueryTool } from '@mapzone/map-kit';
import type { IFsBaseQueryTool, TFsBaseQueryToolProps } from '@mapzone/map-kit';

export type IFsClearTool = IFsBaseQueryTool;

type TFsClearToolProps = Omit<TFsBaseQueryToolProps, 'name' | 'type'>;

interface IFsClearToolStatic {
  new (props: TFsClearToolProps): IFsClearTool;
}

const ClearToolStatic: IFsClearToolStatic = class ClearTool extends FsBaseQueryTool implements IFsClearTool {
  constructor(props: TFsClearToolProps) {
    super({ ...props, name: 'fs-clear-tool', type: 'fs-command' });
  }

  /**
   * 判断工具是否可用 true 可用  false 不可用
   */
  isEnable() {
    return this.toolIsEnable();
  }

  /**
   * 启动、关闭工具
   * @param {Boolean} bool true|fase 启动|关闭
   */
  exec() {
    return new Promise((resolve) => {
      super.exec();
      this.fsMap.selections.clear();
      this.fsMap.changeCursorStyle('fs_cursor_move');
      resolve(true);
    });
  }
};

export default ClearToolStatic;
