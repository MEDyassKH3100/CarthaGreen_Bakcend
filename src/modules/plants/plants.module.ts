import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlantsController } from './plants.controller';
import { PlantsService } from './plants.service';
import { Plant, PlantSchema } from './schemas/plant.schema';
import { Plantation, PlantationSchema } from './schemas/plantation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plant.name, schema: PlantSchema },
      { name: Plantation.name, schema: PlantationSchema },
    ]),
  ],
  controllers: [PlantsController],
  providers: [PlantsService],
  exports: [PlantsService],
})
export class PlantsModule {}