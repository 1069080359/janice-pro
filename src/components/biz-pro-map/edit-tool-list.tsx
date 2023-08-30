import { LdcjMap, SxlrMap, Xfg1Map, Hb1Map, XbMap, ScBase, FzMap, Cx2Map, XzfgMap, PlfzBase } from '@mapzone/icons';
import { MapAddTool, MapEditAttrTool, LineCut, Union, EdgeEdit, Delete, Copy, RedoUndo, SelectSplit } from '@mapzone/map-toolset';
import { BatchAssignTool } from './batch-assign-tool';
import type { EditToolItem } from '@mapzone/types';

export const selector = '.biz-map-container';

export const bizEditToolList: EditToolItem[] = [
  {
    key: 'fs-editAttribute-command',
    title: '属性录入',
    icon: <SxlrMap />,
    // @ts-ignore
    render: ({ node, ...restProps }) => <MapEditAttrTool {...restProps}>{node}</MapEditAttrTool>,
  },
  {
    key: 'fs-add-tool',
    title: '创建',
    icon: <LdcjMap />,
    effect: { active: true },
    render: ({ node, ...restProps }) => {
      return (
        // @ts-ignore
        <MapAddTool selector={selector} defaultPosition={{ x: 900, y: 54 }} {...restProps} wrapClassName="mz-add-tool-panel-wrap">
          {node}
        </MapAddTool>
      );
    },
  },
  {
    key: 'fs-delete-command',
    title: '删除',
    icon: <ScBase />,
    render: ({ node, ...restProps }) => <Delete {...restProps}>{node}</Delete>,
  },
  {
    key: 'fs-linecut-tool',
    title: '线分割',
    icon: <Xfg1Map />,
    render: ({ node, ...restProps }) => <LineCut {...restProps}>{node}</LineCut>,
  },
  {
    key: 'fs-edgeedit-tool',
    title: '修边',
    icon: <XbMap />,
    render: ({ node, ...restProps }) => <EdgeEdit {...restProps}>{node}</EdgeEdit>,
  },
  {
    key: 'fs-union-command',
    title: '合并',
    icon: <Hb1Map />,
    render: ({ node, ...restProps }) => <Union {...restProps}>{node}</Union>,
  },
  {
    key: 'fs-copy-command',
    title: '复制到',
    icon: <FzMap />,
    render: ({ node, ...restProps }) => <Copy {...restProps}>{node}</Copy>,
  },
  {
    key: 'fs-batch-assign',
    title: '批量赋值',
    icon: <PlfzBase />,
    render: ({ node, ...restProps }) => <BatchAssignTool {...restProps}>{node}</BatchAssignTool>,
  },
  {
    key: 'fs-selectsplit-command',
    title: '选中分割',
    icon: <XzfgMap />,
    render: ({ node, ...restProps }) => <SelectSplit {...restProps}>{node}</SelectSplit>,
  },
  {
    key: 'redo-undo',
    title: '撤销',
    icon: <Cx2Map />,
    render: ({ node, ...restProps }) => <RedoUndo {...restProps}>{node}</RedoUndo>,
  },
];
