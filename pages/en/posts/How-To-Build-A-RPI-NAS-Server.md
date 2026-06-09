---
lang: en
title: Building a Raspberry Pi NAS
slug: How-To-Build-A-RPI-NAS-Server
type: post
date: February 3, 2022
summary: A record of building a Raspberry Pi NAS (and all the pitfalls along the way).
tags:
  - ArozOS
  - DIY
  - Raspberry Pi
---

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/72FCD024-BF9C-4FFB-897A-A6C38B4DDCAD.jpeg" alt="Illustration from Building a Raspberry Pi NAS (image 1)" title="Image from Building a Raspberry Pi NAS" loading="lazy" decoding="async">

# Origins (Pitfalls)

Ever since I discovered the rabbit hole of NAS, I've been deep in it and can't get out. Unfortunately, commercial NAS products on the market are both expensive and closed-source, which were the main reasons holding me back. Being young and fearless, I thought I could DIY one using a spare Raspberry Pi I had lying around.

# Preparation (Jumping In)

## Hardware

1. Raspberry Pi 4B (I used the 4GB version)
2. 5.5\*2.1 DC-005 socket (one)
3. Pin header (1x2p, one)
4. Breadboard (5\*/cm, one piece)
5. XL6009 DC-DC auto buck-boost converter (one)
6. UGREEN SATA to USB 3.0 adapter (one)
7. 26AWG wire (one bundle)
8. Soldering kit (one set)
9. TF card (I used a SanDisk 64GB)

## 3D Modeling

I have to admit, 3D modeling is not my strong suit (okay, I basically can't do it). But with help from [Tobychui](https://github.com/tobychui), I borrowed his [template](https://www.thingiverse.com/thing:4864913) and successfully modeled the case using [aprint](https://aprint.io).

[61fbef58d45ea](http://tmp.link/f/61fbef58d45ea)

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/6FD93060-01C2-4B66-AEE3-7211A350CF06.jpeg" alt="Illustration from &quot;3D Modeling&quot; in Building a Raspberry Pi NAS (image 2)" title="Image from 3D Modeling" loading="lazy" decoding="async">

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/FA279133-7145-48B2-A70B-6BF27E47764A.jpeg" alt="Illustration from &quot;3D Modeling&quot; in Building a Raspberry Pi NAS (image 3)" title="Image from 3D Modeling" loading="lazy" decoding="async">

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/85AD81ED-1A37-4C77-AA9D-CA57C9EFC23F.jpeg" alt="Illustration from &quot;3D Modeling&quot; in Building a Raspberry Pi NAS (image 4)" title="Image from 3D Modeling" loading="lazy" decoding="async">

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/IMG_A2B2053FA2E5-1.jpeg" alt="Illustration from &quot;3D Modeling&quot; in Building a Raspberry Pi NAS (image 5)" title="Image from 3D Modeling" loading="lazy" decoding="async">

# Hands-on DIY (Straight Into the Pit)

## Soldering

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/32582800-9D23-4E02-87DF-860C5EE93971.jpeg" alt="Illustration from &quot;Soldering&quot; in Building a Raspberry Pi NAS (image 6)" title="Image from Soldering" loading="lazy" decoding="async">

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/73D87562-C4FE-4F4B-9138-2BD13F04925C.jpeg" alt="Illustration from &quot;Soldering&quot; in Building a Raspberry Pi NAS (image 7)" title="Image from Soldering" loading="lazy" decoding="async">

## Software

For the software side, I went with [ArozOS](https://github.com/tobychui/arozos) running on [DietPi](https://dietpi.com/). I also used [Tailscale](https://tailscale.com/) and [OmniEdge](https://omniedge.io/) for remote access.

Installation instructions can be found in my [previous article](https://blog.pi-dal.com/%E9%80%82%E7%94%A8%E4%BA%8E%E6%A0%91%E8%8E%93%E6%B4%BE%E7%9A%84%E9%80%9A%E7%94%A8Web%E6%A1%8C%E9%9D%A2%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F).

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/8B82DA13-160D-4C47-92BD-94967F143B65.jpeg" alt="Illustration from &quot;Software&quot; in Building a Raspberry Pi NAS (image 8)" title="Image from Software" loading="lazy" decoding="async">

## Results

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/IMG_3292.heic" alt="Illustration from &quot;Results&quot; in Building a Raspberry Pi NAS (image 9)" title="Image from Results" loading="lazy" decoding="async">

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/IMG_3294.heic" alt="Illustration from &quot;Results&quot; in Building a Raspberry Pi NAS (image 10)" title="Image from Results" loading="lazy" decoding="async">

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/IMG_3295.heic" alt="Illustration from &quot;Results&quot; in Building a Raspberry Pi NAS (image 11)" title="Image from Results" loading="lazy" decoding="async">

[https://player.bilibili.com/player.html?aid=296266066&bvid=BV1sF411J7FD&cid=500715652](https://player.bilibili.com/player.html?aid=296266066&bvid=BV1sF411J7FD&cid=500715652)

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/E9DC7B19-42F3-4D05-822F-3C9E13249E46.jpeg" alt="Illustration from &quot;Results&quot; in Building a Raspberry Pi NAS (image 12)" title="Image from Results" loading="lazy" decoding="async">

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/D62A6E7B-0B09-4BE2-9616-3177E12F78F4.jpeg" alt="Illustration from &quot;Results&quot; in Building a Raspberry Pi NAS (image 13)" title="Image from Results" loading="lazy" decoding="async">

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/43FA4084-61A0-4546-949F-D5B9FE194568.jpeg" alt="Illustration from &quot;Results&quot; in Building a Raspberry Pi NAS (image 14)" title="Image from Results" loading="lazy" decoding="async">

<img src="/article-assets/How-To-Build-A-RPI-NAS-Server/1DA9B3F0-C889-481C-B0FE-DA55A3B59944.jpeg" alt="Illustration from &quot;Results&quot; in Building a Raspberry Pi NAS (image 15)" title="Image from Results" loading="lazy" decoding="async">

# Bonus

## Improvements

I made a few improvements on top of [Tobychui](https://github.com/tobychui)'s original design:

1. Integrated the old Raspberry Pi case, adding a fan
2. Drilled a hole on the HDMI side (for future development access)
3. Removed part of the material above the USB port for easier cable routing

## Major Pitfalls

Since I didn't have much DIY experience before this, I ran into several unexpected issues:

1. 26AWG wire is thicker than 30AWG (yes, smaller number = thicker wire)
2. The adapter board went out of stock (so I switched to UGREEN)
3. After desoldering the UGREEN adapter, the pads fell off due to high heat
4. ...and more

# Closing / Thanks

This DIY project taught me a lot about circuits, and now I have my very own NAS. Special thanks to [Tobychui](https://github.com/tobychui) for all the help! 😄😄😄

Feel free to join in and help maintain [ArozOS](https://github.com/tobychui/arozos).

Also feel free to join our [Telegram group](https://t.me/ArOZBeta).
