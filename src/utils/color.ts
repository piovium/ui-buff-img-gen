/**
 * 将 HSB 颜色值转换为 RGB 颜色值
 * 
 * @param h - 色相值（0-255），会自动归一化到 0-179（OpenCV HSV 范围）
 * @param s - 饱和度值（0-255）
 * @param b - 亮度值（0-255）
 * @returns RGB 值数组 [r, g, b]，每个值范围 0-255
 */
export function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  // 将 H 值从 0-255 映射到标准 HSB 的 0-360 范围
  const hStandard = (h / 255) * 360;
  
  // 将 S 和 B 值归一化到 0-1
  const sNormalized = s / 255;
  const bNormalized = b / 255;
  
  // 标准 HSB 到 RGB 转换算法
  const c = bNormalized * sNormalized;
  const x = c * (1 - Math.abs(((hStandard / 60) % 2) - 1));
  const m = bNormalized - c;
  
  let r = 0;
  let g = 0;
  let blue = 0;
  
  if (hStandard >= 0 && hStandard < 60) {
    r = c;
    g = x;
    blue = 0;
  } else if (hStandard >= 60 && hStandard < 120) {
    r = x;
    g = c;
    blue = 0;
  } else if (hStandard >= 120 && hStandard < 180) {
    r = 0;
    g = c;
    blue = x;
  } else if (hStandard >= 180 && hStandard < 240) {
    r = 0;
    g = x;
    blue = c;
  } else if (hStandard >= 240 && hStandard < 300) {
    r = x;
    g = 0;
    blue = c;
  } else if (hStandard >= 300 && hStandard < 360) {
    r = c;
    g = 0;
    blue = x;
  }
  
  // 将 RGB 值从 0-1 范围转换到 0-255 范围
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((blue + m) * 255),
  ];
}

