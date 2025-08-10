import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { HeaderStrategy } from './header.strategy';

@Module({
  imports: [ConfigModule, PassportModule],
  providers: [HeaderStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
