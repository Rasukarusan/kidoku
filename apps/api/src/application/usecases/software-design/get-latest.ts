import { Injectable } from '@nestjs/common';
import { SoftwareDesign } from '../../../domain/models/software-design';

@Injectable()
export class GetLatestSoftwareDesignUseCase {
  execute(): SoftwareDesign {
    return SoftwareDesign.getLatest();
  }
}
