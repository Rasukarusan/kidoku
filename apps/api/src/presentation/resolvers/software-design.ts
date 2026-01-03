import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { GetLatestSoftwareDesignUseCase } from '../../application/usecases/software-design/get-latest';
import { GetSoftwareDesignByYearMonthUseCase } from '../../application/usecases/software-design/get-by-year-month';
import { GetSoftwareDesignByYearUseCase } from '../../application/usecases/software-design/get-by-year';
import { SearchSoftwareDesignByISBNUseCase } from '../../application/usecases/software-design/search-by-isbn';
import { SoftwareDesign } from '../../domain/models/software-design';
import {
  SoftwareDesignResponse,
  SoftwareDesignListResponse,
  GetSoftwareDesignInput,
} from '../dto/software-design';

@Resolver(() => SoftwareDesignResponse)
export class SoftwareDesignResolver {
  constructor(
    private readonly getLatestUseCase: GetLatestSoftwareDesignUseCase,
    private readonly getByYearMonthUseCase: GetSoftwareDesignByYearMonthUseCase,
    private readonly getByYearUseCase: GetSoftwareDesignByYearUseCase,
    private readonly searchByISBNUseCase: SearchSoftwareDesignByISBNUseCase,
  ) {}

  @Query(() => SoftwareDesignResponse, { name: 'latestSoftwareDesign' })
  getLatest(): SoftwareDesignResponse {
    const result = this.getLatestUseCase.execute();
    return this.toResponse(result);
  }

  @Query(() => SoftwareDesignResponse, { name: 'softwareDesignByMonth' })
  getByMonth(
    @Args('year', { type: () => Int }) year: number,
    @Args('month', { type: () => Int }) month: number,
  ): SoftwareDesignResponse {
    const result = this.getByYearMonthUseCase.execute(year, month);
    return this.toResponse(result);
  }

  @Query(() => SoftwareDesignListResponse, { name: 'softwareDesignByYear' })
  getByYear(
    @Args('input') input: GetSoftwareDesignInput,
  ): SoftwareDesignListResponse {
    const items = this.getByYearUseCase.execute(input.year);

    return {
      items: items.map((item) => this.toResponse(item)),
      total: items.length,
    };
  }

  @Query(() => SoftwareDesignResponse, {
    nullable: true,
    name: 'searchSoftwareDesignByISBN',
  })
  searchByISBN(
    @Args('isbn') isbn: string,
    @Args('year', { type: () => Int, nullable: true }) year?: number,
    @Args('month', { type: () => Int, nullable: true }) month?: number,
    @Args('title', { nullable: true }) title?: string,
  ): SoftwareDesignResponse | null {
    const result = this.searchByISBNUseCase.execute(isbn, year, month, title);
    return result ? this.toResponse(result) : null;
  }

  private toResponse(domain: SoftwareDesign): SoftwareDesignResponse {
    return {
      yearMonth: domain.yearMonth,
      title: domain.title,
      coverImageUrl: domain.coverImageUrl,
      publishDate: domain.publishDate,
      isbn: domain.isbn,
      author: domain.author,
      category: domain.category,
      image: domain.image,
      memo: domain.memo,
    };
  }
}
