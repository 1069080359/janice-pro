import type { QualityCheckProps } from '@mapzone/types';
import type { LayerItem } from './quality-check/types';

export type BizQualityCheckProps = {
  openAttributeTable: () => void;
  layerList: LayerItem[];
} & Pick<QualityCheckProps, 'fsMap'>;
