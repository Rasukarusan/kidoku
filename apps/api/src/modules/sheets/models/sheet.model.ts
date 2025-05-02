import { InferModel } from 'drizzle-orm';
import { sheets } from '../../../database/schema/';

export type Sheet = InferModel<typeof sheets>;
