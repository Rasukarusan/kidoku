import { Module } from '@nestjs/common';
import { SheetResolver } from '../resolvers/sheet';
import { GetSheetsUseCase } from '../../application/usecases/sheets/get-sheets';
import { SheetRepository } from '../../infrastructure/repositories/sheet';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ISheetRepository } from 'src/domain/repositories/sheet';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    SheetResolver,
    GetSheetsUseCase,
    {
      provide: ISheetRepository,
      useClass: SheetRepository,
    },
  ],
})
export class SheetModule {}
