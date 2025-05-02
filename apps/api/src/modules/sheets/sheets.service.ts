import { Injectable } from '@nestjs/common';

@Injectable()
export class SheetsService {
  getSheets(): string {
    return 'Sheets World!';
  }
}
