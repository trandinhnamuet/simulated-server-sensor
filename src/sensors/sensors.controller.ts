import { Controller, Get } from '@nestjs/common';
import { TemperatureService } from './temperature.service';
import { HumidityService } from './humidity.service';
import { SensorReadingDto } from '../dto/sensor-reading.dto';

/**
 * Controller cho các API cảm biến
 * Cung cấp 2 endpoint để lấy dữ liệu nhiệt độ và độ ẩm
 */
@Controller('sensors')
export class SensorsController {
  constructor(
    private readonly temperatureService: TemperatureService,
    private readonly humidityService: HumidityService,
  ) {}

  /**
   * API lấy dữ liệu nhiệt độ hiện tại
   * GET /sensors/temperature
   */
  @Get('temperature')
  getTemperature(): SensorReadingDto {
    return this.temperatureService.getReading();
  }

  /**
   * API lấy dữ liệu độ ẩm hiện tại
   * GET /sensors/humidity
   */
  @Get('humidity')
  getHumidity(): SensorReadingDto {
    return this.humidityService.getReading();
  }
}
