import { Request, Response } from 'express';
import { Model, Document, FilterQuery } from 'mongoose';

export class BaseController<T extends Document> {
  constructor(private model: Model<T>) {}

  // 统一的成功响应方法
  protected sendSuccess(res: Response, data: any = {}, status: number = 200): void {
    res.status(status).json({
      success: true,
      data
    });
  }

  // 统一的错误响应方法
  protected sendError(res: Response, message: string, status: number = 400): void {
    res.status(status).json({
      success: false,
      message
    });
  }

  // 创建记录
  async create(req: Request, res: Response) {
    try {
      const doc = new this.model(req.body);
      const result = await doc.save();
      this.sendSuccess(res, result, 201);
    } catch (error) {
      this.sendError(res, error instanceof Error ? error.message : '创建失败');
    }
  }

  // 获取所有记录
  async findAll(req: Request, res: Response) {
    try {
      const filter: FilterQuery<T> = this.parseQuery(req.query);
      const docs = await this.model.find(filter);
      this.sendSuccess(res, docs);
    } catch (error) {
      this.sendError(res, error instanceof Error ? error.message : '查询失败');
    }
  }

  // 根据ID获取记录
  async findById(req: Request, res: Response) {
    try {
      const doc = await this.model.findById(req.params.id);
      if (!doc) {
        return this.sendError(res, '未找到记录', 404);
      }
      this.sendSuccess(res, doc);
    } catch (error) {
      this.sendError(res, error instanceof Error ? error.message : '查询失败');
    }
  }

  // 更新记录
  async update(req: Request, res: Response) {
    try {
      const doc = await this.model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!doc) {
        return this.sendError(res, '未找到记录', 404);
      }
      this.sendSuccess(res, doc);
    } catch (error) {
      this.sendError(res, error instanceof Error ? error.message : '更新失败');
    }
  }

  // 删除记录
  async delete(req: Request, res: Response) {
    try {
      const doc = await this.model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return this.sendError(res, '未找到记录', 404);
      }
      this.sendSuccess(res, {});
    } catch (error) {
      this.sendError(res, error instanceof Error ? error.message : '删除失败');
    }
  }

  // 辅助方法：解析查询参数
  private parseQuery(query: any): FilterQuery<T> {
    const filter: FilterQuery<T> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        filter[key as keyof T] = value;
      }
    }
    return filter;
  }
} 