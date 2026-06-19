import {
  Field,
  ObjectType,
  InputType,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { PaginatedResponse } from './paginated';

@InputType()
export class GetNotificationsInput {
  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  offset: number;
}

@ObjectType()
export class NotificationItemDto {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field(() => Int, { nullable: true })
  bookId?: number;

  @Field()
  read: boolean;

  @Field(() => GraphQLISODateTime)
  created: Date;

  @Field()
  actorName: string;

  @Field({ nullable: true })
  actorImage?: string;

  @Field({ nullable: true })
  bookTitle?: string;
}

@ObjectType()
export class NotificationResponse extends PaginatedResponse {
  @Field(() => [NotificationItemDto])
  notifications: NotificationItemDto[];
}
