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
 * 从图像中提取 alpha 通道，支持多种图像格式
 * 
 * @param imageData - ImageData 对象（总是 RGBA 格式）
 * @returns Uint8Array - alpha 通道数据数组，每个值范围 0-255
 */
export function extractAlphaChannelAdvanced(imageData: ImageData): Uint8Array {
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
  
  // 将最大灰度值缩放到 255
  let maxValue = 0;
  for (let i = 0; i < alphaChannel.length; i++) {
    if (alphaChannel[i] > maxValue) {
      maxValue = alphaChannel[i];
    }
  }
  
  if (maxValue > 0 && maxValue < 255) {
    const scale = 255 / maxValue;
    for (let i = 0; i < alphaChannel.length; i++) {
      alphaChannel[i] = Math.round(alphaChannel[i] * scale);
    }
  }
  
  return alphaChannel;
}

