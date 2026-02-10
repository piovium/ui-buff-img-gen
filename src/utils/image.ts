import { clamp } from "./math";

/**
 * 将文件加载为 ImageData 对象
 * 
 * @param file - 图像文件对象
 * @returns Promise<ImageData> - 图像的 ImageData 表示
 * @throws 如果文件无法加载或不是有效的图像文件
 */
export function loadImageAsImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    // 创建 FileReader 读取文件
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result || typeof result !== 'string') {
        reject(new Error('无法读取文件'));
        return;
      }
      
      // 创建 Image 对象加载图像
      const img = new Image();
      
      img.onload = () => {
        try {
          // 创建 canvas 来获取 ImageData
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法创建 canvas 上下文'));
            return;
          }
          
          // 绘制图像到 canvas
          ctx.drawImage(img, 0, 0);
          
          // 获取 ImageData
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          resolve(imageData);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('处理图像时出错'));
        }
      };
      
      img.onerror = () => {
        reject(new Error('图像加载失败'));
      };
      
      // 设置图像源
      img.src = result;
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    // 以 Data URL 格式读取文件
    reader.readAsDataURL(file);
  });
}

/**
 * 从 RGBA ImageData 中提取 alpha 通道
 * 
 * @param imageData - RGBA 格式的 ImageData 对象
 * @returns Uint8Array - alpha 通道数据数组，每个值范围 0-255
 */
export function extractAlphaChannel(imageData: ImageData): Uint8Array {
  const { data, width, height } = imageData;
  const alphaChannel = new Uint8Array(width * height);
  
  // ImageData.data 是 RGBA 格式，每 4 个元素代表一个像素
  // 索引: 0=R, 1=G, 2=B, 3=A
  for (let i = 0; i < alphaChannel.length; i++) {
    alphaChannel[i] = data[i * 4 + 3]; // 提取 alpha 通道（索引 3）
  }
  
  return alphaChannel;
}

/**
 * 检测图像通道数
 * 
 * @param imageData - ImageData 对象
 * @returns 通道数（1, 3, 或 4）
 */
export function detectChannels(imageData: ImageData): 1 | 3 | 4 {
  const { data } = imageData;
  const pixelCount = imageData.width * imageData.height;
  
  // 检查是否有 alpha 通道（每 4 个字节一个像素）
  if (data.length === pixelCount * 4) {
    // 检查是否有非 255 的 alpha 值
    let hasAlpha = false;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 255) {
        hasAlpha = true;
        break;
      }
    }
    return hasAlpha ? 4 : 3;
  }
  
  // 检查是否是单通道（每 1 个字节一个像素）
  if (data.length === pixelCount) {
    return 1;
  }
  
  // 默认返回 3 通道（RGB）
  return 3;
}

/**
 * 将 RGB 图像转换为灰度图像
 * ImageData 总是 RGBA 格式，所以总是按 4 通道处理
 * 
 * @param imageData - RGBA 格式的 ImageData 对象
 * @returns Uint8Array - 灰度图像数据数组，每个值范围 0-255
 */
export function convertToGrayscale(imageData: ImageData): Uint8Array {
  const { data, width, height } = imageData;
  const grayscale = new Uint8Array(width * height);
  
  // ImageData 总是 RGBA 格式（每 4 个字节一个像素）
  // 使用标准灰度转换公式：Gray = 0.299*R + 0.587*G + 0.114*B
  for (let i = 0; i < grayscale.length; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
  
  return grayscale;
}

/**
 * 使用中值滤波去除椒盐噪声
 * 
 * @param imageData - 灰度图像数据数组（一维数组，按行存储）
 * @param width - 图像宽度
 * @param height - 图像高度
 * @param kernelSize - 滤波器大小（必须是奇数，默认 3）
 * @returns Uint8Array - 去噪后的图像数据数组
 */
export function medianFilter(
  imageData: Uint8Array,
  width: number,
  height: number,
  kernelSize: number = 3
): Uint8Array {
  if (kernelSize % 2 === 0) {
    throw new Error('滤波器大小必须是奇数');
  }
  
  const radius = Math.floor(kernelSize / 2);
  const result = new Uint8Array(imageData.length);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const neighbors: number[] = [];
      
      // 收集邻域内的所有像素值
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          // 边界处理：使用镜像边界
          const clampedY = Math.max(0, Math.min(height - 1, ny));
          const clampedX = Math.max(0, Math.min(width - 1, nx));
          
          const index = clampedY * width + clampedX;
          neighbors.push(imageData[index]);
        }
      }
      
      // 计算中位数
      neighbors.sort((a, b) => a - b);
      const medianIndex = Math.floor(neighbors.length / 2);
      result[y * width + x] = neighbors[medianIndex];
    }
  }
  
  return result;
}

/**
 * 从图像中提取 alpha 通道，支持多种图像格式
 * 
 * @param imageData - ImageData 对象（总是 RGBA 格式）
 * @param aFactor - Alpha通道缩放指数（0~3），默认0.5
 * @returns Uint8Array - alpha 通道数据数组，每个值范围 0-255
 */
export function extractAlphaChannelAdvanced(imageData: ImageData, aFactor: number = 0.5): Uint8Array {
  const { data, width, height } = imageData;
  let alphaChannel: Uint8Array;
  
  // 检查是否有有效的 alpha 通道（有非 255 的 alpha 值）
  let hasValidAlpha = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) {
      hasValidAlpha = true;
      break;
    }
  }
  
  if (hasValidAlpha) {
    // 有有效的 alpha 通道，直接提取
    alphaChannel = extractAlphaChannel(imageData);
  } else {
    // 没有有效的 alpha 通道，检查是否是单通道灰度图像（R=G=B）
    let isGrayscale = true;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r !== g || g !== b) {
        isGrayscale = false;
        break;
      }
    }
    
    if (isGrayscale) {
      // 单通道灰度图像，使用 R 通道作为 alpha
      alphaChannel = new Uint8Array(width * height);
      for (let i = 0; i < alphaChannel.length; i++) {
        alphaChannel[i] = data[i * 4]; // 使用 R 通道
      }
    } else {
      // 3 通道 RGB，转换为灰度后作为 alpha
      alphaChannel = convertToGrayscale(imageData);
    }
  }
  
  // 去除椒盐噪声（使用中值滤波）
  if (alphaChannel.length > 0) {
    alphaChannel = medianFilter(alphaChannel, width, height, 3);
  }
  
  // 使用分位数映射：将 low 1% 映射到 0，high 1% 映射到 255，中间等距缩放
  if (alphaChannel.length === 0) {
    return alphaChannel;
  }
  
  // 创建排序副本以计算分位数
  const sortedValues = new Uint8Array(alphaChannel);
  sortedValues.sort((a, b) => a - b);
  
  // 计算 1% 和 99% 分位数的索引
  const lowIndex = Math.floor(alphaChannel.length * 0.01);
  const highIndex = Math.floor(alphaChannel.length * 0.99);
  
  const lowValue = Math.max(sortedValues[lowIndex], 10);
  const highValue = sortedValues[highIndex];
  
  // 如果 low 和 high 相等，说明所有值相同，直接返回
  if (lowValue === highValue) {
    return alphaChannel;
  }
  
  // 计算缩放因子：将 [lowValue, highValue] 映射到 [0, 255]
  const scale = 1 / (highValue - lowValue);
  
  // 应用映射：newValue = (oldValue - lowValue) * scale，并限制在 0-255 范围内
  for (let i = 0; i < alphaChannel.length; i++) {
    const mappedValue = Math.round((Math.pow(Math.max((alphaChannel[i] - lowValue) * scale, 0), aFactor) * 255) - 1);
    alphaChannel[i] = clamp(mappedValue, 0, 255);
  }
  
  return alphaChannel;
}
