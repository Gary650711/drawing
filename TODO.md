# drawing App 交付清單

## 全畫面與自動縮放

- [x] App 名稱與專案檔名為 `drawing`。
- [x] 啟動主畫面以全螢幕呈現，隱藏狀態列與 starter tab bar。
- [x] 畫布使用 flex 與 SVG 寬高填滿配置，依螢幕尺寸、解析度與方向自動 scaling。

## 多點觸控繪圖

- [x] 支援最多 10 點同時畫線與點擊。
- [x] 10 個觸控點固定使用彼此不同的顏色。
- [x] 點擊會留下最小點狀標記。
- [x] 拖曳畫線使用最小筆觸粗細。
- [x] touch cancel 會正確釋放觸控識別，避免後續新觸控沿用舊軌跡。

## 兩側操作

- [x] 畫面左側提供「清除」按鈕，清除全部畫線與點擊軌跡。
- [x] 畫面右側提供「離開」按鈕，Android 使用系統離開行為，Web 預覽提供退出版。
- [x] 兩側按鈕與畫布分層，按鈕觸控不會誤產生畫線。

## 建置檢查

- [ ] 完成 TypeScript、ESLint 與 Expo Web 啟動檢查。
- [ ] 儲存 checkpoint，供 Dashboard 進行 Android 原生建置；Sandbox 不直接宣稱已產出 APK。
