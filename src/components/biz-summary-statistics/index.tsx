import { useRef } from 'react';
import { Button } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import LazyStatisticsModal from './modal';
import type { FsFC, TMetadata } from '@mapzone/types';
import type { TLazyStatisticsModalRef, TLazyStatisticsModal } from '@mapzone/types';
import type { IFsMap } from '@mapzone/map-kit';

export type BizSummaryStatisticsProps = {
  fsMap: IFsMap;
  /** 表名 */
  tableName: string;
  /** 图层id */
  layerId: string;
  /** 筛选条件 */
  filter?: string;
  /** 筛选条件 */
  geometry?: string;
  /** 元数据列表 */
  metadataList: TMetadata[];
} & Pick<TLazyStatisticsModal, 'groupFilter' | 'summaryFilter' | 'excludeTablePk' | 'getStatisticsDatas'>;

/** 分类汇总 */
const BizSummaryStatistics: FsFC<BizSummaryStatisticsProps> = (props) => {
  const { fsMap, tableName, layerId, filter, geometry, metadataList, ...restProps } = props;
  const lazyStatisticsModalRef = useRef<TLazyStatisticsModalRef>(null);

  const showSummaryStatisticsModal = () => {
    lazyStatisticsModalRef.current?.setVisible({
      visible: true,
      filterParams: {
        tableName,
        layerId,
        queryFilter: { filter, geometry },
      },
      fieldDataList: metadataList,
    });
  };

  return (
    <>
      <Button icon={<BarChartOutlined />} onClick={showSummaryStatisticsModal}>
        汇总统计
      </Button>
      <LazyStatisticsModal {...restProps} ref={lazyStatisticsModalRef} fsMap={fsMap} layerId={layerId} />
    </>
  );
};

export { BizSummaryStatistics };
