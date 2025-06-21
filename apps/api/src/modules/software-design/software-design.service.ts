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
    const isSoftwareDesignTitle = title ? 
      title.toLowerCase().includes('software design') || 
      title.includes('ソフトウェアデザイン') : 
      false;
    
    return isTechReviewISBN || isSoftwareDesignTitle;
  }

  /**
   * 最新のSoftware Designを取得
   */
  async getLatest(): Promise<SoftwareDesignObject> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // 仮のISBN（実際には最新号のISBNを取得する必要がある）
    const dummyISBN = `978-4-297-${Date.now()}`;
    
    return this.getByYearMonth(year, month, dummyISBN);
  }

  /**
   * 指定年月のSoftware Designを取得
   */
  async getByYearMonth(year: number, month: number, isbn?: string): Promise<SoftwareDesignObject> {
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
   * ISBN検索でSoftware Designを検索
   */
  async searchByISBN(isbn: string, year?: number, month?: number): Promise<SoftwareDesignObject | null> {
    if (!this.isSoftwareDesignISBN(isbn)) {
      return null;
    }

    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;
    
    return this.getByYearMonth(targetYear, targetMonth, isbn);
  }
}