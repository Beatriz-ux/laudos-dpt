/*
  Warnings:

  - You are about to drop the column `especie_tipo` on the `reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reports" DROP COLUMN "especie_tipo",
ADD COLUMN     "original_analysis_details" TEXT,
ADD COLUMN     "original_brand" TEXT,
ADD COLUMN     "original_chassi" TEXT,
ADD COLUMN     "original_color" TEXT,
ADD COLUMN     "original_licensed_to" TEXT,
ADD COLUMN     "original_model" TEXT,
ADD COLUMN     "original_motor" TEXT,
ADD COLUMN     "original_plate" TEXT,
ADD COLUMN     "original_species" TEXT,
ADD COLUMN     "original_type" TEXT,
ADD COLUMN     "vehicle_species" TEXT,
ADD COLUMN     "vehicle_type" TEXT;
