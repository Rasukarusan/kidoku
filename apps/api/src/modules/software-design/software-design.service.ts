import { Injectable } from '@nestjs/common';
import { SoftwareDesignObject } from './dto/software-design.object';

@Injectable()
export class SoftwareDesignService {
  /**
   * Software Designの表紙画像URLを生成
   */
  private generateImageUrl(year: number, month: number): string {
    const yearStr = year.toString();
    const monthStr = month.toString().padStart(2, '0');
    const yearMonth = `${yearStr.slice(-2)}${monthStr}`;

    return `https://gihyo.jp/assets/images/cover/${yearStr}/thumb/TH800_64${yearMonth}.jpg`;
  }

  /**
   * Software DesignのISBNかどうかを判定
   */
  isSoftwareDesignISBN(isbn: string, title?: string): boolean {
    const normalizedISBN = isbn.replace(/-/g, '');

    // 技術評論社のISBNパターン
    const isTechReviewISBN = normalizedISBN.startsWith('9784297');

    // タイトルによる判定
    const isSoftwareDesignTitle = title
      ? title.toLowerCase().includes('software design') ||
        title.includes('ソフトウェアデザイン')
      : false;

    return isTechReviewISBN || isSoftwareDesignTitle;
  }

  /**
   * 最新のSoftware Designを取得
   */
  async getLatest(): Promise<SoftwareDesignObject> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 2; // 今月+1が巻数

    // 仮のISBN（実際には最新号のISBNを取得する必要がある）
    const dummyISBN = `978-4-297-${Date.now()}`;

    return this.getByYearMonth(year, month, dummyISBN);
  }

  /**
   * 指定年月のSoftware Designを取得
   */
  async getByYearMonth(
    year: number,
    month: number,
    isbn?: string,
  ): Promise<SoftwareDesignObject> {
    const imageUrl = this.generateImageUrl(year, month);
    const yearStr = year.toString();
    const monthStr = month.toString().padStart(2, '0');

    return {
      yearMonth: `${yearStr}${monthStr}`,
      title: `Software Design ${year}年${month}月号`,
      coverImageUrl: imageUrl,
      publishDate: `${yearStr}-${monthStr}-01`,
      isbn: isbn,
      author: '技術評論社',
      category: 'プログラミング/技術雑誌',
      image: imageUrl,
      memo: `Software Design ${year}年${month}月号`,
    };
  }

  /**
   * 指定年のSoftware Designリストを取得
   */
  async getByYear(year: number): Promise<SoftwareDesignObject[]> {
    const results: SoftwareDesignObject[] = [];

    for (let month = 1; month <= 12; month++) {
      const item = await this.getByYearMonth(year, month);
      results.push(item);
    }

    return results;
  }

  /**
   * タイトルから年月を抽出する
   */
  private extractYearMonthFromTitle(title: string): { year: number; month: number } | null {
    // パターン1: "Software Design YYYY年MM月号"
    const pattern1 = title.match(/Software Design (\d{4})年(\d{1,2})月号/);
    if (pattern1) {
      return {
        year: parseInt(pattern1[1], 10),
        month: parseInt(pattern1[2], 10),
      };
    }

    // パターン2: "ソフトウェアデザイン YYYY年MM月号"
    const pattern2 = title.match(/ソフトウェアデザイン (\d{4})年(\d{1,2})月号/);
    if (pattern2) {
      return {
        year: parseInt(pattern2[1], 10),
        month: parseInt(pattern2[2], 10),
      };
    }

    return null;
  }

  /**
   * ISBN検索でSoftware Designを検索
   */
  async searchByISBN(
    isbn: string,
    year?: number,
    month?: number,
    title?: string,
  ): Promise<SoftwareDesignObject | null> {
    if (!this.isSoftwareDesignISBN(isbn, title)) {
      return null;
    }

    let targetYear = year;
    let targetMonth = month;

    // 年月が指定されていない場合、タイトルから抽出を試みる
    if (!targetYear || !targetMonth) {
      if (title) {
        const extracted = this.extractYearMonthFromTitle(title);
        if (extracted) {
          targetYear = extracted.year;
          targetMonth = extracted.month;
        }
      }
    }

    // それでも年月が取得できない場合は現在の年月を使用
    if (!targetYear || !targetMonth) {
      const now = new Date();
      targetYear = now.getFullYear();
      targetMonth = now.getMonth() + 1;
    }

    return this.getByYearMonth(targetYear, targetMonth, isbn);
  }
}