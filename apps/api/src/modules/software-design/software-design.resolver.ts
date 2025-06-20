import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { SoftwareDesignService } from './software-design.service';
import { SoftwareDesignObject, SoftwareDesignListResponseDto } from './dto/software-design.object';
import { GetSoftwareDesignInput } from './dto/get-software-design.input';

@Resolver(() => SoftwareDesignObject)
@UseGuards(GqlAuthGuard)
export class SoftwareDesignResolver {
  constructor(private readonly softwareDesignService: SoftwareDesignService) {}

  @Query(() => SoftwareDesignObject, { name: 'latestSoftwareDesign' })
  async getLatest(): Promise<SoftwareDesignObject> {
    return this.softwareDesignService.getLatest();
  }

  @Query(() => SoftwareDesignObject, { name: 'softwareDesignByMonth' })
  async getByMonth(
    @Args('year', { type: () => Int }) year: number,
    @Args('month', { type: () => Int }) month: number,
  ): Promise<SoftwareDesignObject> {
    return this.softwareDesignService.getByYearMonth(year, month);
  }

  @Query(() => SoftwareDesignListResponseDto, { name: 'softwareDesignByYear' })
  async getByYear(
    @Args('input') input: GetSoftwareDesignInput,
  ): Promise<SoftwareDesignListResponseDto> {
    const items = await this.softwareDesignService.getByYear(input.year);
    
    return {
      items,
      total: items.length,
    };
  }

  @Query(() => SoftwareDesignObject, { nullable: true, name: 'searchSoftwareDesignByISBN' })
  async searchByISBN(
    @Args('isbn') isbn: string,
    @Args('year', { type: () => Int, nullable: true }) year?: number,
    @Args('month', { type: () => Int, nullable: true }) month?: number,
  ): Promise<SoftwareDesignObject | null> {
    return this.softwareDesignService.searchByISBN(isbn, year, month);
  }
}