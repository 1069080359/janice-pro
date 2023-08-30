import RndModal from '@mapzone/modal';
import type { FsFC, RndModalProps } from '@mapzone/types';

export type BizModalProps = RndModalProps;

const BizModal: FsFC<BizModalProps> = (props) => {
  const { children, visible, ...options } = props;

  return (
    <RndModal open={visible} {...options}>
      {children}
    </RndModal>
  );
};

export { BizModal };
