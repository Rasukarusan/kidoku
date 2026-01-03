import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GetSheetsUseCase } from 'src/application/usecases/sheets/get-sheets';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { SheetResponse } from '../dto/sheet.response';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SheetResolver {
  constructor(private readonly getSheetsUseCase: GetSheetsUseCase) {}

  @Query(() => [SheetResponse])
  async sheets(@CurrentUser() user: { id: string }): Promise<SheetResponse[]> {
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

  // @Mutation(() => SheetResponse)
  // async createSheet(
  //   @CurrentUser() user: { id: string; admin: boolean },
  //   @Args('input') input: CreateSheetInput,
  // ): Promise<SheetResponse> {
  //   return await this.sheetsService.createSheet(user.id, input.name);
  // }

  // @Mutation(() => SheetResponse)
  // async updateSheet(
  //   @CurrentUser() user: { id: string; admin: boolean },
  //   @Args('input') input: UpdateSheetInput,
  // ): Promise<SheetResponse> {
  //   return await this.sheetsService.updateSheet(
  //     user.id,
  //     input.oldName,
  //     input.newName,
  //   );
  // }

  // @Mutation(() => Boolean)
  // async deleteSheet(
  //   @CurrentUser() user: { id: string; admin: boolean },
  //   @Args('input') input: DeleteSheetInput,
  // ): Promise<boolean> {
  //   await this.sheetsService.deleteSheet(user.id, input.name);
  //   return true;
  // }

  // @Mutation(() => Boolean)
  // async updateSheetOrders(
  //   @CurrentUser() user: { id: string; admin: boolean },
  //   @Args('input') input: UpdateSheetOrdersInput,
  // ): Promise<boolean> {
  //   return await this.sheetsService.updateSheetOrders(user.id, input);
  // }
}
