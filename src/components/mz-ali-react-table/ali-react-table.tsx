import React from 'react'
import { Empty } from 'antd'
import classNames from 'classnames'
import { BaseTable } from 'ali-react-table';
import { Classes, prefixCls } from './constants'
import { theme } from './theme-css-var';
import type { MzAliReactTableProps } from './types'
import './style.less'

/** 单选，虚拟加载 table */
const MzAliReactTable = <T extends Record<string, any>> (props: MzAliReactTableProps<T>) => {
  const { className, scrollY, primaryKey = 'key', selectedKeys, onRow, ...restProps } = props

  return (
    <BaseTable
      primaryKey={primaryKey}
      useVirtual="auto"
      style={{ overflow: 'auto', maxHeight: '100%', height: scrollY, ...theme }}
      className={classNames(prefixCls, className,)}
      components={{
        EmptyContent: () => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        Row: ({ row, rowIndex, trProps }: {
          row: T,
          rowIndex: number,
          trProps: unknown
        }) => {
          let internalTrProps: Record<string, any> = trProps || {};
          const selected = selectedKeys.includes(row[primaryKey]);
          internalTrProps = {
            ...internalTrProps,
            className: classNames(internalTrProps.className, Classes.rowHandleSelected, Classes.row, {
              [Classes.rowSelected]: selected,
              [Classes.noHover]: !selected,
            }),
            onClick: (e: React.MouseEvent) => {
              onRow(row)
            },
          };
          return <tr {...internalTrProps} />;
        }
      }}
      {...restProps}
    />
  )
}

export default MzAliReactTable
