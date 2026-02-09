import { Component, createEffect, createSignal, Show } from 'solid-js';
import type { ColorParams } from '../types';
import { inputParams, colorParams, loadPreset, updateColorParams, setForegroundImagePath, toggleRing, updateInputParams } from '../store/params';
import ParamSlider from './ParamSlider';
import FormSection from './FormSection';
import PresetSelector from './PresetSelector';

interface FormPanelProps {
  onParamsChange?: (params: ColorParams) => void;
}

const FormPanel: Component<FormPanelProps> = (props) => {
  const [imagePathInput, setImagePathInput] = createSignal('');

  // 处理预设选择
  const handlePresetSelect = (index: number) => {
    loadPreset(index);
  };

  // 处理文件选择
  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // 创建 data URL 并更新状态
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setForegroundImagePath(result);
          setImagePathInput(result);
          // 通知 Preview 组件加载文件
          if ((window as any).__previewLoadFile) {
            (window as any).__previewLoadFile(file);
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      setForegroundImagePath(null);
      setImagePathInput('');
      // 通知 Preview 组件清除文件
      if ((window as any).__previewLoadFile) {
        (window as any).__previewLoadFile(null);
      }
    }
  };

  // 处理路径输入变化
  const handlePathInput = (value: string) => {
    setImagePathInput(value);
    // 如果是有效的 URL 或 data URL，直接更新
    if (value.startsWith('http://') || 
        value.startsWith('https://') || 
        value.startsWith('data:')) {
      setForegroundImagePath(value);
    } else if (value === '') {
      setForegroundImagePath(null);
    }
  };

  // 同步输入框和状态
  createEffect(() => {
    const currentPath = inputParams().fg_image_path || '';
    if (currentPath !== imagePathInput()) {
      setImagePathInput(currentPath);
    }
  });

  // 处理环形效果切换
  const handleRingToggle = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.checked !== inputParams().ring) {
      toggleRing();
    }
  };

  // 更新单个参数
  const updateParam = <K extends keyof ColorParams>(
    key: K,
    value: ColorParams[K],
  ) => {
    updateColorParams({ [key]: value });
    if (props.onParamsChange) {
      props.onParamsChange(colorParams());
    }
  };

  // 同步参数变化到外部回调
  createEffect(() => {
    if (props.onParamsChange) {
      props.onParamsChange(colorParams());
    }
  });

  return (
    <div class="form-panel">
      <div class="form-panel-content">
        {/* 预设和选项区域 */}
        <FormSection title="预设和选项">
          <PresetSelector
            selectedIndex={inputParams().color_preset_index}
            onSelect={handlePresetSelect}
          />
          
          <div class="form-option-group">
            <label class="form-option-label">
              <input
                type="checkbox"
                checked={inputParams().ring}
                onChange={handleRingToggle}
                class="form-option-checkbox"
              />
              <span class="form-option-text">环形效果</span>
            </label>
          </div>

          <div class="form-option-group">

            <label class="form-option-label">前景图像</label>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input
                  type="text"
                  value={imagePathInput()}
                  onInput={(e) => handlePathInput((e.target as HTMLInputElement).value)}
                  placeholder="输入URL或文件路径"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    'border-radius': '4px',
                  }}
                />
                <input
                  type="file"
                  accept="image/webp,image/png"
                  onChange={handleFileSelect}
                  id="fg-image-file-input"
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => {
                    const fileInput = document.getElementById('fg-image-file-input') as HTMLInputElement;
                    fileInput?.click();
                  }}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    'background-color': '#fff',
                    'border-radius': '4px',
                    cursor: 'pointer',
                    'white-space': 'nowrap',
                  }}
                >
                  选择文件
                </button>
              </div>
            
          </div>
          
          {/* 前景图像参数 */}
          <Show when={inputParams().fg_image_path}>
            <div class="image-option-group">
              <label class="form-option-label">
                <span class="form-option-text">X</span>
                <input
                  type="number"
                  value={inputParams().fg_x}
                  onInput={(e) => {
                    const value = parseInt((e.target as HTMLInputElement).value) || 0;
                    updateInputParams({ fg_x: value });
                  }}
                  class="form-number-input"
                />
                <span class="form-option-text">px</span>
              </label>
              <label class="form-option-label">
                <span class="form-option-text">Y</span>
                <input
                  type="number"
                  value={inputParams().fg_y}
                  onInput={(e) => {
                    const value = parseInt((e.target as HTMLInputElement).value) || 0;
                    updateInputParams({ fg_y: value });
                  }}
                  class="form-number-input"
                />
                <span class="form-option-text">px</span>
              </label>
              <label class="form-option-label">
                <span class="form-option-text">W</span>
                <input
                  type="number"
                  value={inputParams().fg_w}
                  onInput={(e) => {
                    const value = parseInt((e.target as HTMLInputElement).value) || 100;
                    updateInputParams({ fg_w: value });
                  }}
                  class="form-number-input"
                />
                <span class="form-option-text">%</span>
              </label>
              <label class="form-option-label">
                <span class="form-option-text">H</span>
                <input
                  type="number"
                  value={inputParams().fg_h}
                  onInput={(e) => {
                    const value = parseInt((e.target as HTMLInputElement).value) || 100;
                    updateInputParams({ fg_h: value });
                  }}
                  class="form-number-input"
                />
                <span class="form-option-text">%</span>
              </label>
            </div>
            
            <div class="image-option-group">
              <label class="form-option-label">
                <input
                  type="checkbox"
                  checked={inputParams().fg_invert_alpha}
                  onChange={(e) => {
                    updateInputParams({ fg_invert_alpha: (e.target as HTMLInputElement).checked });
                  }}
                  class="form-option-checkbox"
                />
                <span class="form-option-text">反色 Alpha</span>
              </label>
              <label class="form-option-label">
                <input
                  type="checkbox"
                  checked={inputParams().fg_feather}
                  onChange={(e) => {
                    updateInputParams({ fg_feather: (e.target as HTMLInputElement).checked });
                  }}
                  class="form-option-checkbox"
                />
                <span class="form-option-text">羽化</span>
              </label>
            </div>
          </Show>
        </FormSection>

        {/* 背景参数区域 */}
        <FormSection title="背景参数">
          <ParamSlider
            label="背景 H 值"
            value={colorParams().bg_h_value}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('bg_h_value', value)}
          />
          <ParamSlider
            label="背景 S 起始值"
            value={colorParams().bg_s_start}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('bg_s_start', value)}
          />
          <ParamSlider
            label="背景 S 结束值"
            value={colorParams().bg_s_end}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('bg_s_end', value)}
          />
          <ParamSlider
            label="背景 B 起始值"
            value={colorParams().bg_b_start}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('bg_b_start', value)}
          />
          <ParamSlider
            label="背景 B 结束值"
            value={colorParams().bg_b_end}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('bg_b_end', value)}
          />
          <ParamSlider
            label="圆环亮度值"
            value={colorParams().ring_b_value}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('ring_b_value', value)}
          />
        </FormSection>

        {/* 前景参数区域 */}
        <FormSection title="前景参数">
          <ParamSlider
            label="前景 H 顶部值"
            value={colorParams().fg_h_top}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('fg_h_top', value)}
          />
          <ParamSlider
            label="前景 H 底部值"
            value={colorParams().fg_h_bottom}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('fg_h_bottom', value)}
          />
          <ParamSlider
            label="前景 S 右上角值"
            value={colorParams().fg_s_topright}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('fg_s_topright', value)}
          />
          <ParamSlider
            label="前景 S 左下角值"
            value={colorParams().fg_s_bottomleft}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('fg_s_bottomleft', value)}
          />
          <ParamSlider
            label="前景 B 因子"
            value={colorParams().fg_b_factor}
            min={0}
            max={255}
            step={1}
            onUpdate={(value) => updateParam('fg_b_factor', value)}
          />
        </FormSection>
      </div>
    </div>
  );
};

export default FormPanel;
