# 卓上ミニハウス / Tabletop Mini House

空間情報コンピューティング第6回の課題。AR.jsでカメラの実写映像にCGの街を重畳します。
赤い切妻屋根のミニハウスを中心に、道路、横断歩道、木5本、店舗、集合住宅、車を配置しました。
昼夜の切り替えと拡大・縮小ができます。外部の3Dモデルや画像素材は使用していません。

## 授業資料との対応

- 8・27ページ：HTMLでA-FrameとAR.jsを読み込み、`a-scene`、`a-marker`、カメラを定義。
- 3・4ページのファイル構成を参考に、HTMLと`script.js`を分離。今回は生のWebGLではなく、27ページのAR.js方式を使用。
- 27ページ：HTTPSで配信し、ブラウザのカメラ映像に3Dオブジェクトを重畳。
- 30ページ：自作マーカーを採用。公開URL・動作画面を含むPDFとマーカーPNGを提出する。
- MindAR.jsは発展課題のため本実装には含めない。

## ファイル

| ファイル | 内容 |
| --- | --- |
| `index.html` | HTML、ライブラリ読み込み、開始画面と操作UI |
| `script.js` | ARシーン・図形の生成、マーカー追跡、昼夜・サイズ操作 |
| `style.css` | スマートフォン対応の画面レイアウト |
| `marker.html` | マーカーの表示・印刷・ダウンロード |
| `assets/mini-house-marker.png` | 提出・印刷用の自作マーカー |
| `assets/mini-house.patt` | ARToolKitの認識用ファイル |
| `assets/mini-house-symbol.png` | 黒枠を付ける前のオリジナル図案 |
| `tools/generate_marker.py` | マーカーとパターンの再生成（Pillow使用） |
| `docs/assignment.md` | 課題条件・動作確認・提出時のチェック項目 |

## 操作

1. 公開ページから「自作マーカーを開く」を選び、印刷するか別の端末に表示。
2. スマートフォンで公開ページを開き「カメラでARを開始」を押す。
3. カメラ使用を許可して、マーカーの白い余白と黒枠全体を映す。
4. 斜め上から観察。「夜にする」で窓が発光。「＋」「−」で大きさを変更。

HIROやARサービスのアカウント登録は不要。自作マーカーを使用するため、HIROを映しても表示されません。
認識しにくい場合は明るさ・反射・ピントを調整し、枠が隠れないようにします。
アプリがカメラ映像をサーバーに送信する処理はありません。ライブラリはCDNから取得するためネット接続が必要です。

## カメラなしプレビュー

`index.html?mode=preview` を開くと同じ3Dの街を表示します。
これは配置確認用で、実写映像とCGを重畳するAR動作の確認とは別です。

## ローカル起動

```sh
python -m http.server 8000
```

PCで `http://localhost:8000` にアクセス。`file://`で直接開かないでください。
スマートフォンでは公開済みのHTTPS URLを利用してください。

## GitHub Pages

GitHub Pagesで `main` ブランチの `/ (root)` を公開します。
GitHubリポジトリの Settings → Pages → Source を **Deploy from a branch**、Branch を **main / (root)** に設定してください。
サーバー処理・APIキー・npmインストール・ビルドは不要です。

## 利用ライブラリ / 参考

- A-Frame 1.6.0: https://aframe.io/
- AR.js 3.4.7: https://github.com/AR-js-org/AR.js
- マーカー仕様: https://ar-js-org.github.io/AR.js-Docs/marker-based/
- パターンの配置はAR.js公式の `threex-arpatternfile.js` の形式（16×16、BGR、4方向）を参照。
- 授業資料：空間情報コンピューティング第6回、特に27・30ページ。

マーカーと街の図形は本課題用に自作。授業資料PDFはリポジトリに再配布していません。
