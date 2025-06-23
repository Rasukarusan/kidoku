import { Test, TestingModule } from '@nestjs/testing';
import { SoftwareDesignService } from '../software-design.service';

describe('SoftwareDesignService', () => {
  let service: SoftwareDesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoftwareDesignService],
    }).compile();

    service = module.get<SoftwareDesignService>(SoftwareDesignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isSoftwareDesignISBN', () => {
    it('should identify Software Design ISBN correctly', () => {
      expect(service.isSoftwareDesignISBN('978-4-297-14815-7')).toBe(true);
      expect(service.isSoftwareDesignISBN('9784297148157')).toBe(true);
    });

    it('should identify non-Software Design ISBN correctly', () => {
      expect(service.isSoftwareDesignISBN('978-4-274-12345-6')).toBe(false);
      expect(service.isSoftwareDesignISBN('978-4-123-45678-9')).toBe(false);
    });

    it('should identify by title', () => {
      expect(service.isSoftwareDesignISBN('978-4-123-45678-9', 'Software Design 2025年7月号')).toBe(true);
      expect(service.isSoftwareDesignISBN('978-4-123-45678-9', 'ソフトウェアデザイン')).toBe(true);
      expect(service.isSoftwareDesignISBN('978-4-123-45678-9', 'Web+DB PRESS')).toBe(false);
    });
  });

  describe('getLatest', () => {
    it('should return latest Software Design', async () => {
      const result = await service.getLatest();
      
      expect(result).toBeDefined();
      expect(result.title).toContain('Software Design');
      expect(result.author).toBe('技術評論社');
      expect(result.category).toBe('プログラミング/技術雑誌');
    });
  });

  describe('getByYearMonth', () => {
    it('should return Software Design for specific year and month', async () => {
      const result = await service.getByYearMonth(2025, 7);
      
      expect(result).toBeDefined();
      expect(result.title).toBe('Software Design 2025年7月号');
      expect(result.author).toBe('技術評論社');
      expect(result.image).toContain('gihyo.jp');
    });
  });

  describe('getByYear', () => {
    it('should return 12 months of Software Design', async () => {
      const results = await service.getByYear(2025);
      
      expect(results).toHaveLength(12);
      expect(results[0].title).toBe('Software Design 2025年1月号');
      expect(results[11].title).toBe('Software Design 2025年12月号');
    });

    it('should have correct information for all results', async () => {
      const results = await service.getByYear(2025);
      
      results.forEach((result, index) => {
        expect(result.author).toBe('技術評論社');
        expect(result.category).toBe('プログラミング/技術雑誌');
        expect(result.image).toContain('gihyo.jp');
        expect(result.title).toContain(`${index + 1}月号`);
      });
    });
  });

  describe('searchByISBN', () => {
    it('should return Software Design when ISBN matches', async () => {
      const result = await service.searchByISBN('978-4-297-14815-7', 2025, 7);
      
      expect(result).toBeDefined();
      expect(result?.title).toBe('Software Design 2025年7月号');
    });

    it('should return null when ISBN does not match', async () => {
      const result = await service.searchByISBN('978-4-123-45678-9');
      
      expect(result).toBeNull();
    });

    it('should extract year and month from title when not provided', async () => {
      const result = await service.searchByISBN(
        '978-4-297-14815-7',
        undefined,
        undefined,
        'Software Design 2023年6月号'
      );
      
      expect(result).toBeDefined();
      expect(result?.title).toBe('Software Design 2023年6月号');
      expect(result?.image).toContain('TH800_642306.jpg');
    });

    it('should use current date when year/month not provided and no title', async () => {
      const now = new Date();
      const result = await service.searchByISBN('978-4-297-14815-7');
      
      expect(result).toBeDefined();
      expect(result?.title).toContain(`${now.getFullYear()}年${now.getMonth() + 1}月号`);
    });
  });
});