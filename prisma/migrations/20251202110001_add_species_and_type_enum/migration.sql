/*
  Warnings:

  - The `original_species` column on the `reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `original_type` column on the `reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `vehicle_species` column on the `reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `vehicle_type` column on the `reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VehicleSpecies" AS ENUM ('PASSAGEIRO', 'CARGA', 'MISTO', 'COMPETICAO', 'COLECAO', 'TRACAO', 'ESPECIAL', 'LOCOMOCAO', 'ENSINO', 'AUTORIDADE', 'VISITANTE');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('AUTOMOVEL', 'CAMIONETA', 'CAMIONETA_MISTA', 'CAMINHAO', 'CAMINHAO_TRATOR', 'UTILITARIO', 'MICROONIBUS', 'ONIBUS', 'REBOQUE', 'SEMI_REBOQUE', 'MOTOCICLETA', 'MOTONETA', 'CICLOMOTOR', 'TRICICLO', 'QUADRICICLO', 'BICICLETA_MOTORIZADA', 'ESPECIAL', 'SIDE_CAR', 'CHASSI_PLATAFORMA', 'TRATOR_RODAS', 'TRATOR_ESTEIRAS', 'TRATOR_MISTO', 'MAQUINA_TERRAPLANAGEM', 'MAQUINA_AGRICOLA');

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "original_species",
ADD COLUMN     "original_species" "VehicleSpecies",
DROP COLUMN "original_type",
ADD COLUMN     "original_type" "VehicleType",
DROP COLUMN "vehicle_species",
ADD COLUMN     "vehicle_species" "VehicleSpecies",
DROP COLUMN "vehicle_type",
ADD COLUMN     "vehicle_type" "VehicleType";
