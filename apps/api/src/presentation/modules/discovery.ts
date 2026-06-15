import { Module } from '@nestjs/common';
import { DiscoveryResolver } from '../resolvers/discovery';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { DiscoveryRepository } from '../../infrastructure/repositories/discovery';
import { IDiscoveryRepository } from '../../domain/repositories/discovery';
import { GetPopularBooksUseCase } from '../../application/usecases/discovery/get-popular-books';
import { GetTopReadersUseCase } from '../../application/usecases/discovery/get-top-readers';

@Module({
  imports: [AuthModule],
  providers: [
    DiscoveryResolver,
    GetPopularBooksUseCase,
    GetTopReadersUseCase,
    {
      provide: IDiscoveryRepository,
      useClass: DiscoveryRepository,
    },
  ],
})
export class DiscoveryModule {}
