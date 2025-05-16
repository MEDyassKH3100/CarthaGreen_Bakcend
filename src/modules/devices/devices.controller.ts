import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceStatus } from './schemas/device.schema';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createDevice(@Body() createDeviceDto: CreateDeviceDto) {
    const device = await this.devicesService.createDevice(createDeviceDto);
    return {
      success: true,
      message: 'Dispositif créé avec succès',
      device
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllDevices(@Query('status') status?: DeviceStatus) {
    const devices = await this.devicesService.findAllDevices(status);
    return {
      success: true,
      count: devices.length,
      devices
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findDeviceById(@Param('id') id: string) {
    const device = await this.devicesService.findDeviceById(id);
    return {
      success: true,
      device
    };
  }

  @Get('by-device-id/:deviceId')
  @UseGuards(JwtAuthGuard)
  async findDeviceByDeviceId(@Param('deviceId') deviceId: string) {
    const device = await this.devicesService.findDeviceByDeviceId(deviceId);
    return {
      success: true,
      device
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateDevice(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    const updatedDevice = await this.devicesService.updateDevice(id, updateDeviceDto);
    return {
      success: true,
      message: 'Dispositif mis à jour avec succès',
      device: updatedDevice
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteDevice(@Param('id') id: string) {
    await this.devicesService.deleteDevice(id);
    return {
      success: true,
      message: 'Dispositif supprimé avec succès'
    };
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateDeviceStatus(
    @Param('id') id: string,
    @Body('status') status: DeviceStatus,
  ) {
    const device = await this.devicesService.findDeviceById(id);
    const updatedDevice = await this.devicesService.updateDeviceStatus(device.deviceId, status);
    return {
      success: true,
      message: 'Statut du dispositif mis à jour avec succès',
      device: updatedDevice
    };
  }

  @Put(':deviceId/sensors/:sensorId')
  @UseGuards(JwtAuthGuard)
  async addSensorToDevice(
    @Param('deviceId') deviceId: string,
    @Param('sensorId') sensorId: string,
  ) {
    const updatedDevice = await this.devicesService.addSensorToDevice(deviceId, sensorId);
    return {
      success: true,
      message: 'Capteur ajouté au dispositif avec succès',
      device: updatedDevice
    };
  }

  @Delete(':deviceId/sensors/:sensorId')
  @UseGuards(JwtAuthGuard)
  async removeSensorFromDevice(
    @Param('deviceId') deviceId: string,
    @Param('sensorId') sensorId: string,
  ) {
    const updatedDevice = await this.devicesService.removeSensorFromDevice(deviceId, sensorId);
    return {
      success: true,
      message: 'Capteur retiré du dispositif avec succès',
      device: updatedDevice
    };
  }

  @Put(':id/configuration')
  @UseGuards(JwtAuthGuard)
  async updateDeviceConfiguration(
    @Param('id') id: string,
    @Body() configuration: Record<string, any>,
  ) {
    const updatedDevice = await this.devicesService.updateDeviceConfiguration(id, configuration);
    return {
      success: true,
      message: 'Configuration du dispositif mise à jour avec succès',
      device: updatedDevice
    };
  }
}