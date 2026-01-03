import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GetSheetsUseCase } from 'src/application/usecases/sheets/get-sheets';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { SheetObject } from 'src/modules/sheets/dto/sheet.object';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SheetResolver {
  constructor(private readonly getSheetsUseCase: GetSheetsUseCase) {}

  @Query(() => [SheetObject])
  async sheets(@CurrentUser() user: { id: string }): Promise<SheetObject[]> {
    const sheets = await this.getSheetsUseCase.execute(user.id);
    return sheets.map((sheet) => ({
      id: sheet.id ?? '',
      name: sheet.name,
      userId: sheet.userId,
      order: sheet.order,
      created: sheet.created,
      updated: sheet.updated,
    }));
  }
}
