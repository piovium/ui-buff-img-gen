import { createSignal } from 'solid-js';
import type { InputParams, ColorParams } from '../types';
import { COLOR_PRESETS } from '../constants';

// 全局状态管理
const [inputParams, setInputParams] = createSignal<InputParams>({
  color_preset_index: 0,
  fg_image_path: null,
  ring: false,
  fg_x: 0,
  fg_y: 0,
  fg_w: 100,
  fg_h: 100,
  fg_invert_alpha: false,
  fg_feather: false,
});

const [colorParams, setColorParams] = createSignal<ColorParams>(
  COLOR_PRESETS[0],
);

/**
 * 加载预设
 * 
 * @param index - 预设索引
 */
export function loadPreset(index: number) {
  if (index < 0 || index >= COLOR_PRESETS.length) {
    console.warn(`无效的预设索引: ${index}`);
    return;
  }

  const preset = COLOR_PRESETS[index];
  setColorParams({ ...preset });
  setInputParams((prev) => ({
    ...prev,
    color_preset_index: index,
  }));
}

/**
 * 更新输入参数
 */
export function updateInputParams(updates: Partial<InputParams>) {
  setInputParams((prev) => ({
    ...prev,
    ...updates,
  }));
}

/**
 * 更新颜色参数
 */
export function updateColorParams(updates: Partial<ColorParams>) {
  setColorParams((prev) => ({
    ...prev,
    ...updates,
  }));
}

/**
 * 设置前景图像路径
 */
export function setForegroundImagePath(path: string | null) {
  setInputParams((prev) => ({
    ...prev,
    fg_image_path: path,
  }));
}

/**
 * 切换环形效果
 */
export function toggleRing() {
  setInputParams((prev) => ({
    ...prev,
    ring: !prev.ring,
  }));
}

// 导出状态和函数
export { inputParams, colorParams, setInputParams, setColorParams };

