import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

interface Database {
  users: any[];
  messages: any[];
  threads: any[];
  categories: any[];
  tags: any[];
  config: any;
  replies: any[];
}

const defaultData: Database = {
  users: [],
  messages: [],
  threads: [],
  categories: [],
  tags: [],
  config: {},
  replies: []
};

let dbInstance: Low<Database> | null = null;

export async function getDb(): Promise<Low<Database>> {
  if (dbInstance) return dbInstance;

  const file = path.join(process.cwd(), 'api', 'db.json');
  const adapter = new JSONFile<Database>(file);
  dbInstance = new Low(adapter, defaultData);
  
  await dbInstance.read();
  if (!dbInstance.data) dbInstance.data = defaultData;
  
  return dbInstance;
}