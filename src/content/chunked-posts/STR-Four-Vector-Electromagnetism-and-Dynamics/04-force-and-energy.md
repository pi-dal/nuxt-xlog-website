## 电磁力密度和电磁场动量与能量

狭义相对论的核心原则是物理定律在所有惯性系中形式相同。经典的洛伦兹力公式

$$\mathbf{F} = q(\mathbf{E} + \mathbf{v} \times \mathbf{B})$$

中的 $\mathbf{E}$、$\mathbf{B}$ 和 $\mathbf{v}$ 在洛伦兹变换下并不是简单的矢量变换。为了确保力的定律也是协变的，我们需要引入电磁力的四维矢量。

对于四维动量，由动量定理可以得到

$$
\begin{gathered}
K = \frac{d}{d\tau}(P) = \frac{d}{dt}(P) \cdot \frac{dt}{d\tau} = \gamma \cdot \frac{d}{dt}(P) \\
= \gamma \cdot (\frac{d\vec{p}}{dt} \ , \ \frac{1}{c} \cdot \frac{dE_{tot}}{dt}) \\
= \gamma \cdot (\vec{f} \ , \ \frac{1}{c} \cdot \vec{f} \cdot \vec{u}) \\
= \gamma \cdot q \cdot (\vec{E} + \vec{u} \times \vec{B} \ , \ \frac{1}{c} \cdot \vec{E} \cdot \vec{u}) \\
= \frac{q}{c} \cdot F \cdot U
\end{gathered}
$$

所以可以得到

$$
\begin{gathered}
K' = L \cdot K = \frac{q}{c} (L \cdot F \cdot L^{-1}) \cdot (L \cdot U) \\
= \frac{q}{c} F' \cdot U'
\end{gathered}
$$

我们发现 $K$ 确实是满足洛伦兹协变性的四维矢量。

### 磁场里的粒子运动

带电粒子在磁场中运动的分析同样可以在四维框架下完成。利用电磁场张量和四维速度，我们可以完整地描述粒子在电磁场中的运动轨迹，而不需要依赖特定参考系的选择。
