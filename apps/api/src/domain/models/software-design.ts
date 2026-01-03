export class SoftwareDesign {
  private constructor(
    private readonly _yearMonth: string,
    private readonly _title: string,
    private readonly _coverImageUrl: string,
    private readonly _publishDate: string,
    private readonly _isbn: string | undefined,
    private readonly _author: string,
    private readonly _category: string,
    private readonly _image: string,
    private readonly _memo: string,
  ) {}

  get yearMonth(): string {
    return this._yearMonth;
  }

  get title(): string {
    return this._title;
  }

  get coverImageUrl(): string {
    return this._coverImageUrl;
  }

  get publishDate(): string {
    return this._publishDate;
  }

  get isbn(): string | undefined {
    return this._isbn;
  }

  get author(): string {
    return this._author;
  }

  get category(): string {
    return this._category;
  }

  get image(): string {
    return this._image;
  }

  get memo(): string {
    return this._memo;
  }

  static fromYearMonth(
    year: number,
    month: number,
    isbn?: string,
  ): SoftwareDesign {
    const imageUrl = this.generateImageUrl(year, month);
    const yearStr = year.toString();
    const monthStr = month.toString().padStart(2, '0');

    return new SoftwareDesign(
      `${yearStr}${monthStr}`,
      `Software Design ${year}年${month}月号`,
      imageUrl,
      `${yearStr}-${monthStr}-01`,
      isbn,
      '技術評論社',
      'プログラミング/技術雑誌',
      imageUrl,
      `Software Design ${year}年${month}月号`,
    );
  }

  static getLatest(): SoftwareDesign {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 2; // 今月+1が巻数

    const dummyISBN = `978-4-297-${Date.now()}`;

    return this.fromYearMonth(year, month, dummyISBN);
  }

  static getByYear(year: number): SoftwareDesign[] {
    const results: SoftwareDesign[] = [];

    for (let month = 1; month <= 12; month++) {
      results.push(this.fromYearMonth(year, month));
    }

    return results;
  }

  static fromISBN(
    isbn: string,
    year?: number,
    month?: number,
    title?: string,
  ): SoftwareDesign | null {
    if (!this.isSoftwareDesignISBN(isbn, title)) {
      return null;
    }

    let targetYear = year;
    let targetMonth = month;

    if (!targetYear || !targetMonth) {
      if (title) {
        const extracted = this.extractYearMonthFromTitle(title);
        if (extracted) {
          targetYear = extracted.year;
          targetMonth = extracted.month;
        }
      }
    }

    if (!targetYear || !targetMonth) {
      const now = new Date();
      targetYear = now.getFullYear();
      targetMonth = now.getMonth() + 1;
    }

    return this.fromYearMonth(targetYear, targetMonth, isbn);
  }

  static isSoftwareDesignISBN(isbn: string, title?: string): boolean {
    const normalizedISBN = isbn.replace(/-/g, '');

    const isTechReviewISBN = normalizedISBN.startsWith('9784297');

    const isSoftwareDesignTitle = title
      ? title.toLowerCase().includes('software design') ||
        title.includes('ソフトウェアデザイン')
      : false;

    return isTechReviewISBN || isSoftwareDesignTitle;
  }

  private static generateImageUrl(year: number, month: number): string {
    const yearStr = year.toString();
    const monthStr = month.toString().padStart(2, '0');
    const yearMonth = `${yearStr.slice(-2)}${monthStr}`;

    return `https://gihyo.jp/assets/images/cover/${yearStr}/thumb/TH800_64${yearMonth}.jpg`;
  }

  private static extractYearMonthFromTitle(
    title: string,
  ): { year: number; month: number } | null {
    const pattern1 = title.match(/Software Design (\d{4})年(\d{1,2})月号/);
    if (pattern1) {
      return {
        year: parseInt(pattern1[1], 10),
        month: parseInt(pattern1[2], 10),
      };
    }

    const pattern2 = title.match(/ソフトウェアデザイン (\d{4})年(\d{1,2})月号/);
    if (pattern2) {
      return {
        year: parseInt(pattern2[1], 10),
        month: parseInt(pattern2[2], 10),
      };
    }

    return null;
  }
}
