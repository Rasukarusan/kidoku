import { Injectable } from '@nestjs/common';
import { SoftwareDesign } from '../../../domain/models/software-design';

@Injectable()
export class GetSoftwareDesignByYearUseCase {
  execute(year: number): SoftwareDesign[] {
    return SoftwareDesign.getByYear(year);
  }
}
