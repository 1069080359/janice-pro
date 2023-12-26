import moment from 'moment';

export const prefixCls = 'baby-feeding-record';

export const recordFormat = () => {
  const keyTime = moment().format('HH:mm:ss');
  const date = moment().format('YYYY-MM-DD');
  const dateTime = moment(`${date} ${keyTime}`).valueOf();
  return {
    key: keyTime,
    date: date,
    time: keyTime,
    sort: dateTime,
  };
};

export const xuhao = {
  title: '序号',
  dataIndex: 'xh',
  key: 'xh',
  align: 'center',
  ellipsis: true,
  render: (text, record, index) => {
    return index + 1;
  },
};
