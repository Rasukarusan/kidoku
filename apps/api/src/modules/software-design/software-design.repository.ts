import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../shared/constants/injection-tokens';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../../infrastructure/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class SoftwareDesignRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: MySql2Database<typeof schema>,
  ) {}

  async findBookByTitle(title: string) {
    const books = await this.db
      .select()
      .from(schema.books)
      .where(eq(schema.books.title, title))
      .limit(1);

    return books[0] || null;
  }

  async findAdminUser() {
    const users = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.admin, 1))
      .limit(1);

    return users[0] || null;
  }

  async createTemplate(data: {
    userId: string;
    name: string;
    title: string;
    author: string;
    category: string;
    image: string;
    memo: string;
  }) {
    await this.db.insert(schema.templateBooks).values({
      ...data,
      isPublicMemo: 0,
      created: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    // 挿入したデータを取得
    const templates = await this.db
      .select()
      .from(schema.templateBooks)
      .where(eq(schema.templateBooks.name, data.name))
      .limit(1);

    return templates[0] || null;
  }
}
