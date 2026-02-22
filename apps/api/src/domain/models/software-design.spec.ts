import { SoftwareDesign } from './software-design';

describe('SoftwareDesign', () => {
  describe('fromYearMonth', () => {
    it('年月から号を生成できる', () => {
      const sd = SoftwareDesign.fromYearMonth(2025, 3);

      expect(sd.yearMonth).toBe('202503');
      expect(sd.title).toBe('Software Design 2025年3月号');
      expect(sd.author).toBe('技術評論社');
      expect(sd.category).toBe('プログラミング/技術雑誌');
      expect(sd.publishDate).toBe('2025-03-01');
      expect(sd.isbn).toBeUndefined();
    });

    it('ISBNを指定して生成できる', () => {
      const sd = SoftwareDesign.fromYearMonth(2025, 1, '978-4-297-12345-6');

      expect(sd.isbn).toBe('978-4-297-12345-6');
    });

    it('画像URLが正しく生成される', () => {
      const sd = SoftwareDesign.fromYearMonth(2025, 1);
      expect(sd.coverImageUrl).toContain('gihyo.jp');
      expect(sd.coverImageUrl).toContain('2501');
    });

    it('1桁の月がゼロパディングされる', () => {
      const sd = SoftwareDesign.fromYearMonth(2025, 3);
      expect(sd.yearMonth).toBe('202503');
    });
  });

  describe('getLatest', () => {
    it('最新号を取得できる', () => {
      const sd = SoftwareDesign.getLatest();
      expect(sd.title).toContain('Software Design');
      expect(sd.isbn).toBeDefined();
    });
  });

  describe('getByYear', () => {
    it('1年分12冊を取得できる', () => {
      const issues = SoftwareDesign.getByYear(2025);
      expect(issues).toHaveLength(12);
      expect(issues[0].yearMonth).toBe('202501');
      expect(issues[11].yearMonth).toBe('202512');
    });
  });

  describe('isSoftwareDesignISBN', () => {
    it('技術評論社のISBNを判定できる', () => {
      expect(SoftwareDesign.isSoftwareDesignISBN('9784297123456')).toBe(true);
      expect(SoftwareDesign.isSoftwareDesignISBN('978-4-297-12345-6')).toBe(
        true,
      );
    });

    it('他社のISBNはfalse', () => {
      expect(SoftwareDesign.isSoftwareDesignISBN('9784873119038')).toBe(false);
    });

    it('タイトルにSoftware Designを含む場合はtrue', () => {
      expect(
        SoftwareDesign.isSoftwareDesignISBN(
          '9784873119038',
          'Software Design 2025年1月号',
        ),
      ).toBe(true);
    });

    it('タイトルにソフトウェアデザインを含む場合はtrue', () => {
      expect(
        SoftwareDesign.isSoftwareDesignISBN(
          '9784873119038',
          'ソフトウェアデザイン 2025年1月号',
        ),
      ).toBe(true);
    });
  });

  describe('fromISBN', () => {
    it('Software DesignのISBNから号を生成できる', () => {
      const sd = SoftwareDesign.fromISBN(
        '978-4-297-12345-6',
        2025,
        6,
        'Software Design 2025年6月号',
      );

      expect(sd).not.toBeNull();
      expect(sd!.yearMonth).toBe('202506');
      expect(sd!.isbn).toBe('978-4-297-12345-6');
    });

    it('関係ないISBNはnullを返す', () => {
      const sd = SoftwareDesign.fromISBN('9784873119038');
      expect(sd).toBeNull();
    });

    it('年月指定なしでもタイトルから抽出できる', () => {
      const sd = SoftwareDesign.fromISBN(
        '978-4-297-12345-6',
        undefined,
        undefined,
        'Software Design 2025年3月号',
      );

      expect(sd).not.toBeNull();
      expect(sd!.yearMonth).toBe('202503');
    });
  });
});
