import { isMobilePhone } from '@mapzone/utils';
import type { ValidatorRule } from 'rc-field-form/es/interface';

export const validatorPhone: ValidatorRule['validator'] = (rules, value) => {
  if (!isMobilePhone(value)) {
    return Promise.reject(rules.message || '电话号码格式错误');
  }
  return Promise.resolve();
};

// 校验小数位数
export const valiatorDecimals = (rules: any, value: any, _callback: any, len: any) => {
  const { decimals } = rules as any;
  if (value && typeof value === 'number' && typeof decimals === 'number') {
    const str = value.toString();
    const dec = str.includes('.') ? str.split('.')[1].length : 0;
    const int = str.includes('.') ? str.split('.')[0].length : str.length;

    if (dec > decimals) {
      return Promise.reject(decimals === 0 ? '请输入整数' : `请输入小数位不超过${decimals}位的数字`);
    }

    if (int + decimals > len) {
      return Promise.reject(`请输入整数位不超过${len - decimals}位的数字`);
    }
  }
  return Promise.resolve();
};
