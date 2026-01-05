import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetSheetsUseCase } from '../../application/usecases/sheets/get-sheets';
import { CreateSheetUseCase } from '../../application/usecases/sheets/create-sheet';
import { UpdateSheetUseCase } from '../../application/usecases/sheets/update-sheet';
import { DeleteSheetUseCase } from '../../application/usecases/sheets/delete-sheet';
import { UpdateSheetOrdersUseCase } from '../../application/usecases/sheets/update-sheet-orders';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { Sheet } from '../../domain/models/sheet';
import {
  SheetResponse,
  CreateSheetInput,
  UpdateSheetInput,
  DeleteSheetInput,
  UpdateSheetOrdersInput,
} from '../dto/sheet';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SheetResolver {
  constructor(
    private readonly getSheetsUseCase: GetSheetsUseCase,
    private readonly createSheetUseCase: CreateSheetUseCase,
    private readonly updateSheetUseCase: UpdateSheetUseCase,
    private readonly deleteSheetUseCase: DeleteSheetUseCase,
    private readonly updateSheetOrdersUseCase: UpdateSheetOrdersUseCase,
  ) {}

  @Query(() => [SheetResponse])
  async sheets(@CurrentUser() user: { id: string }): Promise<SheetResponse[]> {
    const sheets = await this.getSheetsUseCase.execute(user.id);
    return sheets.map((sheet) => this.toResponse(sheet));
  }

  @Mutation(() => SheetResponse)
  async createSheet(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateSheetInput,
  ): Promise<SheetResponse> {
    const sheet = await this.createSheetUseCase.execute(user.id, input.name);
    return this.toResponse(sheet);
  }

  @Mutation(() => SheetResponse)
  async updateSheet(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateSheetInput,
  ): Promise<SheetResponse> {
    const sheet = await this.updateSheetUseCase.execute(
      user.id,
      input.id,
      input.name,
    );
    return this.toResponse(sheet);
  }

  @Mutation(() => Boolean)
  async deleteSheet(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteSheetInput,
  ): Promise<boolean> {
    await this.deleteSheetUseCase.execute(user.id, input.id);
    return true;
  }

  @Mutation(() => Boolean)
  async updateSheetOrders(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateSheetOrdersInput,
  ): Promise<boolean> {
    await this.updateSheetOrdersUseCase.execute(
      user.id,
      input.sheets.map((s) => ({ id: s.id, order: s.order })),
    );
    return true;
  }

  private toResponse(sheet: Sheet): SheetResponse {
    return {
      id: sheet.id ?? '',
      name: sheet.name,
      userId: sheet.userId,
      order: sheet.order,
      created: sheet.created,
      updated: sheet.updated,
    };
  }
}
