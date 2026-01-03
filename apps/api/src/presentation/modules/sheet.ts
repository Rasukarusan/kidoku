import { Module } from '@nestjs/common';
import { SheetResolver } from '../resolvers/sheet';
import { GetSheetsUseCase } from '../../application/usecases/sheets/get-sheets';
import { SheetsRepository } from '../../infrastructure/repositories/sheets.repository';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { ISheetRepository } from 'src/domain/repositories/sheet';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    SheetResolver,
    GetSheetsUseCase,
    {
      provide: ISheetRepository,
      useClass: SheetsRepository,
    },
  ],
})
export class SheetModule {}
