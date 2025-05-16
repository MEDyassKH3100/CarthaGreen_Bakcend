import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorsController } from './sensors.controller';
import { SensorsService } from './sensors.service';
import { Sensor, SensorSchema } from './schemas/sensor.schema';
import { SensorData, SensorDataSchema } from './schemas/sensor-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sensor.name, schema: SensorSchema },
      { name: SensorData.name, schema: SensorDataSchema },
    ]),
  ],
  controllers: [SensorsController],
  providers: [SensorsService],
  exports: [SensorsService],
})
export class SensorsModule {}