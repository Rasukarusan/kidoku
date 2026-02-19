import { Module } from '@nestjs/common';
import { SheetResolver } from '../resolvers/sheet';
import { GetSheetsUseCase } from '../../application/usecases/sheets/get-sheets';
import { CreateSheetUseCase } from '../../application/usecases/sheets/create-sheet';
import { UpdateSheetUseCase } from '../../application/usecases/sheets/update-sheet';
import { DeleteSheetUseCase } from '../../application/usecases/sheets/delete-sheet';
import { UpdateSheetOrdersUseCase } from '../../application/usecases/sheets/update-sheet-orders';
import { SheetRepository } from '../../infrastructure/repositories/sheet';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { ISheetRepository } from '../../domain/repositories/sheet';

@Module({
  imports: [AuthModule],
  providers: [
    SheetResolver,
    GetSheetsUseCase,
    CreateSheetUseCase,
    UpdateSheetUseCase,
    DeleteSheetUseCase,
    UpdateSheetOrdersUseCase,
    {
      provide: ISheetRepository,
      useClass: SheetRepository,
    },
  ],
})
export class SheetModule {}
