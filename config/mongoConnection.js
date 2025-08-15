import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const settingsData = fs.readFileSync(path.resolve(__dirname, './settings.json'), 'utf-8');
const settings = JSON.parse(settingsData);

const mongoConfig = settings.mongoConfig;
let _connection = undefined;
let _db = undefined;

export const dbConnection = async () => {
  if (!_connection) {
    console.log('Attempting to connect to MongoDB Atlas...');
    try {
      _connection = await MongoClient.connect(mongoConfig.serverUrl, {
        // 新增：设置5秒的服务器选择超时
        serverSelectionTimeoutMS: 5000,
      });
      _db = _connection.db(mongoConfig.database);
      console.log('Successfully connected to MongoDB Atlas!');
    } catch (e) {
      console.error('!!! MongoDB Connection Failed !!!');
      throw e;
    }
  }
  return _db;
};

export const closeConnection = async () => {
  if (_connection) {
    await _connection.close();
    _connection = undefined;
    _db = undefined;
  }
};
