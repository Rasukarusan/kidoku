import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetTemplateBooksUseCase } from '../../application/usecases/template-books/get-template-books';
import { CreateTemplateBookUseCase } from '../../application/usecases/template-books/create-template-book';
import { DeleteTemplateBookUseCase } from '../../application/usecases/template-books/delete-template-book';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { TemplateBook } from '../../domain/models/template-book';
import {
  TemplateBookResponse,
  CreateTemplateBookInput,
  DeleteTemplateBookInput,
} from '../dto/template-book';

@Resolver()
@UseGuards(GqlAuthGuard)
export class TemplateBookResolver {
  constructor(
    private readonly getTemplateBooksUseCase: GetTemplateBooksUseCase,
    private readonly createTemplateBookUseCase: CreateTemplateBookUseCase,
    private readonly deleteTemplateBookUseCase: DeleteTemplateBookUseCase,
  ) {}

  @Query(() => [TemplateBookResponse])
  async templateBooks(
    @CurrentUser() user: { id: string },
  ): Promise<TemplateBookResponse[]> {
    const items = await this.getTemplateBooksUseCase.execute(user.id);
    return items.map((item) => this.toResponse(item));
  }

  @Mutation(() => TemplateBookResponse)
  async createTemplateBook(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateTemplateBookInput,
  ): Promise<TemplateBookResponse> {
    const templateBook = await this.createTemplateBookUseCase.execute({
      userId: user.id,
      name: input.name,
      title: input.title,
      author: input.author,
      category: input.category,
      image: input.image,
      memo: input.memo,
      isPublicMemo: input.isPublicMemo,
    });
    return this.toResponse(templateBook);
  }

  @Mutation(() => Boolean)
  async deleteTemplateBook(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteTemplateBookInput,
  ): Promise<boolean> {
    await this.deleteTemplateBookUseCase.execute(input.id, user.id);
    return true;
  }

  private toResponse(item: TemplateBook): TemplateBookResponse {
    return {
      id: item.id ?? '',
      name: item.name,
      title: item.title,
      author: item.author,
      category: item.category,
      image: item.image,
      memo: item.memo,
      isPublicMemo: item.isPublicMemo,
      created: item.created,
      updated: item.updated,
    };
  }
}
