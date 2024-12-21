import { Migration } from '@mikro-orm/migrations';

export class Migration20241221064038 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "supplier" ("id" text not null, "name" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "supplier_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_supplier_deleted_at" ON "supplier" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "supplier" cascade;');
  }

}
