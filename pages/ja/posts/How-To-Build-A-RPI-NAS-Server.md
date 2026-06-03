---
lang: ja
title: ラズベリーパイでNASを構築する
slug: How-To-Build-A-RPI-NAS-Server
type: post
date: February 3, 2022
summary: ラズベリーパイNAS構築記録（そして数々の落とし穴）。
tags:
  - ArozOS
  - DIY
  - Raspberry Pi
---

![72FCD024-BF9C-4FFB-897A-A6C38B4DDCAD.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/72FCD024-BF9C-4FFB-897A-A6C38B4DDCAD.jpeg)

# はじめに

NASの世界にハマってから、抜け出せなくなりました。市販のNAS製品は高価でクローズドなので、手持ちのラズベリーパイでDIYすることにしました。

# 準備

## ハードウェア

1. ラズベリーパイ4B（4GB版）
2. DCソケット
3. ピンヘッダ
4. ブレッドボード
5. XL6009 DC-DCコンバータ
6. UGREEN SATA-USB3.0アダプタ
7. 26AWGケーブル
8. はんだ付けキット
9. TFカード（SanDisk 64GB）

## 3Dモデリング

[Tobychui](https://github.com/tobychui)のテンプレートを借りて、[aprint](https://aprint.io)でケースをモデリングしました。

# DIY作業

## はんだ付け

必要な回路をはんだ付けして組み立てました。

## ソフトウェア

[ArozOS](https://github.com/tobychui/arozos)を[DietPi](https://dietpi.com/)上で実行。リモートアクセスには[Tailscale](https://tailscale.com/)と[OmniEdge](https://omniedge.io/)を使用。

# 改善点

1. 古いケースにファンを追加
2. HDMI側に穴を開けて将来的な開発アクセスに対応
3. USBポート上部の一部を除去して配線を容易に

# 大失敗

1. 26AWGは30AWGより太い（番号が小さいほど太い）
2. アダプタボードが品切れ（UGREENに切り替え）
3. はんだ付け中にパッドが剥がれた

# 謝辞

このDIYプロジェクトで回路について多くを学び、自分だけのNASを手に入れました。[Tobychui](https://github.com/tobychui)に感謝します！😄

![6FD93060-01C2-4B66-AEE3-7211A350CF06.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/6FD93060-01C2-4B66-AEE3-7211A350CF06.jpeg)
![FA279133-7145-48B2-A70B-6BF27E47764A.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/FA279133-7145-48B2-A70B-6BF27E47764A.jpeg)
![85AD81ED-1A37-4C77-AA9D-CA57C9EFC23F.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/85AD81ED-1A37-4C77-AA9D-CA57C9EFC23F.jpeg)
![IMG_A2B2053FA2E5-1.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/IMG_A2B2053FA2E5-1.jpeg)
![32582800-9D23-4E02-87DF-860C5EE93971.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/32582800-9D23-4E02-87DF-860C5EE93971.jpeg)
![73D87562-C4FE-4F4B-9138-2BD13F04925C.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/73D87562-C4FE-4F4B-9138-2BD13F04925C.jpeg)
![8B82DA13-160D-4C47-92BD-94967F143B65.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/8B82DA13-160D-4C47-92BD-94967F143B65.jpeg)
![IMG_3292.HEIC](/article-assets/How-To-Build-A-RPI-NAS-Server/IMG_3292.heic)
![IMG_3294.HEIC](/article-assets/How-To-Build-A-RPI-NAS-Server/IMG_3294.heic)
![IMG_3295.HEIC](/article-assets/How-To-Build-A-RPI-NAS-Server/IMG_3295.heic)
![E9DC7B19-42F3-4D05-822F-3C9E13249E46.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/E9DC7B19-42F3-4D05-822F-3C9E13249E46.jpeg)
![D62A6E7B-0B09-4BE2-9616-3177E12F78F4.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/D62A6E7B-0B09-4BE2-9616-3177E12F78F4.jpeg)
![43FA4084-61A0-4546-949F-D5B9FE194568.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/43FA4084-61A0-4546-949F-D5B9FE194568.jpeg)
![1DA9B3F0-C889-481C-B0FE-DA55A3B59944.jpeg](/article-assets/How-To-Build-A-RPI-NAS-Server/1DA9B3F0-C889-481C-B0FE-DA55A3B59944.jpeg)
[https://player.bilibili.com/player.html?aid=296266066&bvid=BV1sF411J7FD&cid=500715652](https://player.bilibili.com/player.html?aid=296266066&bvid=BV1sF411J7FD&cid=500715652)

[ArozOS](https://github.com/tobychui/arozos)のメンテナンスにもご協力ください。[Telegramグループ](https://t.me/ArOZBeta)もどうぞ！
