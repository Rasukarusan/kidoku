// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiConfig } from '@kidoku/eslint-config/api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default createApiConfig({
  tsconfigRootDir: __dirname,
  srcDir: path.resolve(__dirname, 'src'),
});
