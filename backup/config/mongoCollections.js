import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
    return _col;
  };
};

// 导出 users 集合
export const users = getCollectionFn('users');
// 新增：导出 tools 集合
export const tools = getCollectionFn('tools');
