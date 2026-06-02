## 電磁場テンソル

電磁場と電磁ポテンシャルの微分関係

$$\mathbf{B} = \nabla \times \mathbf{A} \ , \ \mathbf{E} = - \nabla \varphi - \frac{\partial \mathbf{A}}{\partial t}$$

から、四元電磁場テンソルを構築できます

$$F_{\mu\nu} = \partial_\mu A_\nu - \partial_\nu A_\mu$$

すなわち

$$
F_{\mu\nu} = \begin{bmatrix}
0 & B_3 & -B_2 & -iE_1/c \\
-B_3 & 0 & B_1 & -iE_2/c \\
B_2 & -B_1 & 0 & -iE_3/c \\
iE_1/c & iE_2/c & iE_3/c & 0
\end{bmatrix}
$$

ローレンツ変換

$$\mathbf{F}' = \mathbf{LFL}^\mathrm{T}$$

により、次の変換則が得られます

$$
\begin{gathered}
\mathbf{E}' = \gamma(\mathbf{E} + \mathbf{v} \times \mathbf{B}) - (\gamma - 1)\mathbf{E}_{\parallel} \\
\mathbf{B}' = \gamma\left(\mathbf{B} - \frac{1}{c^2}\mathbf{v} \times \mathbf{E}\right) - (\gamma - 1)\mathbf{B}_{\parallel}
\end{gathered}
$$
