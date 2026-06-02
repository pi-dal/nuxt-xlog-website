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

お読みいただきありがとうございます！
