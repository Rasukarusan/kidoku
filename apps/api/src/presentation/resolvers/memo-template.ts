import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetMemoTemplatesUseCase } from '../../application/usecases/memo-templates/get-memo-templates';
import { CreateMemoTemplateUseCase } from '../../application/usecases/memo-templates/create-memo-template';
import { UpdateMemoTemplateUseCase } from '../../application/usecases/memo-templates/update-memo-template';
import { DeleteMemoTemplateUseCase } from '../../application/usecases/memo-templates/delete-memo-template';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { MemoTemplate } from '../../domain/models/memo-template';
import {
  MemoTemplateResponse,
  CreateMemoTemplateInput,
  UpdateMemoTemplateInput,
  DeleteMemoTemplateInput,
} from '../dto/memo-template';

@Resolver()
@UseGuards(GqlAuthGuard)
export class MemoTemplateResolver {
  constructor(
    private readonly getMemoTemplatesUseCase: GetMemoTemplatesUseCase,
    private readonly createMemoTemplateUseCase: CreateMemoTemplateUseCase,
    private readonly updateMemoTemplateUseCase: UpdateMemoTemplateUseCase,
    private readonly deleteMemoTemplateUseCase: DeleteMemoTemplateUseCase,
  ) {}

  @Query(() => [MemoTemplateResponse])
  async memoTemplates(
    @CurrentUser() user: { id: string },
  ): Promise<MemoTemplateResponse[]> {
    const items = await this.getMemoTemplatesUseCase.execute(user.id);
    return items.map((item) => this.toResponse(item));
  }

  @Mutation(() => MemoTemplateResponse)
  async createMemoTemplate(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateMemoTemplateInput,
  ): Promise<MemoTemplateResponse> {
    const memoTemplate = await this.createMemoTemplateUseCase.execute({
      userId: user.id,
      name: input.name,
      content: input.content,
      isDefault: input.isDefault,
    });
    return this.toResponse(memoTemplate);
  }

  @Mutation(() => MemoTemplateResponse)
  async updateMemoTemplate(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateMemoTemplateInput,
  ): Promise<MemoTemplateResponse> {
    const memoTemplate = await this.updateMemoTemplateUseCase.execute({
      id: input.id,
      userId: user.id,
      name: input.name,
      content: input.content,
      isDefault: input.isDefault,
    });
    return this.toResponse(memoTemplate);
  }

  @Mutation(() => Boolean)
  async deleteMemoTemplate(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteMemoTemplateInput,
  ): Promise<boolean> {
    await this.deleteMemoTemplateUseCase.execute(input.id, user.id);
    return true;
  }

  private toResponse(item: MemoTemplate): MemoTemplateResponse {
    return {
      id: item.id ?? '',
      name: item.name,
      content: item.content,
      isDefault: item.isDefault,
      created: item.created,
      updated: item.updated,
    };
  }
}
