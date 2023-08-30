import { Position } from '@mapzone/position';
import { MapSelectTool, MapEditTool } from '@mapzone/map-toolset';
import { DcMap, XzMap, QpMap, Qc1Map, JlMap, ZbdwMap, Bj1Base } from '@mapzone/icons';
import { ClearTool } from '../clear-tool';
import type { TListItem } from '@mapzone/types';

export type UseCustomToolList = () => {
  customToolList: TListItem[];
};

const useCustomToolList: UseCustomToolList = () => {
  const customToolList: TListItem[] = [
    {
      key: 'bj',
      title: '编辑',
      icon: <Bj1Base />,
      checked: false,
      showPanel: false,
      isTool: true,
      ToolComponent: MapEditTool,
    },
    {
      key: 'xzj',
      title: '选择',
      icon: <XzMap />,
      checked: false,
      showPanel: false,
      isTool: true,
      ToolComponent: MapSelectTool,
    },
    {
      key: 'dc',
      title: '点查',
      icon: <DcMap />,
      checked: false,
      showPanel: false,
      isTool: true,
    },
    {
      key: 'zbdw',
      title: '定位',
      icon: <ZbdwMap />,
      checked: false,
      showPanel: true,
      Component: Position,
    },
    {
      key: 'jl',
      title: '卷帘',
      icon: <JlMap />,
      checked: false,
      showPanel: false,
    },
    {
      key: 'clear',
      title: '清除',
      icon: <Qc1Map />,
      checked: false,
      showPanel: false,
      isTool: true,
      ToolComponent: ClearTool,
    },
    {
      key: 'qp',
      title: '全屏',
      icon: <QpMap />,
      checked: false,
      showPanel: false,
    },
  ];

  return { customToolList };
};

export default useCustomToolList;
