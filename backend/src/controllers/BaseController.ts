import { Request, Response } from 'express';
import { Model, Document, FilterQuery } from 'mongoose';

export class BaseController<T extends Document> {
  constructor(private model: Model<T>) {}

  // 创建记录
  async create(req: Request, res: Response) {
    try {
      const doc = new this.model(req.body);
      const result = await doc.save();
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '创建失败'
      });
    }
  }

  // 获取所有记录
  async findAll(req: Request, res: Response) {
    try {
      const filter: FilterQuery<T> = this.parseQuery(req.query);
      const docs = await this.model.find(filter);
      res.status(200).json({
        success: true,
        data: docs
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '查询失败'
      });
    }
  }

  // 根据ID获取记录
  async findById(req: Request, res: Response) {
    try {
      const doc = await this.model.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: '未找到记录'
        });
      }
      res.status(200).json({
        success: true,
        data: doc
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '查询失败'
      });
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
        return res.status(404).json({
          success: false,
          message: '未找到记录'
        });
      }
      res.status(200).json({
        success: true,
        data: doc
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '更新失败'
      });
    }
  }

  // 删除记录
  async delete(req: Request, res: Response) {
    try {
      const doc = await this.model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: '未找到记录'
        });
      }
      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '删除失败'
      });
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