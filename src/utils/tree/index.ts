/** 更新树数据 */
export const updateTreeData = <T extends Record<string, any> = Record<string, any>>(
  list: Record<string, any>[],
  itemKey: string,
  children: T[],
  fieldNames: { id?: string; children?: string } = {},
): T[] => {
  const { id: idKey = 'id', children: childrenKey = 'children' } = fieldNames;
  list.forEach((node) => {
    if (node[idKey] === itemKey) {
      node[childrenKey] = children;
    } else if (node[childrenKey]) {
      node[childrenKey] = updateTreeData<T>(node.children, itemKey, children, fieldNames);
    }
  });
  return list as T[];
};
