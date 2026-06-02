---
lang: en
title: ArozOS on Raspberry Pi — A Guide
slug: ArozOS-RPI-Tutorial
type: post
date: October 22, 2021
summary: An original guide to ArozOS on Raspberry Pi. Enjoy! 😄
tags:
  - ArozOS
  - Golang
  - Raspberry Pi
  - Web
---

![](https://github.com/tobychui/arozos/blob/master/img/banner.png?raw=true)

# Why Choose ArozOS

Many makers dream of owning a highly customizable NAS. A number of solutions exist for the Raspberry Pi:

1. **Nextcloud** — The most popular option, with plugins and apps. But it's written in PHP, making it painfully slow.
2. **Pydio** — Written in Go, fast, relatively feature-complete. Less popular in China.
3. **Seafile** — Written in C by Chinese developers. Used by top universities. Efficient and feature-rich.

So why not use these? Here's why:

1. Customization is limited despite plugin systems
2. They're all company projects
3. Professional editions limit free tier functionality
4. They're basically cloud storage apps, not full NAS OS solutions

Enter **ArozOS**:

> General purpose Web Desktop Operating Platform / OS for Raspberry Pis, written in Go!

ArozOS goes far beyond ordinary NAS apps. It features WebApps, Subservices, and even IoT controller capabilities.

# Installing ArozOS

## Option 1: Pre-built Image

Download from: https://github.com/tobychui/arozos#for-raspberry-pi-for-raspberry-pi-4b

Everything is pre-configured. Access via `http://<raspberry-pi-ip>:8080/`.

## Option 2: Manual Build

1. Install Golang 1.14+

```bash
cd ~/
# Choose the right package:
wget https://golang.org/dl/go1.17.3.linux-arm64.tar.gz
sudo tar -C /usr/local -xzf go*
echo 'export PATH=$PATH:/usr/local/go/bin' >> .bashrc
source ~/.bashrc
```

2. Clone the repository

```bash
git clone https://github.com/tobychui/arozos.git
```

3. Build

```bash
cd ./arozos/src/
go build
./arozos
```

4. Set up as a daemon

Create `/etc/systemd/system/arozos.service` with appropriate configuration, then enable and start the service.

Access `http://<raspberry-pi-ip>:8080/` to register.

# Launcher & OTA Updates

Since v1.119, ArozOS supports a launcher mode and OTA updates. Migrate from source build by cloning the launcher, configuring start.sh, and restarting.

OTA updates can be performed directly from the ArozOS interface.

# WebApps & Subservices

## WebApps

HTML5 web applications installable via git URL or zip file through System Settings > Manage Modules.

## Subservices

Executables compiled at install time, managed through System Settings > Subservice tab.

# One More Thing

ArozOS is actively developed, and I've had the honor of contributing code:

[Commits by pi-dal on ArozOS](https://github.com/tobychui/arozos/commits?author=pi-dal)

If you have ideas, feel free to open issues, PRs, or join the Telegram group: [ArozOS Dev](https://t.me/ArOZBeta)

Thanks for reading!
