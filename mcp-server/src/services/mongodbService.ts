import { MongoClient, Db, Collection, ObjectId, Sort } from "mongodb";

export interface MongoDBConfig {
  uri: string;
  database: string;
}

export interface InsertParams {
  collection: string;
  data: any;
}

export interface FindParams {
  collection: string;
  query?: object;
  limit?: number;
  sort?: object;
}

export interface FindOneParams {
  collection: string;
  query: object;
}

export interface UpdateParams {
  collection: string;
  query: object;
  update: object;
  upsert?: boolean;
}

export interface DeleteParams {
  collection: string;
  query: object;
  deleteMany?: boolean;
}

export interface MongoDBResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export class MongoDBService {
  private client: MongoClient;
  private db: Db | null = null;
  private config: MongoDBConfig;

  constructor() {
    this.config = {
      uri: process.env.MONGODB_URI || "mongodb://localhost:27017/swl",
      database: process.env.MONGODB_DATABASE || "swl",
    };
    
    this.client = new MongoClient(this.config.uri);
  }

  private async connect(): Promise<Db> {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db(this.config.database);
      console.log(`已连接到MongoDB数据库: ${this.config.database}`);
    }
    return this.db;
  }

  private getCollection(collectionName: string): Collection {
    if (!this.db) {
      throw new Error("数据库未连接");
    }
    return this.db.collection(collectionName);
  }

  // 插入数据
  async insert(params: InsertParams): Promise<MongoDBResult> {
    try {
      await this.connect();
      const collection = this.getCollection(params.collection);
      
      let result;
      if (Array.isArray(params.data)) {
        // 批量插入
        result = await collection.insertMany(params.data);
        return {
          content: [
            {
              type: "text",
              text: `成功插入 ${result.insertedCount} 条记录到集合 ${params.collection}`,
            },
            {
              type: "text",
              text: `插入的ID: ${Object.values(result.insertedIds).join(", ")}`,
            },
          ],
        };
      } else {
        // 单条插入
        result = await collection.insertOne(params.data);
        return {
          content: [
            {
              type: "text",
              text: `成功插入记录到集合 ${params.collection}`,
            },
            {
              type: "text",
              text: `插入的ID: ${result.insertedId}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `插入数据失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  // 查询多条数据
  async find(params: FindParams): Promise<MongoDBResult> {
    try {
      await this.connect();
      const collection = this.getCollection(params.collection);
      
      const query = params.query || {};
      const limit = params.limit || 10;
      const sort = params.sort || {};

      const cursor = collection.find(query).limit(limit);
      if (Object.keys(sort).length > 0) {
        cursor.sort(sort as Sort);
      }

      const results = await cursor.toArray();
      
      return {
        content: [
          {
            type: "text",
            text: `从集合 ${params.collection} 查询到 ${results.length} 条记录`,
          },
          {
            type: "text",
            text: `查询结果: ${JSON.stringify(results, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `查询数据失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  // 查询单条数据
  async findOne(params: FindOneParams): Promise<MongoDBResult> {
    try {
      await this.connect();
      const collection = this.getCollection(params.collection);
      
      // 处理ObjectId查询
      const query = this.processQuery(params.query);
      const result = await collection.findOne(query);
      
      if (result) {
        return {
          content: [
            {
              type: "text",
              text: `从集合 ${params.collection} 找到匹配记录`,
            },
            {
              type: "text",
              text: `查询结果: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `在集合 ${params.collection} 中未找到匹配的记录`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `查询单条数据失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  // 更新数据
  async update(params: UpdateParams): Promise<MongoDBResult> {
    try {
      await this.connect();
      const collection = this.getCollection(params.collection);
      
      // 处理ObjectId查询
      const query = this.processQuery(params.query);
      const updateDoc = { $set: params.update };
      const options = { upsert: params.upsert || false };

      const result = await collection.updateMany(query, updateDoc, options);
      
      return {
        content: [
          {
            type: "text",
            text: `更新操作完成 - 匹配: ${result.matchedCount}, 修改: ${result.modifiedCount}${
              result.upsertedCount ? `, 插入: ${result.upsertedCount}` : ""
            }`,
          },
          {
            type: "text",
            text: `集合: ${params.collection}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `更新数据失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  // 删除数据
  async delete(params: DeleteParams): Promise<MongoDBResult> {
    try {
      await this.connect();
      const collection = this.getCollection(params.collection);
      
      // 处理ObjectId查询
      const query = this.processQuery(params.query);
      
      let result;
      if (params.deleteMany) {
        result = await collection.deleteMany(query);
      } else {
        result = await collection.deleteOne(query);
      }
      
      return {
        content: [
          {
            type: "text",
            text: `删除操作完成 - 删除了 ${result.deletedCount} 条记录`,
          },
          {
            type: "text",
            text: `集合: ${params.collection}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `删除数据失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  // 处理查询中的ObjectId字段
  private processQuery(query: any): any {
    const processedQuery = { ...query };
    
    // 处理 _id 字段
    if (processedQuery._id && typeof processedQuery._id === "string") {
      try {
        processedQuery._id = new ObjectId(processedQuery._id);
      } catch (error) {
        // 如果不是有效的ObjectId，保持原样
      }
    }

    // 递归处理嵌套的ObjectId
    for (const key in processedQuery) {
      if (key.endsWith("Id") && typeof processedQuery[key] === "string") {
        try {
          processedQuery[key] = new ObjectId(processedQuery[key]);
        } catch (error) {
          // 如果不是有效的ObjectId，保持原样
        }
      }
    }

    return processedQuery;
  }

  // 关闭连接
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.db = null;
      console.log("MongoDB连接已关闭");
    }
  }

  // 获取数据库统计信息
  async getStats(collectionName?: string): Promise<MongoDBResult> {
    try {
      await this.connect();
      
      if (collectionName) {
        const collection = this.getCollection(collectionName);
        const stats = await collection.estimatedDocumentCount();
        return {
          content: [
            {
              type: "text",
              text: `集合 ${collectionName} 统计信息`,
            },
            {
              type: "text",
              text: `文档数量: ${stats}`,
            },
          ],
        };
      } else {
        const collections = await this.db!.listCollections().toArray();
        return {
          content: [
            {
              type: "text",
              text: `数据库 ${this.config.database} 统计信息`,
            },
            {
              type: "text",
              text: `集合数量: ${collections.length}`,
            },
            {
              type: "text",
              text: `集合列表: ${collections.map((c: any) => c.name).join(", ")}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `获取统计信息失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
} 