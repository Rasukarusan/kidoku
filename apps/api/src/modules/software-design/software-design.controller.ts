import { Controller, Post, Get, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SoftwareDesignService } from './software-design.service';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../constants/injection-tokens';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../../database/schema';
import { eq, and } from 'drizzle-orm';

@Controller('software-design')
@UseGuards(JwtAuthGuard)
export class SoftwareDesignController {
  constructor(
    private readonly softwareDesignService: SoftwareDesignService,
    @Inject(DATABASE_CONNECTION) private db: MySql2Database<typeof schema>,
  ) {}

  @Get('latest')
  async getLatest() {
    const result = await this.softwareDesignService.getLatest();
    return {
      success: true,
      data: result,
    };
  }

  @Get(':year/:month')
  async getByMonth(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new HttpException('Invalid year or month', HttpStatus.BAD_REQUEST);
    }

    const result = await this.softwareDesignService.getByYearMonth(yearNum, monthNum);
    return {
      success: true,
      data: result,
    };
  }

  @Get('year/:year')
  async getByYear(@Param('year') year: string) {
    const yearNum = parseInt(year, 10);

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > new Date().getFullYear() + 1) {
      throw new HttpException('Invalid year', HttpStatus.BAD_REQUEST);
    }

    const results = await this.softwareDesignService.getByYear(yearNum);
    return {
      success: true,
      data: results,
    };
  }

  @Post('batch/add-latest')
  async addLatestAsTemplate() {
    // 最新のSoftware Designを取得
    const latestSD = await this.softwareDesignService.getLatest();
    
    if (!latestSD) {
      throw new HttpException('Latest Software Design not found', HttpStatus.NOT_FOUND);
    }

    // データベースに既に存在するかチェック
    const existingBooks = await this.db
      .select()
      .from(schema.books)
      .where(eq(schema.books.title, latestSD.title));

    if (existingBooks.length > 0) {
      return {
        success: true,
        message: 'Latest Software Design already exists',
        data: existingBooks[0],
      };
    }

    // 管理者ユーザーを取得
    const adminUsers = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.admin, 1))
      .limit(1);

    if (adminUsers.length === 0) {
      throw new HttpException('Admin user not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const adminUser = adminUsers[0];

    // テンプレートとして登録
    await this.db
      .insert(schema.templateBooks)
      .values({
        userId: adminUser.id,
        name: latestSD.title,
        title: latestSD.title,
        author: latestSD.author,
        category: latestSD.category,
        image: latestSD.image,
        memo: `自動追加: ${new Date().toLocaleDateString('ja-JP')}\nISBN: ${latestSD.isbn || '未設定'}`,
        isPublicMemo: 0,
        created: new Date().toISOString().slice(0, 19).replace('T', ' '),
        updated: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });

    // 挿入したデータを取得
    const templates = await this.db
      .select()
      .from(schema.templateBooks)
      .where(eq(schema.templateBooks.name, latestSD.title))
      .limit(1);

    const template = templates[0];

    return {
      success: true,
      message: 'Latest Software Design added as template',
      data: template,
    };
  }
}