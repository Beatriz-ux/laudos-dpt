/*
  Warnings:

  - You are about to drop the column `part` on the `vehicle_photos` table. All the data in the column will be lost.
  - You are about to drop the column `photo_url` on the `vehicle_photos` table. All the data in the column will be lost.
  - Added the required column `category` to the `vehicle_photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo_data` to the `vehicle_photos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "analysis_conclusion" TEXT,
ADD COLUMN     "autoridade_requisitante" TEXT,
ADD COLUMN     "central_eletronica_info" TEXT,
ADD COLUMN     "data_guia_oficio" TIMESTAMP(3),
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "especie_tipo" TEXT,
ADD COLUMN     "expert_signature" TEXT,
ADD COLUMN     "glass_info" TEXT,
ADD COLUMN     "guia_oficio" TEXT,
ADD COLUMN     "historico" TEXT,
ADD COLUMN     "motor_info" TEXT,
ADD COLUMN     "objetivo_pericia" TEXT,
ADD COLUMN     "ocorrencia_policial" TEXT,
ADD COLUMN     "oficio" TEXT,
ADD COLUMN     "orgao_requisitante" TEXT,
ADD COLUMN     "outras_numeracoes" TEXT,
ADD COLUMN     "placa_portada" TEXT,
ADD COLUMN     "plate_info" TEXT,
ADD COLUMN     "preambulo" TEXT,
ADD COLUMN     "series_auxiliares" TEXT,
ADD COLUMN     "vehicle_category" TEXT,
ADD COLUMN     "vehicle_is_adulterated" BOOLEAN DEFAULT false,
ADD COLUMN     "vehicle_licensed_to" TEXT,
ADD COLUMN     "vehicle_serie_motor" TEXT,
ADD COLUMN     "vehicle_technical_condition" TEXT,
ADD COLUMN     "vehicle_vin" TEXT,
ADD COLUMN     "vidro" TEXT;

-- AlterTable
ALTER TABLE "vehicle_photos" DROP COLUMN "part",
DROP COLUMN "photo_url",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "photo_data" TEXT NOT NULL,
ADD COLUMN     "subtype" TEXT;
