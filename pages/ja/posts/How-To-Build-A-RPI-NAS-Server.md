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

[ArozOS](https://github.com/tobychui/arozos)のメンテナンスにもご協力ください。[Telegramグループ](https://t.me/ArOZBeta)もどうぞ！
