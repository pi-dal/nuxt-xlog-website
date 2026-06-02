## 電磁力密度と電磁場の運動量・エネルギー

特殊相対性理論の核心は、物理法則がすべての慣性系で同じ形をとることです。古典的なローレンツ力の公式

$$\mathbf{F} = q(\mathbf{E} + \mathbf{v} \times \mathbf{B})$$

では、$\mathbf{E}$、$\mathbf{B}$、$\mathbf{v}$ はローレンツ変換のもとで単純なベクトル変換をしません。力の法則の共変性を確保するには、電磁力の四元ベクトルを導入する必要があります。

四元運動量に対して、運動量定理から

$$
\begin{gathered}
K = \frac{d}{d\tau}(P) = \frac{d}{dt}(P) \cdot \frac{dt}{d\tau} = \gamma \cdot \frac{d}{dt}(P) \\
= \gamma \cdot (\frac{d\vec{p}}{dt} \ , \ \frac{1}{c} \cdot \frac{dE_{tot}}{dt}) \\
= \gamma \cdot (\vec{f} \ , \ \frac{1}{c} \cdot \vec{f} \cdot \vec{u}) \\
= \gamma \cdot q \cdot (\vec{E} + \vec{u} \times \vec{B} \ , \ \frac{1}{c} \cdot \vec{E} \cdot \vec{u}) \\
= \frac{q}{c} \cdot F \cdot U
\end{gathered}
$$

したがって

$$
\begin{gathered}
K' = L \cdot K = \frac{q}{c} (L \cdot F \cdot L^{-1}) \cdot (L \cdot U) \\
= \frac{q}{c} F' \cdot U'
\end{gathered}
$$

$K$ は確かにローレンツ共変性を満たす四元ベクトルであることがわかります。

### 磁場中の粒子運動

磁場中の荷電粒子の運動解析も四元フレームワークで完了できます。電磁場テンソルと四元速度を用いて、特定の座標系に依存することなく、粒子の軌道を完全に記述できます。
