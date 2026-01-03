import { Injectable } from '@nestjs/common';
import { SoftwareDesign } from '../../../domain/models/software-design';

@Injectable()
export class GetSoftwareDesignByYearMonthUseCase {
  execute(year: number, month: number): SoftwareDesign {
    return SoftwareDesign.fromYearMonth(year, month);
  }
}
