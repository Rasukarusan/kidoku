import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args, Int } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GetNotificationsUseCase } from '../../application/usecases/notifications/get-notifications';
import { GetUnreadCountUseCase } from '../../application/usecases/notifications/get-unread-count';
import { MarkNotificationsReadUseCase } from '../../application/usecases/notifications/mark-notifications-read';
import {
  GetNotificationsInput,
  NotificationResponse,
  NotificationItemDto,
} from '../dto/notification';

@Resolver()
export class NotificationResolver {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly markNotificationsReadUseCase: MarkNotificationsReadUseCase,
  ) {}

  @Query(() => NotificationResponse)
  @UseGuards(GqlAuthGuard)
  async notifications(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetNotificationsInput,
  ): Promise<NotificationResponse> {
    const result = await this.getNotificationsUseCase.execute(
      user.id,
      input.limit,
      input.offset,
    );
    return {
      notifications: result.items.map(
        (n): NotificationItemDto => ({
          id: n.id.toString(),
          type: n.type,
          bookId: n.bookId ?? undefined,
          read: n.read,
          created: n.created,
          actorName: n.actorName,
          actorImage: n.actorImage ?? undefined,
          bookTitle: n.bookTitle ?? undefined,
        }),
      ),
      total: result.total,
      hasMore: result.hasMore,
    };
  }

  @Query(() => Int)
  @UseGuards(GqlAuthGuard)
  async unreadNotificationCount(
    @CurrentUser() user: { id: string },
  ): Promise<number> {
    return this.getUnreadCountUseCase.execute(user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markNotificationsRead(
    @CurrentUser() user: { id: string },
  ): Promise<boolean> {
    return this.markNotificationsReadUseCase.execute(user.id);
  }
}
