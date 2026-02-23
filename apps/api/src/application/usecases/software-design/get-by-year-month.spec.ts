import { GetSoftwareDesignByYearMonthUseCase } from './get-by-year-month';

describe('GetSoftwareDesignByYearMonthUseCase', () => {
  let useCase: GetSoftwareDesignByYearMonthUseCase;

  beforeEach(() => {
    useCase = new GetSoftwareDesignByYearMonthUseCase();
  });

  it('指定年月のSoftware Designを取得できる', () => {
    const result = useCase.execute(2025, 3);

    expect(result.yearMonth).toBe('202503');
    expect(result.title).toBe('Software Design 2025年3月号');
  });
});
