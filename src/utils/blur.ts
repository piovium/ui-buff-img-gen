/**
 * 对单通道数组应用高斯模糊
 * 
 * @param channel - 单通道数据数组（Uint8Array）
 * @param width - 图像宽度
 * @param height - 图像高度
 * @param radius - 模糊半径
 * @returns 模糊后的单通道数据数组
 */
export function applyGaussianBlurToChannel(
  channel: Uint8Array,
  width: number,
  height: number,
  radius: number,
): Uint8Array {
  const result = new Uint8Array(channel.length);
  
  // 高斯核大小
  const kernelSize = radius * 2 + 1;
  const kernel: number[] = [];
  let sum = 0;
  
  // 生成高斯核
  const sigma = radius / 3;
  for (let i = 0; i < kernelSize; i++) {
    const x = i - radius;
    const value = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[i] = value;
    sum += value;
  }
  
  // 归一化
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum;
  }
  
  // 水平模糊
  const tempData = new Float32Array(channel.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0;
      
      for (let k = 0; k < kernelSize; k++) {
        const offset = k - radius;
        const px = Math.max(0, Math.min(width - 1, x + offset));
        const idx = y * width + px;
        value += channel[idx] * kernel[k];
      }
      
      tempData[y * width + x] = value;
    }
  }
  
  // 垂直模糊
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0;
      
      for (let k = 0; k < kernelSize; k++) {
        const offset = k - radius;
        const py = Math.max(0, Math.min(height - 1, y + offset));
        const idx = py * width + x;
        value += tempData[idx] * kernel[k];
      }
      
      result[y * width + x] = Math.round(value);
    }
  }
  
  return result;
}

