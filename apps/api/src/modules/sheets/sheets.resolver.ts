import { Context, Query, Resolver } from '@nestjs/graphql';
import { SheetsResponseDto } from './dto/sheets-response.dto';
import { SheetsService } from './sheets.service';
import { GetSheetsResponseDto } from './dto/get-sheets-response.dto';
import { GetSheetsUseCase } from './usecase/get-sheets.usecase';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => SheetsResponseDto)
@UseGuards(GqlAuthGuard)
export class SheetsResolver {
  constructor(
    private readonly sheetsService: SheetsService,
    private readonly getSheetsUseCase: GetSheetsUseCase,
  ) {}

  @Query(() => GetSheetsResponseDto)
  async sheets(
    @CurrentUser() user: { id: string; admin: boolean },
  ): Promise<GetSheetsResponseDto> {
    console.log(user);
    return await this.getSheetsUseCase.execute(user.id);
  }
}
