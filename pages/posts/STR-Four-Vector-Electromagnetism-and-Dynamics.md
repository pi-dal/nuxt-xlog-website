---
title: "如何用四维矢量来解决狭义相对论问题（电磁学与动力学）"
slug: "STR-Four-Vector-Electromagnetism-and-Dynamics"
type: post
date: "2025-10-19T00:20:14.881Z"
summary: "在上一篇文章中，我们已经介绍了基础的四维矢量与时空变换，这篇文章将在上一篇的基础上进行叙述。"
---

在[上一篇文章](/posts/STR-Four-Vector-Basic-Transformation)中，我们已经介绍了基础的四维矢量与时空变换，这篇文章将在上一篇的基础上进行叙述。

## 电磁规律的四维矢量表示

### 电量是四维标量

在我们之前的介绍中我们已经得到了四维电流密度矢量
$$j_p=(j_x \ ,\ j_y \ , \ j_z \ , \ ic\rho)$$
又因为
$$\rho = \gamma \rho' \ , \ dV = \frac{dV'}{\gamma}$$
可以得到
$$\rho dV = \rho' dV'$$
从中可以看出电量是四维标量

### 洛伦兹条件

由洛伦兹条件
$$\nabla \cdot A + \frac{1}{c^2} \frac{\partial \phi}{\partial t} = 0$$
即

$$
\partial_\mu A_\mu = 0  \ ,\ A_\mu = \left(A_x, A_y, A_z, \frac{i}{c}\varphi\right) = \left(\mathbf{A}, \frac{i}{c}\varphi\right)
$$

### 达朗贝尔方程

由达朗贝尔方程
$$\nabla^2 \mathbf{A} - \frac{1}{c^2} \frac{\partial^2 \mathbf{A}}{\partial t^2} = - \mu_0 \mathbf{j} \ , \ \nabla^2 \varphi - \frac{1}{c^2} \frac{\partial^2 \varphi}{\partial t^2} = - \frac{\rho}{\varepsilon_0}$$
且四维标量算符
$$\square = \partial_\mu \partial_\mu = \nabla^2 - \frac{1}{c^2} \frac{\partial^2}{\partial t^2}$$
可以得到
$$\square A_\mu = - \mu_0 J_\mu$$

### 电磁场张量

由电磁场与电磁势的微分关系
$$\mathbf{B} = \nabla \times \mathbf{A} \ , \ \mathbf{E} = - \nabla \varphi - \frac{\partial \mathbf{A}}{\partial t}$$
可以构造四维电磁场张量
$$F_{\mu\nu} = \partial_\mu A_\nu - \partial_\nu A_\mu$$
即有

$$
F_{\mu\nu} = \begin{bmatrix}
0 & B_3 & -B_2 & -iE_1/c \\
-B_3 & 0 & B_1 & -iE_2/c \\
B_2 & -B_1 & 0 & -iE_3/c \\
iE_1/c & iE_2/c & iE_3/c & 0
\end{bmatrix}
$$

我们会有变换
$$\mathbf{F}' = \mathbf{LFL}^\mathrm{T}$$
容易得到

$$
\begin{gathered}
\mathbf{E}' = \gamma(\mathbf{E} + \mathbf{v} \times \mathbf{B}) - (\gamma - 1)\mathbf{E}_{\parallel} \\
\mathbf{B}' = \gamma\left(\mathbf{B} - \frac{1}{c^2}\mathbf{v} \times \mathbf{E}\right) - (\gamma - 1)\mathbf{B}_{\parallel}
\end{gathered}
$$

### 麦克斯韦方程

由麦克斯韦方程

$$
\begin{gathered}
\nabla \cdot \mathbf{E} = \frac{\rho}{\varepsilon_0} \ , \ \nabla \times \mathbf{B} - \varepsilon_0\mu_0 \frac{\partial \mathbf{E}}{\partial t} = \mu_0 \mathbf{j} \\
\nabla \cdot \mathbf{B} = 0 \ , \ \nabla \times \mathbf{E} + \frac{\partial \mathbf{B}}{\partial t} = 0
\end{gathered}
$$

且
$$\partial_\nu F_{\mu\nu} = \mu_0 J_\mu$$
可以得到
$$\partial_\lambda F_{\mu\nu} + \partial_\mu F_{\nu\lambda} + \partial_\nu F_{\lambda\mu} = 0$$

### 电磁力密度和电磁场动量与能量

狭义相对论的核心原则是物理定律在所有惯性系中形式相同。经典的洛伦兹力公式

$$
F=q(E+v×B)\mathbf{F} = q(\mathbf{E} + \mathbf{v} \times \mathbf{B})F=q(E+v×B)
$$

中的
$$\mathbf{E}、\mathbf{B} 和 \mathbf{v} $$
在洛伦兹变换下并不是简单的矢量变换。为了确保力的定律也是协变的，我们需要引入电磁力的四维矢量。

$$
\begin{gathered}
\text{对于四维动量，由动量定理可以得到}
\end{gathered}
$$

$$
\begin{gathered}
K = \frac{d}{d\tau}(P) = \frac{d}{dt}(P) \cdot \frac{dt}{d\tau} = \gamma \cdot \frac{d}{dt}(P) = \gamma \cdot (\frac{d\vec{p}}{dt} \ , \ \frac{1}{c} \cdot \frac{dE_{tot}}{dt}) \\
= \gamma \cdot (\vec{f} \ , \ \frac{1}{c} \cdot \vec{f} \cdot \vec{u}) = \gamma \cdot q \cdot (\vec{E} + \vec{u} \times \vec{B} \ , \ \frac{1}{c} \cdot \vec{E} \cdot \vec{u}) = \frac{q}{c} \cdot F \cdot U
\end{gathered}
$$

$$
\begin{gathered}
所以可以得到
\end{gathered}
$$

$$
\begin{gathered}
K' = L \cdot K = \frac{q}{c} (L \cdot F \cdot L^{-1}) \cdot (L \cdot U) = \frac{q}{c} F' \cdot U'
\end{gathered}
$$

$$
\begin{gathered}
我们发现K确实是满足洛伦兹协变性的四维矢量
\end{gathered}
$$

### 磁场里的粒子运动
