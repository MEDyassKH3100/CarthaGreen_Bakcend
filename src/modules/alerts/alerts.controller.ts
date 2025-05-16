import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertsDto } from './dto/query-alerts.dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  async createAlert(@Body() createAlertDto: CreateAlertDto) {
    const alert = await this.alertsService.createAlert(createAlertDto);
    return {
      success: true,
      message: 'Alerte créée avec succès',
      alert
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllAlerts(@Query() queryDto: QueryAlertsDto) {
    const alerts = await this.alertsService.findAllAlerts(queryDto);
    return {
      success: true,
      count: alerts.length,
      alerts
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findAlertById(@Param('id') id: string) {
    const alert = await this.alertsService.findAlertById(id);
    return {
      success: true,
      alert
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateAlert(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
  ) {
    const updatedAlert = await this.alertsService.updateAlert(id, updateAlertDto);
    return {
      success: true,
      message: 'Alerte mise à jour avec succès',
      alert: updatedAlert
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteAlert(@Param('id') id: string) {
    await this.alertsService.deleteAlert(id);
    return {
      success: true,
      message: 'Alerte supprimée avec succès'
    };
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getAlertStatistics(
    @Query('deviceId') deviceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const statistics = await this.alertsService.getAlertStatistics(
      deviceId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return {
      success: true,
      statistics
    };
  }

  @Put(':id/acknowledge')
  @UseGuards(JwtAuthGuard)
  async acknowledgeAlert(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    const updatedAlert = await this.alertsService.acknowledgeAlert(id, userId);
    return {
      success: true,
      message: 'Alerte accusée de réception avec succès',
      alert: updatedAlert
    };
  }

  @Put(':id/resolve')
  @UseGuards(JwtAuthGuard)
  async resolveAlert(@Param('id') id: string) {
    const resolvedAlert = await this.alertsService.resolveAlert(id);
    return {
      success: true,
      message: 'Alerte résolue avec succès',
      alert: resolvedAlert
    };
  }

  @Put(':id/dismiss')
  @UseGuards(JwtAuthGuard)
  async dismissAlert(@Param('id') id: string) {
    const dismissedAlert = await this.alertsService.dismissAlert(id);
    return {
      success: true,
      message: 'Alerte ignorée avec succès',
      alert: dismissedAlert
    };
  }
}