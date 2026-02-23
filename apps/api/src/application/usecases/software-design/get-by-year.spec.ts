import { GetSoftwareDesignByYearUseCase } from './get-by-year';

describe('GetSoftwareDesignByYearUseCase', () => {
  let useCase: GetSoftwareDesignByYearUseCase;

  beforeEach(() => {
    useCase = new GetSoftwareDesignByYearUseCase();
  });

  it('指定年の全12ヶ月分を取得できる', () => {
    const result = useCase.execute(2025);

    expect(result).toHaveLength(12);
    expect(result[0].yearMonth).toBe('202501');
    expect(result[11].yearMonth).toBe('202512');
  });
});
