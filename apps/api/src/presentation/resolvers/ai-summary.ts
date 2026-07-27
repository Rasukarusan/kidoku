import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args, Int } from '@nestjs/graphql';
import { GetAiSummariesUseCase } from '../../application/usecases/ai-summaries/get-ai-summaries';
import { GetAiSummaryUsageUseCase } from '../../application/usecases/ai-summaries/get-ai-summary-usage';
import { SaveAiSummaryUseCase } from '../../application/usecases/ai-summaries/save-ai-summary';
import { DeleteAiSummaryUseCase } from '../../application/usecases/ai-summaries/delete-ai-summary';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import {
  AiSummaryResponse,
  SaveAiSummaryInput,
  DeleteAiSummaryInput,
  DeleteAiSummaryResponse,
} from '../dto/ai-summary';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AiSummaryResolver {
  constructor(
    private readonly getAiSummariesUseCase: GetAiSummariesUseCase,
    private readonly getAiSummaryUsageUseCase: GetAiSummaryUsageUseCase,
    private readonly saveAiSummaryUseCase: SaveAiSummaryUseCase,
    private readonly deleteAiSummaryUseCase: DeleteAiSummaryUseCase,
  ) {}

  @Query(() => [AiSummaryResponse])
  async aiSummaries(
    @CurrentUser() user: { id: string },
    @Args('sheetName') sheetName: string,
  ): Promise<AiSummaryResponse[]> {
    const summaries = await this.getAiSummariesUseCase.execute(
      user.id,
      sheetName,
    );
    return summaries.map((summary) => ({
      id: parseInt(summary.id ?? '0', 10),
      analysis: summary.analysis,
    }));
  }

  @Query(() => Int)
  async aiSummaryUsage(@CurrentUser() user: { id: string }): Promise<number> {
    return await this.getAiSummaryUsageUseCase.execute(user.id);
  }

  @Mutation(() => Boolean)
  async saveAiSummary(
    @CurrentUser() user: { id: string },
    @Args('input') input: SaveAiSummaryInput,
  ): Promise<boolean> {
    await this.saveAiSummaryUseCase.execute(
      user.id,
      input.sheetName,
      input.analysis,
    );
    return true;
  }

  @Mutation(() => DeleteAiSummaryResponse)
  async deleteAiSummary(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteAiSummaryInput,
  ): Promise<DeleteAiSummaryResponse> {
    const deletedCount = await this.deleteAiSummaryUseCase.execute(
      input.id,
      user.id,
    );
    return { deletedCount };
  }
}
