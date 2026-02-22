import { TemplateBook } from '../models/template-book';

export abstract class ITemplateBookRepository {
  abstract findByUserId(userId: string): Promise<TemplateBook[]>;
  abstract save(templateBook: TemplateBook): Promise<TemplateBook>;
  abstract delete(id: number, userId: string): Promise<void>;
}
