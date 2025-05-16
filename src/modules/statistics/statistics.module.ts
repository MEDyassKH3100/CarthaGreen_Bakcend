import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Sensor, SensorSchema } from '../sensors/schemas/sensor.schema';
import { SensorData, SensorDataSchema } from '../sensors/schemas/sensor-data.schema';
import { Device, DeviceSchema } from '../devices/schemas/device.schema';
import { Alert, AlertSchema } from '../alerts/schemas/alert.schema';
import { Plant, PlantSchema } from '../plants/schemas/plant.schema';
import { Plantation, PlantationSchema } from '../plants/schemas/plantation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sensor.name, schema: SensorSchema },
      { name: SensorData.name, schema: SensorDataSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Alert.name, schema: AlertSchema },
      { name: Plant.name, schema: PlantSchema },
      { name: Plantation.name, schema: PlantationSchema },
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}