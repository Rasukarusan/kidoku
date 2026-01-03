import { Module } from '@nestjs/common';
import { SoftwareDesignResolver } from './software-design.resolver';
import { SoftwareDesignService } from './software-design.service';

@Module({
  providers: [SoftwareDesignResolver, SoftwareDesignService],
  exports: [SoftwareDesignService],
})
export class SoftwareDesignModule {}
