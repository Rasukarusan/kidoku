import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpHeaderAuthGuard } from '../../infrastructure/auth/http-header-auth.guard';
import { SoftwareDesignService } from './software-design.service';
import { SoftwareDesignRepository } from './software-design.repository';

@Controller('software-design')
export class SoftwareDesignController {
  constructor(
    private readonly softwareDesignService: SoftwareDesignService,
    private readonly softwareDesignRepository: SoftwareDesignRepository,
  ) {}

  @Get('latest')
  getLatest() {
    const result = this.softwareDesignService.getLatest();
    return {
      success: true,
      data: result,
    };
  }

  @Get(':year/:month')
  getByMonth(@Param('year') year: string, @Param('month') month: string) {
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new HttpException('Invalid year or month', HttpStatus.BAD_REQUEST);
    }

    const result = this.softwareDesignService.getByYearMonth(yearNum, monthNum);
    return {
      success: true,
      data: result,
    };
  }

  @Get('year/:year')
  getByYear(@Param('year') year: string) {
    const yearNum = parseInt(year, 10);

    if (
      isNaN(yearNum) ||
      yearNum < 2000 ||
      yearNum > new Date().getFullYear() + 1
    ) {
      throw new HttpException('Invalid year', HttpStatus.BAD_REQUEST);
    }

    const results = this.softwareDesignService.getByYear(yearNum);
    return {
      success: true,
      data: results,
    };
  }

  @Post('batch/add-latest')
  @UseGuards(HttpHeaderAuthGuard) // ヘッダー認証で保護
  async addLatestAsTemplate() {
    // 最新のSoftware Designを取得
    const latestSD = this.softwareDesignService.getLatest();

    if (!latestSD) {
      throw new HttpException(
        'Latest Software Design not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // データベースに既に存在するかチェック
    const existingBook = await this.softwareDesignRepository.findBookByTitle(
      latestSD.title,
    );

    if (existingBook) {
      return {
        success: true,
        message: 'Latest Software Design already exists',
        data: existingBook,
      };
    }

    // 管理者ユーザーを取得
    const adminUser = await this.softwareDesignRepository.findAdminUser();

    if (!adminUser) {
      throw new HttpException(
        'Admin user not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // テンプレートとして登録
    const template = await this.softwareDesignRepository.createTemplate({
      userId: adminUser.id,
      name: latestSD.title,
      title: latestSD.title,
      author: latestSD.author,
      category: latestSD.category,
      image: latestSD.image || latestSD.coverImageUrl,
      memo: `自動追加: ${new Date().toLocaleDateString('ja-JP')}\nISBN: ${latestSD.isbn || '未設定'}`,
    });

    return {
      success: true,
      message: 'Latest Software Design added as template',
      data: template,
    };
  }
}
