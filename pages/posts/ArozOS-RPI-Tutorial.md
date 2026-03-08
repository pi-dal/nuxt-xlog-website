---
title: 树莓派 ArozOS 指北
slug: ArozOS-RPI-Tutorial
type: post
date: October 22, 2021
summary: 这是一篇关于ArozOS的原创文章，请细细食用😄
tags:
  - ArozOS
  - Golang
  - Raspberry Pi
  - Web
---

![](https://github.com/tobychui/arozos/blob/master/img/banner.png?raw=true)

# 为什么选择ArozOS

一直以来，许多maker都希望拥有一个属于自己的高自定义NAS，因而许多厂商都对目前最火的SBC—树莓派做了适配，所以树莓派上的NAS应用也是五花八门，下面是几种主要的：

1. Nextcloud

[Nextcloud](https://nextcloud.com/)

![](https://raw.githubusercontent.com/nextcloud/screenshots/master/files/Files%20Sharing.png)

也许是目前最火的一个应用了，有插件功能，有app，功能十分完善。但有个先天的不足—它使用php编写，奇慢无比。

1. pydio

[Pydio](https://pydio.com/)

![](https://raw.githubusercontent.com/pydio/cells-dist/master/resources/v3.0.0/home.png)

目前在国内用的还比较少，用Golang编写，速度快，功能较为完整，是我之前一直在纠结的一个选项。

1. Seafile

[Seafile - 开源的企业私有网盘 私有云存储软件 企业维基 知识管理](https://www.seafile.com/home/)

![F704EC3F-E286-4464-92E5-CF3B14B1156C.jpeg](/article-assets/ArozOS-RPI-Tutorial/F704EC3F-E286-4464-92E5-CF3B14B1156C.jpeg)

国人C语言编写，清华北大之选，功能完善，效率奇高。

1. …

说了这么多，明明它们都不错啊，为什么不用呢？

大致有以下这些原因：

1.  自定义程度不够高，虽有插件系统，但是可以自己编写的地方还是太少了
2.  都是公司项目（这点见仁见智）
3.  它们都有专业版，这也意味着免费版实力并不能达到饱和
4.  都大致只能算是网盘应用，不能像群晖DSM一般
5.  …

而现在我也来真正的介绍一下ArozoOS

> General purposed Web Desktop Operating Platform / OS for Raspberry Pis, Now written in Go!

![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled.jpeg)

有些同学会问了，这不是个NAS应用吗，怎么叫OS？

没错，你可能想到了，ArozOS的实力要远远大于nextcloud类的网盘应用，它还拥有WebApp与Subservice两大杀器，甚至还是IoT 控制器。

![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled.png)

部分应用程序

![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled 1.png)

WebApp管理

![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled 2.png)

Subservice管理

当然，文件分享、音乐影片播放等基础功能也少不了

![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled 3.png)

文件分享

![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled 1.jpeg)

音乐影片播放

甚至还可以进行文件编辑，代码编写。

这才是我们所需要的NAS系统！

# 如何安装ArozOS

目前安装ArozOS有两种方式

## 使用已打包好的img

[https://github.com/tobychui/arozos#for-raspberry-pi-for-raspberry-pi-4b](https://github.com/tobychui/arozos#for-raspberry-pi-for-raspberry-pi-4b)

已经为你设置好了一切，开箱即用。

你可以直接访问**http://树莓派ip地址:8080/** ，注册用户了。

## 手动build

1. 首先安装Golang 1.14+

```bash

cd ~/

# 以下四步按照需要自行选用

# 树莓派 64bit 网络条件允许
wget https://golang.org/dl/go1.17.3.linux-arm64.tar.gz

# 树莓派 32bit 网络条件允许
wget https://golang.org/dl/go1.17.3.linux-armv6l.tar.gz

# 树莓派 64bit 国内
wget https://golang.google.cn/dl/go1.17.3.linux-arm64.tar.gz

# 树莓派 32bit 国内
wget https://golang.google.cn/dl/go1.17.3.linux-armv6l.tar.gz

sudo tar -C /usr/local -xzf go*

echo 'export PATH=$PATH:/usr/local/go/bin' >> .bashrc

source ~/.bashrc

go version
```

1. git clone整个项目

```bash
# 国内
git config --global url."https://hub.fastgit.xyz/".insteadOf "https://github.com/"
git config protocol.https.allow always

# 必要
git clone https://github.com/tobychui/arozos.git
```

1. build

```bash
# 国内
go env -w GOPROXY=https://goproxy.cn,direct

# build
cd ./arozos/src/
go build
./arozos
```

1. 守护进程

```bash
# 在开始前先确定没有arozos进程
cd /etc/systemd/system/

sudo nano arozos.service

# 添加以下内容

[Unit]
Description=ArozOS Cloud Service
After=systemd-networkd-wait-online.service
Wants=systemd-networkd-wait-online.service

[Service]
Type=simple
ExecStartPre=/bin/sleep 30
WorkingDirectory=/home/pi/arozos/src
ExecStart=/bin/bash /home/pi/arozos/src/start.sh

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

sudo systemctl enable systemd-networkd.service systemd-networkd-wait-online.service

sudo systemctl start arozos.service

sudo systemctl enable arozos.service
```

此时你就可以访问**http://树莓派ip地址:8080/** ，注册用户了。

# 启动器与更新

ArozOS自[1.119](https://github.com/tobychui/arozos/releases/tag/v1.119)以来支持了启动器与OTA更新。接下来讲讲如何使用这两者

### 如何迁徙到启动器模式

在上文中我们学会了用源码build。那如何在其上使用启动器呢？

```bash
# 暂停Arozos进程
sudo systemctl stop arozos

# 进入目录
cd arozos/src

# clone启动器源码
git clone https://github.com/aroz-online/launcher.git launche

# 编译启动器
cd launche && go build
mv launcher  ../
cd ..

# 如果你不是v1.119,请执行以下步骤
mkdir updates
cd updates
wget https://github.com/tobychui/arozos/releases/download/v1.119/arozos_linux_arm64 -O arozos
wget https://github.com/tobychui/arozos/releases/download/v1.119/web.tar.gz
tar -zxvf web.tar.gz
cd ..

# 更改start.sh中的./arozos改为./launcher
eg:
#!/bin/bash
sudo ./launcher -port 80 -tls=true -tls_port 443 -hostname "RPI-NAS"

# 重新启动arozos
sudo systemctl start arozos
```

如果成功的话，在浏览器上打开链接，应该就可以看到效果了

![FC5750F6-362A-4084-BA47-97DDAA9FE251.jpeg](/article-assets/ArozOS-RPI-Tutorial/FC5750F6-362A-4084-BA47-97DDAA9FE251.jpeg)

## OTA升级

Arozos自1.119以来支持了OTA升级，你可以直接在Arozos更新版本

![2B591461-5043-4AC0-8886-DCCFBA89E627.jpeg](/article-assets/ArozOS-RPI-Tutorial/2B591461-5043-4AC0-8886-DCCFBA89E627.jpeg)

# WebApp & Subservice

说到ArozOS，一定绕不过两个东西，WebApp与Subservice。

## WebApp

**Arozos中的WebApp是HTML5编写的Web应用程序，允许使用模块安装程序进行安装。**

### 安装

您可以使用git repo URL或zip文件安装WebApp。您可以在“系统设置”>“添加和删除模块”选项卡中找到安装界面

![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled 4.png)

### 删除

要删除WebApp，请选择要从WebApp列表中删除的WebApp，然后单击“卸载”

![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled 5.png)

你也可以手动删除，以下是删除名为“MyWebApp”的子服务的示例。

```bash
sudo systemctl stop arozos

cd ~/arozos/web/

rm -rf MyWebApp

sudo systemctl start arozos
```

## Subservice

**ArozOS中的Subservice是安装时需要编译的可执行文件**。

### 安装

你需要在ArozOS目录下手动安装，以下是删除名为“MySubservice”的子服务的示例。

```bash
cd ~/arozos/subservice

git clone MySubservice的git地址

cd MySubservice

./build.sh
```

### 删除

以下是删除名为“MySubservice”的子服务的示例

```bash
sudo systemctl stop arozos

cd ~/arozos/subservice/

rm -rf ./MySubservice

sudo systemctl start arozos
```

### 启用与禁用

要启用或禁用子服务，请访问**_System Setting > Subservice_**选项卡，然后选择要启动/禁用的服务。

![Untitled](/article-assets/ArozOS-RPI-Tutorial/Untitled 6.png)

当然你也可以手动操作

```bash
sudo systemctl stop arozos

cd ~/arozos/subservice/MySubservice

touch .disabled

sudo systemctl start arozos
```

# One More Thing

现在ArozOS还在积极地开发，我也曾有幸为其贡献了一部分代码。

[Commits · tobychui/arozos](https://github.com/tobychui/arozos/commits?author=pi-dal)

如果你对这个项目也有一些好主意，欢迎来提issue和pr，也可以加入telegram群组，与我们进行交流。

[ArozOS Dev](https://t.me/ArOZBeta)

谢谢你的阅读！
