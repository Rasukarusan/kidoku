import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { SoftwareDesignService } from './software-design.service';
import {
  SoftwareDesignObject,
  SoftwareDesignListResponseDto,
} from './dto/software-design.object';
import { GetSoftwareDesignInput } from './dto/get-software-design.input';

@Resolver(() => SoftwareDesignObject)
export class SoftwareDesignResolver {
  constructor(private readonly softwareDesignService: SoftwareDesignService) {}

  @Query(() => SoftwareDesignObject, { name: 'latestSoftwareDesign' })
  getLatest(): SoftwareDesignObject {
    return this.softwareDesignService.getLatest();
  }

  @Query(() => SoftwareDesignObject, { name: 'softwareDesignByMonth' })
  getByMonth(
    @Args('year', { type: () => Int }) year: number,
    @Args('month', { type: () => Int }) month: number,
  ): SoftwareDesignObject {
    return this.softwareDesignService.getByYearMonth(year, month);
  }

  @Query(() => SoftwareDesignListResponseDto, { name: 'softwareDesignByYear' })
  getByYear(
    @Args('input') input: GetSoftwareDesignInput,
  ): SoftwareDesignListResponseDto {
    const items = this.softwareDesignService.getByYear(input.year);

    return {
      items,
      total: items.length,
    };
  }

  @Query(() => SoftwareDesignObject, {
    nullable: true,
    name: 'searchSoftwareDesignByISBN',
  })
  searchByISBN(
    @Args('isbn') isbn: string,
    @Args('year', { type: () => Int, nullable: true }) year?: number,
    @Args('month', { type: () => Int, nullable: true }) month?: number,
    @Args('title', { nullable: true }) title?: string,
  ): SoftwareDesignObject | null {
    return this.softwareDesignService.searchByISBN(isbn, year, month, title);
  }
}
