import FsClearCommand from './fs-clear-command';
import { useMount } from '@mapzone/hooks';
import type { FsFC } from '@mapzone/types';
import type { BaseToolProps } from '@mapzone/types';
import type { IFsClearTool } from './fs-clear-command';
import './index.less';

export type ClearToolProps = BaseToolProps;

const toolName = 'fs-clear-command';

export const ClearTool: FsFC<ClearToolProps> = (props) => {
  const { fsMap, children } = props;

  const clearTool = useMount({
    fsMap,
    initialValue: fsMap.fsTools[toolName] as IFsClearTool,
    mount: () => {
      const value = new FsClearCommand({ fsMap });
      return value;
    },
  });

  const onToolClick = () => {
    clearTool.exec();
  };

  return (
    <div className="clear-tool-wrapper" onClick={onToolClick}>
      {children}
    </div>
  );
};
