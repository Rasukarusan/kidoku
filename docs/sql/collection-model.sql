-- One-time migration. Stop all writers and take a verified backup before applying.
-- Run scripts/migrate-collections.mjs for preflight checks and a migration ledger.
-- MySQL DDL is NOT transactional. Restore the backup if any step fails.

RENAME TABLE sheets TO collections, books TO items, template_books TO item_templates, yearly_top_books TO collection_highlights, book_comments TO item_comments;

ALTER TABLE collections CHANGE COLUMN `order` position INT NOT NULL DEFAULT 1, CHANGE COLUMN created created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CHANGE COLUMN updated updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN description TEXT;
UPDATE collections SET description = '' WHERE description IS NULL;
ALTER TABLE collections MODIFY COLUMN description TEXT NOT NULL;

CREATE TABLE item_types (
  `key` VARCHAR(40) NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  schema_version INT NOT NULL DEFAULT 1,
  definition JSON NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO item_types (`key`, name, definition) VALUES
('book', '本', '{"fields":[{"key":"authors","label":"著者","type":"textList","maxLength":120},{"key":"isbn","label":"ISBN","type":"text","maxLength":20}],"logKinds":[{"key":"read","label":"読了","dateLabel":"読了日"},{"key":"purchased","label":"購入","dateLabel":"購入日"}],"itemUnit":"冊","searchProvider":"books","analysis":["reading"]}'),
('movie', '映画', '{"fields":[{"key":"directors","label":"監督","type":"textList","maxLength":120},{"key":"releaseYear","label":"公開年","type":"number","min":1888,"max":9999},{"key":"runtimeMinutes","label":"上映時間（分）","type":"number","min":1,"max":100000}],"logKinds":[{"key":"watched","label":"鑑賞","dateLabel":"鑑賞日"},{"key":"purchased","label":"購入","dateLabel":"購入日"}],"itemUnit":"作品"}');

ALTER TABLE items ADD COLUMN item_type_id VARCHAR(40) NOT NULL DEFAULT 'book', ADD COLUMN attributes JSON, ADD COLUMN attributes_version INT NOT NULL DEFAULT 1;
UPDATE items SET attributes = JSON_OBJECT('authors', JSON_ARRAY(author));
ALTER TABLE items MODIFY COLUMN attributes JSON NOT NULL;

CREATE TABLE collection_items (
  collection_id INT UNSIGNED NOT NULL,
  item_id INT UNSIGNED NOT NULL,
  position INT NOT NULL DEFAULT 1,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (collection_id, item_id),
  INDEX collection_items_item_id_idx (item_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO collection_items (collection_id, item_id, added_at) SELECT sheet_id, id, created FROM items;

CREATE TABLE item_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  item_id INT UNSIGNED NOT NULL,
  kind VARCHAR(40) NOT NULL,
  occurred_at DATETIME NULL,
  memo MEDIUMTEXT NOT NULL,
  rating VARCHAR(5) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX item_logs_item_id_occurred_at_idx (item_id, occurred_at)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO item_logs (item_id, kind, occurred_at, memo, rating, created_at, updated_at) SELECT id, 'read', finished, '', NULL, created, updated FROM items WHERE finished IS NOT NULL;

ALTER TABLE collection_highlights ADD COLUMN collection_id INT UNSIGNED NULL;
UPDATE collection_highlights h JOIN collections c ON c.user_id = h.user_id AND BINARY c.name = BINARY h.year SET h.collection_id = c.id;
ALTER TABLE collection_highlights MODIFY COLUMN collection_id INT UNSIGNED NOT NULL, CHANGE COLUMN book_id item_id INT UNSIGNED NOT NULL, ADD UNIQUE INDEX collection_highlights_collection_position (collection_id, `order`);
ALTER TABLE collection_highlights DROP INDEX uniq_user_order_year, DROP COLUMN user_id, DROP COLUMN year, CHANGE COLUMN `order` position INT NOT NULL, CHANGE COLUMN created created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CHANGE COLUMN updated updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD INDEX collection_highlights_item_id_idx (item_id);
ALTER TABLE ai_summaries CHANGE COLUMN sheet_id collection_id INT NOT NULL;
ALTER TABLE likes CHANGE COLUMN book_id item_id INT UNSIGNED NOT NULL;
ALTER TABLE purchases CHANGE COLUMN book_id item_id INT UNSIGNED NOT NULL;
ALTER TABLE notifications CHANGE COLUMN book_id item_id INT UNSIGNED NULL;
ALTER TABLE item_comments CHANGE COLUMN book_id item_id INT UNSIGNED NOT NULL;

ALTER TABLE items DROP COLUMN sheet_id, DROP COLUMN author, DROP COLUMN finished, CHANGE COLUMN image image_url VARCHAR(255) NOT NULL DEFAULT '/no-image.png', CHANGE COLUMN impression rating VARCHAR(5) NOT NULL DEFAULT '-', CHANGE COLUMN created created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CHANGE COLUMN updated updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, MODIFY COLUMN category VARCHAR(120) NOT NULL DEFAULT '', ALTER COLUMN item_type_id DROP DEFAULT, ADD INDEX items_user_id_item_type_id_idx (user_id, item_type_id), ADD INDEX items_item_type_id_idx (item_type_id);
ALTER TABLE item_templates ADD COLUMN item_type_id VARCHAR(40) NOT NULL DEFAULT 'book', ADD COLUMN attributes JSON, ADD COLUMN attributes_version INT NOT NULL DEFAULT 1;
UPDATE item_templates SET attributes = JSON_OBJECT('authors', JSON_ARRAY(author));
ALTER TABLE item_templates MODIFY COLUMN attributes JSON NOT NULL, DROP COLUMN author, CHANGE COLUMN image image_url VARCHAR(255) NOT NULL, CHANGE COLUMN created created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CHANGE COLUMN updated updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ALTER COLUMN item_type_id DROP DEFAULT, ADD INDEX item_templates_user_id_item_type_id_idx (user_id, item_type_id), ADD INDEX item_templates_item_type_id_idx (item_type_id);

ALTER TABLE mcp_grants ADD COLUMN scope VARCHAR(40) NOT NULL DEFAULT 'books:read';

-- Read-only compatibility projections. These are Prisma views, not storage models.
-- Only books with a collection appear in old APIs that require a sheet.
CREATE VIEW legacy_books AS SELECT i.id, i.user_id, (SELECT MIN(ci.collection_id) FROM collection_items ci WHERE ci.item_id = i.id) AS sheet_id, i.title, COALESCE(JSON_UNQUOTE(JSON_EXTRACT(i.attributes, '$.authors[0]')), '') AS author, i.category, i.image_url AS image, i.rating AS impression, i.memo, i.is_public_memo, i.is_purchasable, i.price, (SELECT l.occurred_at FROM item_logs l WHERE l.item_id = i.id AND l.kind = 'read' ORDER BY l.created_at DESC, l.id DESC LIMIT 1) AS finished, i.created_at AS created, i.updated_at AS updated FROM items i WHERE i.item_type_id = 'book' AND EXISTS (SELECT 1 FROM collection_items ci WHERE ci.item_id = i.id);
CREATE VIEW legacy_sheets AS SELECT id, user_id, name, position AS `order`, created_at AS created, updated_at AS updated FROM collections;
CREATE VIEW legacy_template_books AS SELECT id, user_id, name, title, COALESCE(JSON_UNQUOTE(JSON_EXTRACT(attributes, '$.authors[0]')), '') AS author, category, image_url AS image, memo, is_public_memo, created_at AS created, updated_at AS updated FROM item_templates WHERE item_type_id = 'book';

CREATE VIEW legacy_collection_highlights AS SELECT h.id, c.user_id, h.collection_id, h.item_id, h.position AS `order`, c.name AS year, h.created_at AS created, h.updated_at AS updated FROM collection_highlights h JOIN collections c ON c.id = h.collection_id JOIN items i ON i.id = h.item_id WHERE i.item_type_id = 'book';
