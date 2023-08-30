import { requestController, geoLocationRequest } from '@mapzone/request';
import { getAppConfig } from '@mapzone/utils';

export const queryChild = requestController(
  (props) => {
    const { serviceId } = getAppConfig()?.geoLocation || {};
    return geoLocationRequest.get(`/rest/zq/queryChild/${serviceId}${props?.url}`, props);
  },
  {
    url: '/{code}/{withShape}',
  },
);
export const queryByName = requestController(
  (props) => {
    const { serviceId } = getAppConfig()?.geoLocation || {};
    return geoLocationRequest.get(`/rest/zq/queryByName/${serviceId}${props?.url}`, props);
  },
  {
    url: '/{name}',
  },
);
export const queryParents = requestController(
  (props) => {
    const { serviceId } = getAppConfig()?.geoLocation || {};
    return geoLocationRequest.get(`/rest/zq/queryParents/${serviceId}${props?.url}`, props);
  },
  {
    url: '/{code}/{withShape}',
  },
);
