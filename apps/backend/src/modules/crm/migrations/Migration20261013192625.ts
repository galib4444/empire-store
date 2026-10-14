import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261013192625 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_record" drop constraint if exists "customer_record_customer_id_unique";`);
    this.addSql(`create table if not exists "customer_record" ("id" text not null, "customer_id" text not null, "tags" jsonb not null default '[]', "notes" jsonb not null default '[]', "newsletter_opt_in" boolean not null default false, "consent_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_record_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_record_customer_id_unique" ON "customer_record" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_record_deleted_at" ON "customer_record" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_record" cascade;`);
  }

}
