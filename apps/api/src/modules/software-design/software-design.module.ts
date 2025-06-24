import { Module } from '@nestjs/common';
import { SoftwareDesignResolver } from './software-design.resolver';
import { SoftwareDesignService } from './software-design.service';
import { SoftwareDesignController } from './software-design.controller';
import { SoftwareDesignRepository } from './software-design.repository';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    SoftwareDesignResolver,
    SoftwareDesignService,
    SoftwareDesignRepository,
  ],
  controllers: [SoftwareDesignController],
  exports: [SoftwareDesignService],
})
export class SoftwareDesignModule {}
