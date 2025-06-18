import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}