import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261011101121 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "digital_product_media" add column if not exists "filename" text null, add column if not exists "version" integer not null default 1;`);

    this.addSql(`create table if not exists "digital_product_download" ("id" text not null, "media_id" text not null, "digital_product_order_id" text not null, "version" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "digital_product_download_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_digital_product_download_media_id" ON "digital_product_download" ("media_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_digital_product_download_digital_product_order_id" ON "digital_product_download" ("digital_product_order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_digital_product_download_deleted_at" ON "digital_product_download" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "digital_product_download" cascade;`);
    this.addSql(`alter table if exists "digital_product_media" drop column if exists "filename", drop column if exists "version";`);
  }

}
