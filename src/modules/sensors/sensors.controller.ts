import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { CreateSensorDataDto } from './dto/create-sensor-data.dto';
import { QuerySensorDataDto } from './dto/query-sensor-data.dto';

@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  // Endpoints pour les capteurs
  @Post()
  @UseGuards(JwtAuthGuard)
  async createSensor(@Body() createSensorDto: CreateSensorDto) {
    const sensor = await this.sensorsService.createSensor(createSensorDto);
    return {
      success: true,
      message: 'Capteur créé avec succès',
      sensor
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllSensors(@Query('deviceId') deviceId?: string) {
    const sensors = await this.sensorsService.findAllSensors(deviceId);
    return {
      success: true,
      count: sensors.length,
      sensors
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findSensorById(@Param('id') id: string) {
    const sensor = await this.sensorsService.findSensorById(id);
    return {
      success: true,
      sensor
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateSensor(
    @Param('id') id: string,
    @Body() updateSensorDto: UpdateSensorDto,
  ) {
    const updatedSensor = await this.sensorsService.updateSensor(id, updateSensorDto);
    return {
      success: true,
      message: 'Capteur mis à jour avec succès',
      sensor: updatedSensor
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteSensor(@Param('id') id: string) {
    await this.sensorsService.deleteSensor(id);
    return {
      success: true,
      message: 'Capteur supprimé avec succès'
    };
  }

  // Endpoints pour les données des capteurs
  @Post('data')
  async createSensorData(@Body() createSensorDataDto: CreateSensorDataDto) {
    const sensorData = await this.sensorsService.createSensorData(createSensorDataDto);
    return {
      success: true,
      message: 'Données du capteur enregistrées avec succès',
      sensorData
    };
  }

  @Get('data/query')
  @UseGuards(JwtAuthGuard)
  async findSensorData(@Query() queryDto: QuerySensorDataDto) {
    const sensorData = await this.sensorsService.findSensorData(queryDto);
    return {
      success: true,
      count: sensorData.length,
      sensorData
    };
  }

  @Get('data/latest/:sensorId')
  @UseGuards(JwtAuthGuard)
  async getLatestSensorData(@Param('sensorId') sensorId: string) {
    const latestData = await this.sensorsService.getLatestSensorData(sensorId);
    return {
      success: true,
      data: latestData
    };
  }

  @Delete('data/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSensorData(@Param('id') id: string) {
    await this.sensorsService.deleteSensorData(id);
    return {
      success: true,
      message: 'Données du capteur supprimées avec succès'
    };
  }

  // Endpoints pour les statistiques
  @Get('statistics/:sensorId')
  @UseGuards(JwtAuthGuard)
  async getSensorStatistics(
    @Param('sensorId') sensorId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const statistics = await this.sensorsService.getSensorStatistics(
      sensorId,
      new Date(startDate),
      new Date(endDate),
    );
    return {
      success: true,
      statistics
    };
  }
}