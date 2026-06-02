## Electromagnetic Field Tensor

From the differential relations between electromagnetic fields and potentials

$$\mathbf{B} = \nabla \times \mathbf{A} \ , \ \mathbf{E} = - \nabla \varphi - \frac{\partial \mathbf{A}}{\partial t}$$

we can construct the four-dimensional electromagnetic field tensor

$$F_{\mu\nu} = \partial_\mu A_\nu - \partial_\nu A_\mu$$

which gives

$$
F_{\mu\nu} = \begin{bmatrix}
0 & B_3 & -B_2 & -iE_1/c \\
-B_3 & 0 & B_1 & -iE_2/c \\
B_2 & -B_1 & 0 & -iE_3/c \\
iE_1/c & iE_2/c & iE_3/c & 0
\end{bmatrix}
$$

Under Lorentz transformation

$$\mathbf{F}' = \mathbf{LFL}^\mathrm{T}$$

we obtain the transformation laws

$$
\begin{gathered}
\mathbf{E}' = \gamma(\mathbf{E} + \mathbf{v} \times \mathbf{B}) - (\gamma - 1)\mathbf{E}_{\parallel} \\
\mathbf{B}' = \gamma\left(\mathbf{B} - \frac{1}{c^2}\mathbf{v} \times \mathbf{E}\right) - (\gamma - 1)\mathbf{B}_{\parallel}
\end{gathered}
$$
