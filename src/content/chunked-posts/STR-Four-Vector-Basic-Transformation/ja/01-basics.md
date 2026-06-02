## ミンコフスキー時空における基本的な四元ベクトル

上記の不変量から

$$
 x^2+y^2+z^2-c^2t^2=0
$$

最初の四元ベクトルが得られます

$$
(x,y,z,ict)
$$

これから基本的なローレンツ変換をどのように導出するのでしょうか？一般変換形式から出発し、座標原点の運動方程式を考え、係数比較によりローレンツ変換行列が得られます

$$
\begin{pmatrix}
     x' \\
     y' \\
     z' \\
     ict'
\end{pmatrix}
=
\begin{pmatrix}
     \gamma & 0 & 0 & i \gamma \beta \\
     0 & 1 & 0 & 0 \\
     0 & 0 & 1 & 0 \\
     -i \gamma \beta & 0 & 0 & \gamma
\end{pmatrix}
\begin{pmatrix}
     x \\
     y \\
     z \\
     ict
\end{pmatrix}
$$

これが最も基本的な時空座標の四元ベクトルです。他の基本的な四元ベクトルには以下のものがあります：

1. **四元波数ベクトル**：$k_p=(k_x, k_y, k_z, i\frac{\omega}{c})$
2. **四元電流密度ベクトル**：$j_p=(j_x, j_y, j_z, ic\rho)$
3. **四元運動量ベクトル**：$p_\mu = (p_x, p_y, p_z, i\frac{W}{c})$

> これらの量から多くの四元ベクトルを導出できます。例えば四元速度は時空座標の微分で得られます：
> $$U_\mu = \frac{dx_\mu}{d\tau}=\gamma(u,ic)$$
> さらに $p_\mu = mU_\mu$、$j_p=\rho U_p$ も導出可能です。
