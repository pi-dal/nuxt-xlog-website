---
lang: ja
title: ラズベリーパイでArozOSを使うガイド
slug: ArozOS-RPI-Tutorial
type: post
date: October 22, 2021
summary: ArozOSのオリジナルガイドです。じっくりお楽しみください😄
tags:
  - ArozOS
  - Golang
  - Raspberry Pi
  - Web
---

![](https://github.com/tobychui/arozos/blob/master/img/banner.png?raw=true)

# なぜArozOSを選ぶのか

多くのメイカーは高度にカスタマイズ可能なNASを夢見ています。ラズベリーパイ向けには様々なソリューションがありますが、ArozOSは単なるNAS以上の機能を提供します。

1. **Nextcloud** — プラグインとアプリのある最も人気のある選択肢。

![](https://raw.githubusercontent.com/nextcloud/screenshots/master/files/Files%20Sharing.png)

2. **Pydio** — Goで書かれていて速い。

![](https://raw.githubusercontent.com/pydio/cells-dist/master/resources/v3.0.0/home.png)

3. **Seafile** — C言語で中国のデベロッパーによって書かれている。効率的で機能豊か。

ArozOSはWebApp、Subservice、さらにはIoTコントローラー機能を備えた、汎用WebデスクトップOSです。

# ArozOSのインストール

## 方法1：プリビルドイメージ

https://github.com/tobychui/arozos#for-raspberry-pi-for-raspberry-pi-4b からダウンロード。設定済みですぐに使えます。

## 方法2：手動ビルド

1. Golang 1.14+ をインストール
2. リポジトリをクローン
3. ビルドして実行
4. デーモンとして設定

アクセス：`http://<raspberry-pi-ip>:8080/`

# ランチャーとOTAアップデート

v1.119以降、ランチャーモードとOTAアップデートに対応しています。

# WebAppとSubservice

## WebApp

HTML5で書かれたWebアプリケーション。git URLやzipファイルでインストール可能。

## Subservice

インストール時にコンパイルされる実行可能ファイル。

# おわりに

ArozOSは活発に開発されており、私もコードを貢献しています：

[pi-dalのArozOSへのコミット](https://github.com/tobychui/arozos/commits?author=pi-dal)

アイデアがあれば、issueやPRをお送りいただくか、Telegramグループ [ArozOS Dev](https://t.me/ArOZBeta) にご参加ください。

![F704EC3F-E286-4464-92E5-CF3B14B1156C.jpeg](/article-assets/ArozOS-RPI-Tutorial/F704EC3F-E286-4464-92E5-CF3B14B1156C.jpeg)
![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled.jpeg)
![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled.png)
![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled%201.png)
![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled%202.png)
![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled%203.png)
![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled%201.jpeg)
![FC5750F6-362A-4084-BA47-97DDAA9FE251.jpeg](/article-assets/ArozOS-RPI-Tutorial/FC5750F6-362A-4084-BA47-97DDAA9FE251.jpeg)
![2B591461-5043-4AC0-8886-DCCFBA89E627.jpeg](/article-assets/ArozOS-RPI-Tutorial/2B591461-5043-4AC0-8886-DCCFBA89E627.jpeg)
![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled%204.png)
![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled%205.png)
![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled%206.png)
お読みいただきありがとうございます！
