import { Query, Resolver } from '@nestjs/graphql';
import { SheetsResponseDto } from './dto/sheets-response.dto';
import { SheetsService } from './sheets.service';
import { GetSheetsUseCase } from './usecase/get-sheets.usecase';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/current-user.decorator';
import { SheetObject } from './dto/sheet.object';

@Resolver(() => SheetsResponseDto)
@UseGuards(GqlAuthGuard)
export class SheetsResolver {
  constructor(
    private readonly sheetsService: SheetsService,
    private readonly getSheetsUseCase: GetSheetsUseCase,
  ) {}

  @Query(() => [SheetObject])
  async sheets(
    @CurrentUser() user: { id: string; admin: boolean },
  ): Promise<SheetObject[]> {
    const sheets = await this.getSheetsUseCase.execute(user.id);
    return sheets.map((sheet) => ({
      id: sheet.id,
      name: sheet.name,
      userId: sheet.userId,
      created: sheet.created ?? undefined,
      updated: sheet.updated ?? undefined,
      order: sheet.order ?? undefined,
    }));
  }
}
