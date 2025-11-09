-- CreateTable
CREATE TABLE IF NOT EXISTS "articles" (
    "article_id" TEXT NOT NULL,
    "sap_itemcode" TEXT,
    "sap_description" TEXT NOT NULL,
    "family" TEXT,
    "subfamily" TEXT,
    "internal_notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("article_id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "articles_sap_itemcode_key" ON "articles"("sap_itemcode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_articles_active" ON "articles"("active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_articles_family" ON "articles"("family");

-- AlterTable
ALTER TABLE "instruments" ADD COLUMN IF NOT EXISTS "article_id" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_instruments_article_id" ON "instruments"("article_id");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "instruments" ADD CONSTRAINT "instruments_article_id_fkey" 
    FOREIGN KEY ("article_id") REFERENCES "articles"("article_id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

