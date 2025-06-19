import { Args, Query, Resolver } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { CommentsResponseDto } from './dto/comments-response.dto';
import { GetCommentsInput } from './dto/get-comments.input';

@Resolver()
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Query(() => CommentsResponseDto)
  async comments(
    @Args('input') input: GetCommentsInput,
  ): Promise<CommentsResponseDto> {
    return this.commentsService.getComments(input);
  }
}
