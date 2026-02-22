import { Module } from '@nestjs/common';
import { TemplateBookResolver } from '../resolvers/template-book';
import { GetTemplateBooksUseCase } from '../../application/usecases/template-books/get-template-books';
import { CreateTemplateBookUseCase } from '../../application/usecases/template-books/create-template-book';
import { DeleteTemplateBookUseCase } from '../../application/usecases/template-books/delete-template-book';
import { TemplateBookRepository } from '../../infrastructure/repositories/template-book';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { ITemplateBookRepository } from '../../domain/repositories/template-book';

@Module({
  imports: [AuthModule],
  providers: [
    TemplateBookResolver,
    GetTemplateBooksUseCase,
    CreateTemplateBookUseCase,
    DeleteTemplateBookUseCase,
    {
      provide: ITemplateBookRepository,
      useClass: TemplateBookRepository,
    },
  ],
})
export class TemplateBookModule {}
