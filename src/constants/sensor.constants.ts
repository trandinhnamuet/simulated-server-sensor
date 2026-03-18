/**
 * Hằng số cấu hình cho cảm biến phòng server
 */

export const TEMPERATURE_CONFIG = {
  // Giá trị cơ bản (base value)
  BASE: 22,
  // Giá trị tối thiểu
  MIN: 16,
  // Giá trị tối đa
  MAX: 28,
  // Độ biến động tối đa trong mỗi lần đo (°C)
  MAX_FLUCTUATION: 0.5,
  // Đơn vị đo
  UNIT: '°C',
  // Tên cảm biến
  SENSOR_NAME: 'Temperature Sensor - Server Room 1',
};

export const HUMIDITY_CONFIG = {
  // Giá trị cơ bản (base value)
  BASE: 50,
  // Giá trị tối thiểu
  MIN: 30,
  // Giá trị tối đa
  MAX: 70,
  // Độ biến động tối đa trong mỗi lần đo (%)
  MAX_FLUCTUATION: 5,
  // Đơn vị đo
  UNIT: '%',
  // Tên cảm biến
  SENSOR_NAME: 'Humidity Sensor - Server Room 1',
};
