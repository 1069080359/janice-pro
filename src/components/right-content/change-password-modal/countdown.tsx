import { useState } from 'react';
import { useRafInterval } from 'ahooks';
import type { FsFC } from '@mapzone/types';

type CountdownProps = {
  count: number;
  perform: () => void;
};

const Countdown: FsFC<CountdownProps> = (props) => {
  const { count, perform } = props;
  const [num, setNum] = useState(0);

  if (num === count) {
    perform();
  }

  useRafInterval(() => {
    setNum(num + 1);
  }, 1000);

  return <>{count - num}</>;
};

export default Countdown;
