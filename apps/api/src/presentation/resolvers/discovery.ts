import { Query, Resolver, Args, Int } from '@nestjs/graphql';
import { GetPopularBooksUseCase } from '../../application/usecases/discovery/get-popular-books';
import { GetTopReadersUseCase } from '../../application/usecases/discovery/get-top-readers';
import { PopularBookItem, TopReaderItem } from '../dto/discovery';

@Resolver()
export class DiscoveryResolver {
  constructor(
    private readonly getPopularBooksUseCase: GetPopularBooksUseCase,
    private readonly getTopReadersUseCase: GetTopReadersUseCase,
  ) {}

  @Query(() => [PopularBookItem])
  async popularBooks(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<PopularBookItem[]> {
    const items = await this.getPopularBooksUseCase.execute(limit ?? 10);
    return items.map((b) => ({
      id: b.id.toString(),
      title: b.title,
      author: b.author,
      image: b.image,
      username: b.username,
      userImage: b.userImage ?? undefined,
      sheet: b.sheet,
      likeCount: b.likeCount,
    }));
  }

  @Query(() => [TopReaderItem])
  async topReaders(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<TopReaderItem[]> {
    const items = await this.getTopReadersUseCase.execute(limit ?? 10);
    return items.map((u) => ({
      name: u.name,
      image: u.image ?? undefined,
      bookCount: u.bookCount,
    }));
  }
}
