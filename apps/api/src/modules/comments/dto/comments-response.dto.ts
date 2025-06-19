import { Field, ObjectType } from '@nestjs/graphql';
import { CommentObject } from './comment.object';

@ObjectType()
export class CommentsResponseDto {
  @Field(() => [CommentObject])
  comments: CommentObject[];

  @Field()
  hasMore: boolean;

  @Field()
  total: number;
}
