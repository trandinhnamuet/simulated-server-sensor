/**
 * DTO cho phản hồi dữ liệu cảm biến
 */
export class SensorReadingDto {
  /**
   * Tên cảm biến
   */
  sensorName: string;

  /**
   * Giá trị được đo (nhiệt độ hoặc độ ẩm)
   */
  value: number;

  /**
   * Đơn vị đo lường
   */
  unit: string;

  /**
   * Timestamp lúc đo (ISO 8601 format)
   */
  timestamp: string;

  /**
   * Trạng thái của cảm biến
   */
  status: 'normal' | 'warning' | 'critical';

  /**
   * Mô tả trạng thái
   */
  statusMessage: string;

  /**
   * Thời gian server phục vụ yêu cầu (ms)
   */
  responseTime?: number;
}
