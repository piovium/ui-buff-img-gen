import { Component, onMount } from 'solid-js';
import { loadPreset } from './store/params';
import Preview from './components/Preview';
import FormPanel from './components/FormPanel';

const App: Component = () => {
  // 初始化：加载默认预设
  onMount(() => {
    loadPreset(0);
  });

  return (
    <div class="app-container">
      <div class="app-header">
        <h1 class="app-title">UI Buff Image Generator</h1>
      </div>
      <div class="app-content">
        <div class="preview-area">
          <Preview />
        </div>
        <div class="form-area">
          <FormPanel />
        </div>
      </div>
    </div>
  );
};

export default App;
