import { Component, createEffect, createSignal, onCleanup } from 'solid-js';
import { OUTPUT_WIDTH, OUTPUT_HEIGHT } from '../constants';
import { inputParams, colorParams } from '../store/params';
import { generateImage } from '../generators';
import { loadImageAsImageData } from '../utils/image';
import { exportImage, generateFilename } from '../utils/export';

interface PreviewProps {
  onExport?: () => void;
}

const Preview: Component<PreviewProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  const [imageData, setImageData] = createSignal<ImageData | null>(null);
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  
  // 防抖和防重复生成标志
  let generateTimer: number | null = null;
  let isGeneratingFlag = false;
  let currentFgImageData: ImageData | null = null;

  // 加载前景图像
  const loadForegroundImage = async (file: File | null) => {
    if (!file) {
      currentFgImageData = null;
      return;
    }

    setIsLoading(true);
    try {
      const loadedImageData = await loadImageAsImageData(file);
      currentFgImageData = loadedImageData;
    } catch (error) {
      console.error('加载前景图像失败:', error);
      currentFgImageData = null;
    } finally {
      setIsLoading(false);
    }
  };

  // 生成图像
  const generate = async () => {
    // 防止重复生成
    if (isGeneratingFlag) {
      return;
    }

    isGeneratingFlag = true;
    setIsGenerating(true);

    try {
      const params = inputParams();
      const fgImagePath = params.fg_image_path;

      // 使用已加载的 ImageData（如果存在）
      let fgImageData: ImageData | null = currentFgImageData;

      // 如果没有已加载的图像，但提供了路径，尝试从 data URL 加载
      if (!fgImageData && fgImagePath && fgImagePath.startsWith('data:')) {
        try {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                fgImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resolve();
              } else {
                reject(new Error('无法创建 canvas 上下文'));
              }
            };
            img.onerror = () => reject(new Error('图像加载失败'));
            img.src = fgImagePath;
          });
        } catch (error) {
          console.warn('无法加载前景图像:', error);
          fgImageData = null;
        }
      }

      // 生成图像
      const result = await generateImage(
        OUTPUT_WIDTH,
        OUTPUT_HEIGHT,
        {
          ...params,
          fg_image_path: fgImagePath,
        },
        colorParams(),
      );

      setImageData(result);
    } catch (error) {
      console.error('生成图像失败:', error);
    } finally {
      setIsGenerating(false);
      isGeneratingFlag = false;
    }
  };

  // 防抖生成函数
  const debouncedGenerate = () => {
    if (generateTimer !== null) {
      cancelAnimationFrame(generateTimer);
    }

    generateTimer = requestAnimationFrame(() => {
      setTimeout(() => {
        generate();
        generateTimer = null;
      }, 50); // 50ms 防抖
    });
  };

  // 更新 Canvas 显示
  const updateCanvas = () => {
    if (!canvasRef || !imageData()) {
      return;
    }

    const ctx = canvasRef.getContext('2d');
    if (!ctx) {
      return;
    }

    // 设置 Canvas 尺寸
    canvasRef.width = imageData()!.width;
    canvasRef.height = imageData()!.height;

    // 绘制图像数据
    ctx.putImageData(imageData()!, 0, 0);
  };

  // 监听 imageData 变化，更新 Canvas
  createEffect(() => {
    if (imageData()) {
      updateCanvas();
    }
  });

  // 监听参数变化，触发重新生成
  createEffect(() => {
    // 监听 inputParams 和 colorParams 的变化
    inputParams();
    colorParams();
    
    // 防抖生成
    debouncedGenerate();
  });

  // 清理资源
  onCleanup(() => {
    if (generateTimer !== null) {
      cancelAnimationFrame(generateTimer);
    }
  });

  const [exportFormat, setExportFormat] = createSignal<'png' | 'webp'>('png');
  const [exportSuccess, setExportSuccess] = createSignal(false);

  // 导出图像
  const handleExport = async () => {
    if (!canvasRef || !imageData()) {
      return;
    }

    try {
      const filename = generateFilename();
      await exportImage(canvasRef, filename, exportFormat());
      
      // 显示成功提示
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 2000);

      if (props.onExport) {
        props.onExport();
      }
    } catch (error) {
      console.error('导出图像失败:', error);
    }
  };

  // 暴露文件加载函数给父组件
  const handleFileLoad = (file: File | null) => {
    loadForegroundImage(file);
  };

  // 使用全局对象暴露函数（供 FormPanel 调用）
  (window as any).__previewLoadFile = handleFileLoad;

  return (
    <div class="preview-container">
      <div class="preview-wrapper">
        <canvas
          ref={canvasRef}
          class="preview-canvas"
          width={OUTPUT_WIDTH}
          height={OUTPUT_HEIGHT}
          style={{
            'image-rendering': 'pixelated',
          }}
        />
        {(isGenerating() || isLoading()) && (
          <div class="preview-loading-overlay">
            <div class="preview-loading-spinner" />
            <div class="preview-loading-text">
              {isLoading() ? '加载图像中...' : '生成中...'}
            </div>
          </div>
        )}
      </div>
      <div class="export-controls">
        <div class="export-format-selector">
          <label class="export-format-label">
            <input
              type="radio"
              name="export-format"
              value="png"
              checked={exportFormat() === 'png'}
              onChange={() => setExportFormat('png')}
              class="export-format-radio"
            />
            <span>PNG</span>
          </label>
          <label class="export-format-label">
            <input
              type="radio"
              name="export-format"
              value="webp"
              checked={exportFormat() === 'webp'}
              onChange={() => setExportFormat('webp')}
              class="export-format-radio"
            />
            <span>WEBP</span>
          </label>
        </div>
        <button
          class="export-btn"
          onClick={handleExport}
          disabled={!imageData() || isGenerating()}
        >
          {exportSuccess() ? '导出成功！' : '导出图像'}
        </button>
      </div>
    </div>
  );
};

export default Preview;
