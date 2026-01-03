import { Injectable } from '@nestjs/common';
import { SoftwareDesign } from '../../../domain/models/software-design';

@Injectable()
export class SearchSoftwareDesignByISBNUseCase {
  execute(
    isbn: string,
    year?: number,
    month?: number,
    title?: string,
  ): SoftwareDesign | null {
    return SoftwareDesign.fromISBN(isbn, year, month, title);
  }
}
