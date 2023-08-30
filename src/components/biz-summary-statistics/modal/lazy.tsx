import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import StatisticsModal from './index';
import type {
  TLazyStatisticsModalRef,
  TStatisticsModalRef,
  TLazyStatisticsModal,
  IStatisticsModalRefSetVisibleParams,
} from '@mapzone/types';

const LazyStatistics = forwardRef<TLazyStatisticsModalRef, TLazyStatisticsModal>((props, ref) => {
  const statisticsModalRef = useRef<TStatisticsModalRef>(null);

  useImperativeHandle(ref, () => ({
    setVisible: (data: IStatisticsModalRefSetVisibleParams) => {
      statisticsModalRef.current?.setVisible(data);
    },
  }));
  return <StatisticsModal ref={statisticsModalRef} {...props} />;
});

export default LazyStatistics;
