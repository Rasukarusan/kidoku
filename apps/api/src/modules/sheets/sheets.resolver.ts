import { Context, Query, Resolver } from '@nestjs/graphql';
import { SheetsResponseDto } from './dto/sheets-response.dto';
import { SheetsService } from './sheets.service';
import { GetSheetsResponseDto } from './dto/get-sheets-response.dto';
import { GetSheetsUseCase } from './usecase/get-sheets.usecase';

@Resolver(() => SheetsResponseDto)
export class SheetsResolver {
  constructor(
    private readonly sheetsService: SheetsService,
    private readonly getSheetsUseCase: GetSheetsUseCase,
  ) {}

  @Query(() => GetSheetsResponseDto)
  async sheets(@Context() context): Promise<GetSheetsResponseDto> {
    const userId = '1';
    return await this.getSheetsUseCase.execute(userId);
  }
}
