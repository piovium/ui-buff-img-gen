/**
 * 通道生成模式类型
 */
export type ChannelMode = 'radial' | 'vertical' | 'diagonal' | 'constant';

/**
 * 生成通道值数组
 * 
 * @param width - 图像宽度
 * @param height - 图像高度
 * @param mode - 生成模式
 * @param constantValue - 常数模式下的固定值（仅 constant 模式使用）
 * @returns Uint8Array - 通道值数组，每个值范围 0-255
 */
export function generateChannel(
  width: number,
  height: number,
  mode: ChannelMode,
  constantValue: number = 0,
): Uint8Array {
  const channel = new Uint8Array(width * height);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      let distancePercent = 0;
      
      switch (mode) {
        case 'radial': {
          // 径向模式：计算像素到中心的距离百分比
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          distancePercent = distance / maxDistance;
          break;
        }
        
        case 'vertical': {
          // 垂直模式：计算 Y 坐标百分比
          distancePercent = y / height;
          break;
        }
        
        case 'diagonal': {
          // 对角线模式：计算从右上到左下的距离百分比
          // 右上角为 (width, 0)，左下角为 (0, height)
          const dx = width - x;
          const dy = y;
          const maxDiagonal = Math.sqrt(width * width + height * height);
          const distance = Math.sqrt(dx * dx + dy * dy);
          distancePercent = distance / maxDiagonal;
          break;
        }
        
        case 'constant': {
          // 常数模式：返回固定值
          channel[index] = Math.round(constantValue);
          continue;
        }
      }
      
      // 将距离百分比转换为 0-255 范围的值
      channel[index] = Math.round(distancePercent * 255);
    }
  }
  
  return channel;
}

