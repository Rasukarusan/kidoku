import { Module } from '@nestjs/common';
import { MemoTemplateResolver } from '../resolvers/memo-template';
import { GetMemoTemplatesUseCase } from '../../application/usecases/memo-templates/get-memo-templates';
import { CreateMemoTemplateUseCase } from '../../application/usecases/memo-templates/create-memo-template';
import { UpdateMemoTemplateUseCase } from '../../application/usecases/memo-templates/update-memo-template';
import { DeleteMemoTemplateUseCase } from '../../application/usecases/memo-templates/delete-memo-template';
import { MemoTemplateRepository } from '../../infrastructure/repositories/memo-template';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IMemoTemplateRepository } from '../../domain/repositories/memo-template';

@Module({
  imports: [AuthModule],
  providers: [
    MemoTemplateResolver,
    GetMemoTemplatesUseCase,
    CreateMemoTemplateUseCase,
    UpdateMemoTemplateUseCase,
    DeleteMemoTemplateUseCase,
    {
      provide: IMemoTemplateRepository,
      useClass: MemoTemplateRepository,
    },
  ],
})
export class MemoTemplateModule {}
