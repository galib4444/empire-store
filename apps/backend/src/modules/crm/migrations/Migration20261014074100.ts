import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261014074100 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_record" alter column "tags" type jsonb using ("tags"::jsonb);`);
    this.addSql(`alter table if exists "customer_record" alter column "tags" set default '{"items":[]}';`);
    this.addSql(`alter table if exists "customer_record" alter column "notes" type jsonb using ("notes"::jsonb);`);
    this.addSql(`alter table if exists "customer_record" alter column "notes" set default '{"items":[]}';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "customer_record" alter column "tags" type jsonb using ("tags"::jsonb);`);
    this.addSql(`alter table if exists "customer_record" alter column "tags" set default '[]';`);
    this.addSql(`alter table if exists "customer_record" alter column "notes" type jsonb using ("notes"::jsonb);`);
    this.addSql(`alter table if exists "customer_record" alter column "notes" set default '[]';`);
  }

}
