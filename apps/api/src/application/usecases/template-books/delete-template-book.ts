import { Injectable } from '@nestjs/common';
import { ITemplateBookRepository } from '../../../domain/repositories/template-book';

@Injectable()
export class DeleteTemplateBookUseCase {
  constructor(
    private readonly templateBookRepository: ITemplateBookRepository,
  ) {}

  async execute(id: number, userId: string): Promise<void> {
    await this.templateBookRepository.delete(id, userId);
  }
}
