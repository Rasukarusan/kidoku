import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { SheetsResponseDto } from './dto/sheets-response.dto';
import { SheetsService } from './sheets.service';
import { GetSheetsUseCase } from './usecase/get-sheets.usecase';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/current-user.decorator';
import { SheetObject } from './dto/sheet.object';
import { CreateSheetInput } from './dto/create-sheet.input';
import { UpdateSheetInput } from './dto/update-sheet.input';
import { DeleteSheetInput } from './dto/delete-sheet.input';

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
      id: sheet.id.toString(),
      name: sheet.name,
      userId: sheet.userId,
      created: sheet.created ?? undefined,
      updated: sheet.updated ?? undefined,
      order: sheet.order ?? undefined,
    }));
  }

  @Mutation(() => SheetObject)
  async createSheet(
    @CurrentUser() user: { id: string; admin: boolean },
    @Args('input') input: CreateSheetInput,
  ): Promise<SheetObject> {
    return await this.sheetsService.createSheet(user.id, input.name);
  }

  @Mutation(() => SheetObject)
  async updateSheet(
    @CurrentUser() user: { id: string; admin: boolean },
    @Args('input') input: UpdateSheetInput,
  ): Promise<SheetObject> {
    return await this.sheetsService.updateSheet(
      user.id,
      input.oldName,
      input.newName,
    );
  }

  @Mutation(() => Boolean)
  async deleteSheet(
    @CurrentUser() user: { id: string; admin: boolean },
    @Args('input') input: DeleteSheetInput,
  ): Promise<boolean> {
    await this.sheetsService.deleteSheet(user.id, input.name);
    return true;
  }
}
