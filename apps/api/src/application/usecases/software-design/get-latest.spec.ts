import { GetLatestSoftwareDesignUseCase } from './get-latest';

describe('GetLatestSoftwareDesignUseCase', () => {
  let useCase: GetLatestSoftwareDesignUseCase;

  beforeEach(() => {
    useCase = new GetLatestSoftwareDesignUseCase();
  });

  it('最新号を取得できる', () => {
    const result = useCase.execute();

    expect(result.title).toContain('Software Design');
    expect(result.isbn).toBeDefined();
  });
});
