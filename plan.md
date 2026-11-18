# drawing App 實作計畫

## 需求與實作方案

這是一個以 Expo Router／React Native／TypeScript 為基礎的 Android 全畫面繪圖 App，應用程式名稱為 `drawing`。主畫面使用 flex 佈局讓畫布隨螢幕方向、尺寸與解析度自動縮放；Android 的全畫面由 Expo StatusBar 與 Android fullscreen 設定共同處理。

畫布層使用 React Native 原生多點觸控事件 `onTouchStart`、`onTouchMove`、`onTouchEnd` 與 `onTouchCancel`，以 touch identifier 管理最多 10 條同時存在的觸控軌跡。每一個新的 touch identifier 固定取用 10 色調色盤中的一色，軌跡用 `react-native-svg` Path 繪製，起始點以小圓點保留點擊視覺；線寬與點半徑固定為畫面可穩定呈現的最小值 2 logical px，避免大筆刷遮蔽測試細節。

清除按鈕與離開按鈕置於畫布上方、畫面左右兩側，清除會移除所有軌跡並重設目前觸控狀態；Android 離開使用 `BackHandler.exitApp()`，Web 預覽則使用 `window.close()`／返回路由作為可測試退出版。畫布與控制按鈕是同層 sibling，避免按鈕觸控事件冒泡成畫線。

## 專案結構

- `app/(tabs)/index.tsx`：全畫面多點觸控畫布、軌跡狀態、10 色配置、清除／離開控制。
- `app/(tabs)/_layout.tsx`：保留 Expo Router 路由，隱藏 starter tab bar 以維持全畫面。
- `app/_layout.tsx`：全域 provider 與隱藏 StatusBar。
- `app.config.ts`：drawing 品牌、可旋轉方向、Android fullscreen 與原生圖示設定。
- `assets/images/*`：drawing 專用方形啟動圖示與 Expo 原生資產。
- `TODO.md`：依原始需求保存交付條件與完成狀態。

## 設計方向

未指定視覺風格，候選如下：

1. **實驗室儀器黑底**（0.06）：近黑畫布、彩色觸控軌跡、極少量控制介面，突出測試可讀性。
2. **紙張素描工作台**（0.04）：暖白畫布、深色線條與側邊工具，偏向一般繪畫工具。
3. **高對比觸控測試板**（0.07）：深藍底、螢光色軌跡、大型狀態標示，強調多點辨識。

採用 **實驗室儀器黑底**。

- **Design Movement**：工業測試儀表的極簡深色介面。
- **Core Principles**：觸控軌跡優先、固定色彩可辨識、零干擾全畫面、操作可快速復原。
- **Color Philosophy**：背景使用近黑降低視覺噪音；10 個高彩度色相以色相距離區分 touch identifier，不使用漸層避免測試判讀偏差；按鈕使用冷灰與警示紅建立功能區隔。
- **Layout Paradigm**：畫布佔滿整個可用視窗，控制器固定貼近左右邊緣，不使用中央工具列。
- **Signature Elements**：10 色觸控色盤、細線軌跡、左右懸浮側鍵。
- **Interaction Philosophy**：touch down 即留下最小點，move 即畫線，clear 立即清空，exit 明確離開。
- **Animation**：不加入非必要動畫，確保高頻觸控輸入與軌跡呈現沒有延遲或殘影。
- **Typography System**：系統無襯線字體；按鈕使用中等粗細、短標籤與高對比字色。
- **Brand Essence**：給設計驗證與觸控測試使用的輕量多點軌跡量測畫布；精準、直接、可辨識。
- **Brand Voice**：控制文字短而明確，例如「清除」與「離開」，不添加會干擾測試的提示文案。
