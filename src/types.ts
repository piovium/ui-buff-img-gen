/**
 * 颜色参数接口
 * 定义所有用于生成图像的颜色参数
 */
export interface ColorParams {
  /** 背景H通道常数值（0-255，会自动归一化到0-179） */
  bg_h_value: number;
  /** 背景S通道0%处的值（0-255） */
  bg_s_start: number;
  /** 背景S通道62%处的值（0-255） */
  bg_s_end: number;
  /** 背景B通道0%处的值（0-255） */
  bg_b_start: number;
  /** 背景B通道62%处的值（0-255） */
  bg_b_end: number;
  /** 前景H通道顶部值（0-255） */
  fg_h_top: number;
  /** 前景H通道底部值（0-255） */
  fg_h_bottom: number;
  /** 前景S通道右上角值（0-255） */
  fg_s_topright: number;
  /** 前景S通道左下角值（0-255） */
  fg_s_bottomleft: number;
  /** 前景B通道因子 */
  fg_b_factor: number;
  /** 前景H通道偏移量（-127~127） */
  fg_h_offset: number;
  /** 圆环亮度值（0-255） */
  ring_b_value: number;
}

/**
 * 输入参数接口
 * 定义用户输入的参数
 */
export interface InputParams {
  /** 颜色预设索引 */
  color_preset_index: number;
  /** 前景图像路径（可选） */
  fg_image_path: string | null;
  /** 是否显示环形效果 */
  ring: boolean;
  /** 前景图像 X 位置（px） */
  fg_x: number;
  /** 前景图像 Y 位置（px） */
  fg_y: number;
  /** 前景图像宽度缩放（%） */
  fg_w: number;
  /** 前景图像高度缩放（%） */
  fg_h: number;
  /** 是否反色 alpha 通道 */
  fg_invert_alpha: boolean;
  /** 是否对 alpha 通道应用羽化（高斯模糊） */
  fg_feather: boolean;
  /** Alpha通道缩放指数（0~3） */
  a_factor: number;
}

/**
 * 颜色预设类型
 * 等同于 ColorParams
 */
export type ColorPreset = ColorParams;
