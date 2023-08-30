import useSWR from 'swr';
import { useRef, useState } from 'react';
import { nanoid } from '@ant-design/pro-components';
import type { BizRequestOptionsType, BizFieldProps } from './types';

type BizSelectOptionType = BizRequestOptionsType[];

export const useFieldFetchData = (
  props: BizFieldProps & { fieldKey?: React.Key; cacheForSwr?: boolean },
): [boolean, BizSelectOptionType] => {
  const { fieldKey, cacheForSwr = true } = props;

  /** Key 是用来缓存请求的，如果不在是有问题 */
  const [cacheKey] = useState(() => {
    if (fieldKey) {
      return fieldKey.toString();
    }
    if (props.request) {
      return nanoid();
    }
    return 'no-fetch';
  });

  const bizFieldKeyRef = useRef(cacheKey);

  const { data, isValidating } = useSWR(
    () => {
      if (!props.request) {
        return null;
      }

      return bizFieldKeyRef.current;
    },
    () => props.request!(),
    {
      revalidateIfStale: !cacheForSwr,
      // 打开 cacheForSwr 的时候才应该支持两个功能
      revalidateOnReconnect: cacheForSwr,
      shouldRetryOnError: false,
      // @todo 这个功能感觉应该搞个API出来
      revalidateOnFocus: false,
    },
  );

  return [isValidating, props.request ? (data as BizSelectOptionType) : []];
};
