## Basic Four-Vectors in Minkowski Spacetime

From the invariant above

$$
 x^2+y^2+z^2-c^2t^2=0
$$

we obtain the first set of four-vectors

$$
(x,y,z,ict)
$$

How do we derive the basic Lorentz transformation from this? That is, the relationship between $(x,y,z,ict)$ and $(x',y',z',ict')$.

Starting from the general transformation form

$$
\begin{pmatrix}
     x' \\
     y' \\
     z' \\
     ict'
\end{pmatrix}
=
\begin{pmatrix}
     a_{11} & a_{12} & a_{13} & a_{14} \\
     a_{21} & a_{22} & a_{23} & a_{24} \\
     a_{31} & a_{32} & a_{33} & a_{34} \\
     a_{41} & a_{42} & a_{43} & a_{44}
\end{pmatrix}
\begin{pmatrix}
     x \\
     y \\
     z \\
     ict
\end{pmatrix}
$$

Next, consider the equation of motion of the origin $O$ in the $S'$ frame

$$
x' = a_{14} t \ , \quad y' = a_{24} t \ , \ z'=a_{34} t \ , \ t'=a_{44} t
$$

Thus

$$
v_x'=\frac{dx'}{dt'}=-v \ , \ v_y'=\frac{dy'}{dt'}=0 \ , \ v_z'=\frac{dz'}{dt'}=0
$$

For the origin $O'$, the velocity relations should be

$$
\begin{gathered}
a_{11}v_x+a_{12}v_y+a_{13}v_z+a_{14}=0 \\
a_{21}v_x+a_{22}v_y+a_{23}v_z+a_{24}=0 \\
a_{31}v_x+a_{32}v_y+a_{33}v_z+a_{34}=0
\end{gathered}
$$

With velocities

$$
v_x=v \ , \ v_y=0 \ , \ v_z=0
$$

Let

$$
a_{44}=\gamma
$$

From the above equations we obtain

$$
\begin{gathered}
x'=\gamma x+a_{12}y+a_{13}z-\gamma vt \\
y'=a_{22}y+a{23}z \\
z'=a_{32}y+a{33}z \\
t'=a_{41}x+a_{12}y+a_{13}z+\gamma t
\end{gathered}
$$

Substituting into

$$
x'^2+y'^2+z'^2-c^2t'^2=0
$$

and considering the isotropy of position space

$$
x'^2+y'^2+z'^2-c^2t'^2=x^2+y^2+z^2-c^2t^2
$$

By comparing coefficients we obtain

$$
\begin{gathered}
\gamma = \pm \frac{1}{\sqrt{1-\beta^2}} \ , \ \beta=\frac{v}{c} \\
a_{41}=\frac{\gamma v}{c^2} \ , \ a_{12}=a_{13}=a_{42}=a_{43}=0 \\
a_{22}^2+a_{23}^2=a_{32}^2+a_{33}^2=1 \ , \ a_{22}a_{23}+a_{32}a_{33}=0
\end{gathered}
$$

Since the y-z transformation is the identity, we require

$$
a_{22}=a_{33}=1 \ , \ a_{23}=a_{32}=0
$$

And since the $v=0$ transformation is the identity, $\gamma$ is positive.

Thus we obtain

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

This is the most basic spacetime coordinate four-vector. What other fundamental four-vectors exist?

1. **Four-wave vector**: $k_p=(k_x, k_y, k_z, i\frac{\omega}{c})$, understood through $kr-\omega t=0$
2. **Four-current density vector**: $j_p=(j_x, j_y, j_z, ic\rho)$, understood through $\nabla \cdot \mathbf{j} + \frac{\partial \rho}{\partial t}=0$
3. **Four-momentum vector**: $p_\mu = (p_x, p_y, p_z, i\frac{W}{c})$

> We can use these quantities to derive many four-vectors. For example, four-velocity is obtained by differentiating the spacetime coordinate:
> $$U_\mu = \frac{dx_\mu}{d\tau}=\gamma(u,ic)$$
> From this we can see
> $$p_\mu = mU_\mu \ , \ j_p=\rho U_p$$
> For dynamics, differentiating $P$ gives the four-force vector $K$. (It can also be obtained via four-acceleration — interested readers can derive it themselves.)
