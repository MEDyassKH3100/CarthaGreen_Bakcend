import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  async getSystemOverview() {
    const overview = await this.statisticsService.getSystemOverview();
    return {
      success: true,
      message: 'Vue d\'ensemble du système récupérée avec succès',
      overview
    };
  }

  @Get('sensors')
  async getSensorStatistics(@Query('period') period: string) {
    const statistics = await this.statisticsService.getSensorStatistics(period);
    return {
      success: true,
      message: 'Statistiques des capteurs récupérées avec succès',
      statistics
    };
  }

  @Get('alerts')
  async getAlertStatistics(@Query('period') period: string) {
    const statistics = await this.statisticsService.getAlertStatistics(period);
    return {
      success: true,
      message: 'Statistiques des alertes récupérées avec succès',
      statistics
    };
  }

  @Get('devices')
  async getDeviceStatistics() {
    const statistics = await this.statisticsService.getDeviceStatistics();
    return {
      success: true,
      message: 'Statistiques des dispositifs récupérées avec succès',
      statistics
    };
  }

  @Get('growth')
  async getGrowthPerformance(@Query('period') period: string) {
    const statistics = await this.statisticsService.getGrowthPerformance(period);
    return {
      success: true,
      message: 'Statistiques de croissance récupérées avec succès',
      statistics
    };
  }

  @Get('correlations')
  async getCorrelationAnalysis() {
    const analysis = await this.statisticsService.getCorrelationAnalysis();
    return {
      success: true,
      message: 'Analyse des corrélations récupérée avec succès',
      analysis
    };
  }
}