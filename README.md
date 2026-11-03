# DimSumChinese 點心中文：本機使用說明

現階段網站只在你的電腦上運作，不需要 GitHub。

## 打開網站
雙擊 `index.html`，用瀏覽器打開即可。

## 新增或修改資源（主檔在 Notion）
資源主清單放在 Notion：**Free Archive 頁面 → 「DimSumChinese 網站資源庫（主檔）」** 資料庫。

1. 在 Notion 新增或修改資料列。欄位名稱（title_zh、url、age……）**不要改**；年齡、程度、技能、主題、形式都是多選欄位，直接點選即可。
2. 匯出：資料庫右上角 `•••` → **Export** → 格式選 **Markdown & CSV** → Export。下載的 zip 檔請雙擊解壓（放在「下載」資料夾即可）。
3. 雙擊網站資料夾裡的 `update-data.command`。它會自動：
   - 在「下載」資料夾找最新的 `DimSumChinese…csv` 匯出檔（有 `_all.csv` 會優先用）；
   - 備份舊的 `resources.csv`（`resources-backup-日期.csv`），再用匯出檔取代它；
   - 更新 `data.js`，然後打開網站。
   - 第一次開啟時，macOS 可能說「無法打開」：請在檔案上按右鍵 → **打開** → **打開**，之後就可以直接雙擊。

網站顯示的次序 = Notion 匯出時的次序。想調整次序，在 Notion 拖動資料列，或在檢視（view）設定排序後再匯出。

為甚麼需要 `data.js`：瀏覽器的安全設定不容許本機網頁直接讀取 CSV 檔，所以本機網站讀的是 `data.js`（CSV 的副本）。日後放上網後，網站會直接讀 `resources.csv`。

## 檔案說明
| 檔案 | 用途 |
| --- | --- |
| `resources.csv` | 資源清單（由 Notion 匯出，`update-data.command` 會自動替換） |
| `data.js` | 由 `update-data.command` 自動產生，不用手動改 |
| `update-data.command` | 雙擊：匯入 Notion 匯出檔並更新網站 |
| `index.html` `style.css` `app.js` | 網站本身 |
| `images/` | 暫用圖片：`logo.svg`、`banner.svg`、`placeholder.svg`。畫好自己的圖後用同一個檔名覆蓋 |
| `CNAME` `.nojekyll` | 日後放上 GitHub Pages 時才用到，現在可以忽略 |

## resources.csv 欄位
| 欄位 | 說明 |
| --- | --- |
| title_zh / title_en | 中／英文標題 |
| url | 資源連結 |
| image | 卡片圖片（可留空：YouTube 影片會自動用縮圖，其他用點心預設圖） |
| creator | 原作者 |
| desc_zh / desc_en | 中／英文簡介 |
| age | 年齡：`幼兒 0-5`、`兒童 6-12`、`青少年及成人 13+`、`15+ 建議 15 歲以上 Ages 15+`、`家長老師 Parents & teachers` |
| difficulty | 程度：`入門 Beginner`、`中級 Intermediate`、`進階 Advanced` |
| skill | 技能：`聆聽 Listening`、`觀看 Watching`、`說話 Speaking`、`閱讀 Reading`、`書寫 Writing`、`打字 Typing` |
| topic | 主題，例如 `兒歌音樂 Songs & music`、`粵拼 Jyutping` |
| format | 形式，例如 `影片 Video`、`YouTube 頻道 Channel` |
| note_zh / note_en | 卡片上的提示，例如「非官方上載，YouTube 連結可能隨時失效。」 |
| tags | **搜尋關鍵字**，用空格分隔，例如 `恐龍 dinosaur 動物`。訪客在搜尋欄輸入這些字就會找到這項資源 |

- age／difficulty／skill／topic／format 可以有多個值。在 Notion 是多選欄位；如果直接改 CSV，用 `;` 或 `,` 分隔都可以。寫法要和現有的完全一致。
- 每個主題已自動加入常見中英文同義詞作搜尋關鍵字（例如「兒歌」也能用 nursery rhyme 搜到），`tags` 欄只需填額外的字。
- 標記為 `15+ 建議 15 歲以上 Ages 15+` 的資源（粗口、棟篤笑等）預設隱藏，訪客要勾選「顯示 15+ 內容」或選擇該年齡篩選才會看到。

## 聯絡表格（Web3Forms）
網頁底部的「聯絡我們」表格會把訊息寄到你的電郵。要啟用它：
1. 到 web3forms.com，用 **dimsumchineseinfo@gmail.com** 取得一條免費的 access key（key 會寄到這個電郵）。
2. 用文字編輯器打開 `index.html`，找到 `YOUR_WEB3FORMS_ACCESS_KEY`，換成你的 key，存檔。
未填 key 之前，表格會提示訪客直接電郵 dimsumchineseinfo@gmail.com。

## 日後放上網（暫不需要）
到時可以用 GitHub Pages 免費放上 dimsumchinese.org，步驟屆時再處理。
