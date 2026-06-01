## 电磁场张量

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
