import { Module } from '@nestjs/common';
import { SoftwareDesignResolver } from '../resolvers/software-design';
import { GetLatestSoftwareDesignUseCase } from '../../application/usecases/software-design/get-latest';
import { GetSoftwareDesignByYearMonthUseCase } from '../../application/usecases/software-design/get-by-year-month';
import { GetSoftwareDesignByYearUseCase } from '../../application/usecases/software-design/get-by-year';
import { SearchSoftwareDesignByISBNUseCase } from '../../application/usecases/software-design/search-by-isbn';

@Module({
  providers: [
    SoftwareDesignResolver,
    GetLatestSoftwareDesignUseCase,
    GetSoftwareDesignByYearMonthUseCase,
    GetSoftwareDesignByYearUseCase,
    SearchSoftwareDesignByISBNUseCase,
  ],
})
export class SoftwareDesignModule {}
