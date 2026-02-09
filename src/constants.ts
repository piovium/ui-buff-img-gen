import type { ColorPreset } from './types';

/**
 * 颜色预设数组
 * 包含所有可用的颜色预设配置
 */
export const COLOR_PRESETS: ColorPreset[] = [
  {
    // normal
    bg_h_value: 30,
    bg_s_start: 200,
    bg_s_end: 160,
    bg_b_start: 210,
    bg_b_end: 130,
    fg_h_top: 38,
    fg_h_bottom: 34,
    fg_s_topright: 104,
    fg_s_bottomleft: 117,
    fg_b_factor: 255,
    ring_b_value: 127,
  },
  {
    // buff
    bg_h_value: 17,
    bg_s_start: 240,
    bg_s_end: 170,
    bg_b_start: 180,
    bg_b_end: 120,
    fg_h_top: 14,
    fg_h_bottom: 13,
    fg_s_topright: 110,
    fg_s_bottomleft: 120,
    fg_b_factor: 248,
    ring_b_value: 150,
  },
  {
    // debuff
    bg_h_value: 0,
    bg_s_start: 165,
    bg_s_end: 75,
    bg_b_start: 180,
    bg_b_end: 130,
    fg_h_top: 0,
    fg_h_bottom: 0,
    fg_s_topright: 118,
    fg_s_bottomleft: 122,
    fg_b_factor: 248,
    ring_b_value: 150,
  },
  {
    // 冰
    bg_h_value: 128,
    bg_s_start: 160,
    bg_s_end: 110,
    bg_b_start: 160,
    bg_b_end: 110,
    fg_h_top: 130,
    fg_h_bottom: 125,
    fg_s_topright: 80,
    fg_s_bottomleft: 85,
    fg_b_factor: 248,
    ring_b_value: 150,
  },
  {
    // 水
    bg_h_value: 154,
    bg_s_start: 210,
    bg_s_end: 170,
    bg_b_start: 205,
    bg_b_end: 130,
    fg_h_top: 154,
    fg_h_bottom: 144,
    fg_s_topright: 115,
    fg_s_bottomleft: 145,
    fg_b_factor: 248,
    ring_b_value: 150,
  },
  {
    // 火
    bg_h_value: 10,
    bg_s_start: 180,
    bg_s_end: 170,
    bg_b_start: 200,
    bg_b_end: 150,
    fg_h_top: 22,
    fg_h_bottom: 6,
    fg_s_topright: 110,
    fg_s_bottomleft: 150,
    fg_b_factor: 248,
    ring_b_value: 150,
  },
  {
    // 雷
    bg_h_value: 192,
    bg_s_start: 170,
    bg_s_end: 140,
    bg_b_start: 230,
    bg_b_end: 150,
    fg_h_top: 200,
    fg_h_bottom: 192,
    fg_s_topright: 80,
    fg_s_bottomleft: 98,
    fg_b_factor: 248,
    ring_b_value: 150,
  },
  {
    // 风
    bg_h_value: 118,
    bg_s_start: 210,
    bg_s_end: 90,
    bg_b_start: 175,
    bg_b_end: 100,
    fg_h_top: 114,
    fg_h_bottom: 113,
    fg_s_topright: 160,
    fg_s_bottomleft: 163,
    fg_b_factor: 248,
    ring_b_value: 127,
  },
  {
    // 岩
    bg_h_value: 27,
    bg_s_start: 210,
    bg_s_end: 170,
    bg_b_start: 180,
    bg_b_end: 120,
    fg_h_top: 33,
    fg_h_bottom: 25,
    fg_s_topright: 120,
    fg_s_bottomleft: 130,
    fg_b_factor: 248,
    ring_b_value: 150,
  },
  {
    // 草
    bg_h_value: 68,
    bg_s_start: 170,
    bg_s_end: 110,
    bg_b_start: 170,
    bg_b_end: 110,
    fg_h_top: 52,
    fg_h_bottom: 48,
    fg_s_topright: 115,
    fg_s_bottomleft: 110,
    fg_b_factor: 248,
    ring_b_value: 150,
  },
];

/**
 * 输出图像宽度（像素）
 */
export const OUTPUT_WIDTH = 100;

/**
 * 输出图像高度（像素）
 */
export const OUTPUT_HEIGHT = 100;

/**
 * 预设名称数组
 * 与 COLOR_PRESETS 数组索引对应
 */
export const PRESET_NAMES: readonly string[] = [
  'normal',
  'buff',
  'debuff',
  '冰',
  '水',
  '火',
  '雷',
  '风',
  '岩',
  '草',
] as const;

