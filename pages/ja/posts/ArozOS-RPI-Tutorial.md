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

<img src="https://github.com/tobychui/arozos/blob/master/img/banner.png?raw=true" alt="ラズベリーパイでArozOSを使うガイドの画像（画像1）" title="ラズベリーパイでArozOSを使うガイドの画像" loading="lazy" decoding="async">

# なぜArozOSを選ぶのか

多くのメイカーは高度にカスタマイズ可能なNASを夢見ています。ラズベリーパイ向けには様々なソリューションがありますが、ArozOSは単なるNAS以上の機能を提供します。

1. **Nextcloud** — プラグインとアプリのある最も人気のある選択肢。

<img src="https://raw.githubusercontent.com/nextcloud/screenshots/master/files/Files%20Sharing.png" alt="ラズベリーパイでArozOSを使うガイドの「なぜArozOSを選ぶのか」セクションの画像（画像2）" title="なぜArozOSを選ぶのかの画像" loading="lazy" decoding="async">

2. **Pydio** — Goで書かれていて速い。

<img src="https://raw.githubusercontent.com/pydio/cells-dist/master/resources/v3.0.0/home.png" alt="ラズベリーパイでArozOSを使うガイドの「なぜArozOSを選ぶのか」セクションの画像（画像3）" title="なぜArozOSを選ぶのかの画像" loading="lazy" decoding="async">

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

<img src="/article-assets/ArozOS-RPI-Tutorial/F704EC3F-E286-4464-92E5-CF3B14B1156C.jpeg" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像4）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/Untitled.jpeg" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像5）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/Untitled.png" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像6）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/Untitled%201.png" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像7）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/Untitled%202.png" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像8）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/Untitled%203.png" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像9）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/Untitled%201.jpeg" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像10）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/FC5750F6-362A-4084-BA47-97DDAA9FE251.jpeg" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像11）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/2B591461-5043-4AC0-8886-DCCFBA89E627.jpeg" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像12）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/Untitled%204.png" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像13）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/Untitled%205.png" alt="ラズベリーパイでArozOSを使うガイドの「おわりに」セクションの画像（画像14）" title="おわりにの画像" loading="lazy" decoding="async">
<img src="/article-assets/ArozOS-RPI-Tutorial/Untitled%206.png" alt="ラズベリーパイでArozOSを使うガイド：お読みいただきありがとうございます！" title="お読みいただきありがとうございます！" loading="lazy" decoding="async">
お読みいただきありがとうございます！
