import { appRequest } from '@mapzone/request';
import type { ApiRes } from '@mapzone/types';
import type { AttributeUpdateFieldParams, FieldCheckExpressionParams } from './types';

/**
 * 字段语句检查
 * @param params
 * @returns
 */
export const attributeCheckExpression = async (params: FieldCheckExpressionParams) => {
  return appRequest<ApiRes>(`/attribute/checkExpression`, {
    method: 'POST',
    data: params,
  });
};

/**
 * 更新字段值
 * @param params
 * @returns
 */
export const attributeUpdateField = async (params: AttributeUpdateFieldParams) => {
  return appRequest<ApiRes>(`/attribute/updateField`, {
    method: 'POST',
    data: params,
  });
};
