import { Injectable } from '@nestjs/common';
import { SensorReadingDto } from '../dto/sensor-reading.dto';
import { TEMPERATURE_CONFIG } from '../constants/sensor.constants';

/**
 * Cache cho lần call gần nhất
 */
interface LastReading {
  value: number;
  timestamp: number; // milliseconds
}

// Box-Muller transform to produce standard normal samples
function normalRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Service mô phỏng cảm biến nhiệt độ
 * Sinh ra dữ liệu nhiệt độ tự nhiên biến động theo thời gian
 * - Nếu 2 lần call < 2s: 50% trả kết quả cũ, 50% random
 * - Nếu 2 lần call >= 2s: random trong khoảng lệch (timeDiff/10)^2*100%
 */
@Injectable()
export class TemperatureService {
  private lastReading: LastReading | null = null;

  /**
   * Lấy dữ liệu nhiệt độ hiện tại
   * Giá trị biến động dựa trên thời gian kể từ lần call trước
   */
  getReading(n?: number): SensorReadingDto {
    const startTime = Date.now();
    const currentTime = Date.now();

    let newValue: number;

    // OU model parameters (per second)
    const theta = 0.02; // mean reversion rate
    let sigma = 0.05; // volatility (°C per sqrt(s))

    // Apply n scaling to sigma when n >=1
    if (n !== undefined && !Number.isNaN(n) && n >= 1) {
      sigma = sigma / n;
    }

    if (this.lastReading === null) {
      // First call
      newValue = TEMPERATURE_CONFIG.BASE;
    } else {
      const timeDiffMs = currentTime - this.lastReading.timestamp;
      const dt = Math.max(timeDiffMs / 1000, 0); // seconds

      if (dt < 2) {
        // <2s: 50% return old value
        if (Math.random() < 0.5) {
          newValue = this.lastReading.value;
        } else {
          // OU single-step
          const z = normalRandom();
          const meanRevert = theta * (TEMPERATURE_CONFIG.BASE - this.lastReading.value) * dt;
          const stochastic = sigma * Math.sqrt(dt) * z;
          newValue = this.lastReading.value + meanRevert + stochastic;
        }
      } else {
        // >=2s: OU update
        const z = normalRandom();
        const meanRevert = theta * (TEMPERATURE_CONFIG.BASE - this.lastReading.value) * dt;
        const stochastic = sigma * Math.sqrt(dt) * z;
        newValue = this.lastReading.value + meanRevert + stochastic;
      }
    }

    // Giữ giá trị trong phạm vi cho phép
    newValue = Math.max(TEMPERATURE_CONFIG.MIN, newValue);
    newValue = Math.min(TEMPERATURE_CONFIG.MAX, newValue);

    // Làm tròn đến 2 chữ số thập phân
    newValue = Math.round(newValue * 100) / 100;

    // Lưu cache
    this.lastReading = {
      value: newValue,
      timestamp: currentTime,
    };

    // helper: normal random via Box-Muller (defined after function)

    // Xác định trạng thái
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    let statusMessage = 'Nhiệt độ bình thường';

    if (newValue < 18) {
      status = 'warning';
      statusMessage = 'Cảnh báo: Nhiệt độ quá thấp';
    } else if (newValue > 26) {
      status = 'warning';
      statusMessage = 'Cảnh báo: Nhiệt độ quá cao';
    } else if (newValue < 16 || newValue > 28) {
      status = 'critical';
      statusMessage = 'Lỗi: Nhiệt độ ngoài phạm vi cho phép';
    }

    const responseTime = Date.now() - startTime;

    return {
      sensorName: TEMPERATURE_CONFIG.SENSOR_NAME,
      value: newValue,
      unit: TEMPERATURE_CONFIG.UNIT,
      timestamp: new Date().toISOString(),
      status,
      statusMessage,
      responseTime,
    };
  }
}
