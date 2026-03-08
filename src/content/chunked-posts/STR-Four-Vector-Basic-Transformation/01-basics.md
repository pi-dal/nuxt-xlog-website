## 闵可夫斯基时空中的基础四维矢量

由上述的不变式

$$
 x^2+y^2+z^2-c^2t^2=0
$$

我们可以得到第一组四维矢量

$$
(x,y,z,ict)
$$

那么如何由他得到基础的洛伦兹变换呢？也即是 (x,y,z,ict) 与 (x',y',z',ict')的关系。

$$
\text{从一般变化式出发}
$$

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
     a_{31} & a_{32} & a_{33} & a_{34} \\ % 这里修正了a_31, a_32，如果原意就是a_31,a_31可以改回去
     a_{41} & a_{42} & a_{43} & a_{44}
\end{pmatrix}
\begin{pmatrix}
     x \\
     y \\
     z \\
     ict
\end{pmatrix}
$$

$$
\text{接下来就是考虑坐标原点 $O$ 在 $S'$ 系中的运动方程}
$$

$$
x' = a_{14} t \ , \quad y' = a_{24} t \ , \ z'=a_{34} t \ , \ t'=a_{44} t
$$

$$
\text{所以有}
$$

$$
v_x'=\frac{dx'}{dt'}=-v \ , \ v_y'=\frac{dy'}{dt'}=0 \ , \ v_z'=\frac{dz'}{dt'}=0
$$

$$
\text{对坐标原点O'，应有速度关系}
$$

$$
\begin{gathered} % 这些密切相关的公式可以放在一个gathered里
a_{11}v_x+a_{12}v_y+a_{13}v_z+a_{14}=0 \\
a_{21}v_x+a_{22}v_y+a_{23}v_z+a_{24}=0 \\
a_{31}v_x+a_{32}v_y+a_{33}v_z+a_{34}=0
\end{gathered}
$$

$$
\text{又有速度}
$$

$$
v_x=v \ , \ v_y=0 \ , \ v_z=0
$$

$$
\text{不妨令}
$$

$$
a_{44}=\gamma
$$

$$
\text{则由以上式子可以得到}
$$

$$
\begin{gathered} % 这些密切相关的公式可以放在一个gathered里
x'=\gamma x+a_{12}y+a_{13}z-\gamma vt \\
y'=a_{22}y+a{23}z \\
z'=a_{32}y+a{33}z \\
t'=a_{41}x+a_{12}y+a_{13}z+\gamma t
\end{gathered}
$$

$$
\text{将上式代入}
$$

$$
x'^2+y'^2+z'^2-c^2t'^2=0
$$

$$
\text{再加上位置空间的各向异性得}
$$

$$
x'^2+y'^2+z'^2-c^2t'^2=x^2+y^2+z^2-c^2t^2
$$

$$
\text{由系数对比可知}
$$

$$
\begin{gathered} % 这些密切相关的公式可以放在一个gathered里
\gamma = \pm \frac{1}{\sqrt{1-\beta^2}} \ , \ \beta=\frac{v}{c} \\
a_{41}=\frac{\gamma v}{c^2} \ , \ a_{12}=a_{13}=a_{42}=a_{43}=0 \\
a_{22}^2+a_{23}^2=a_{32}^2+a_{33}^2=1 \ , \ a_{22}a_{23}+a_{32}a_{33}=0
\end{gathered}
$$

$$
\text{又因为y-z空间的变化为恒等变换，应该有}
$$

$$
a_{22}=a_{33}=1 \ , \ a_{23}=a_{32}=0
$$

$$
\text{再由v=0的变换为恒等变换可知 } \gamma \text{ 为正}
$$

$$
\text{综上可得到}
$$

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

这就是最基础的时空坐标四维矢量，那么还有哪些比较基础的四维矢量呢

1. 四维波矢
   $$k_p=(k_x \ ,\ k_y \ , \ k_z \ , \ i\frac{\omega}{c})$$可以通过
   $$kr-wt=0$$来理解
2. 四维电流密度矢量
   $$j_p=(j_x \ ,\ j_y \ , \ j_z \ , \ ic\rho)$$可以通过
   $$\nabla \cdot \mathbf{j} + \frac{\partial \rho}{\partial t}=0$$来理解
3. 四维动量矢量
   $$p_\mu = (p_x \ ,\ p_y \ , \ p_z \ , \ i\frac{W}{c})$$
   > 其实我们可以用这些量来推导很多的四维矢量
   > 比如四维速度，就是对时空坐标进行微分，不难得到
   > $$U_\mu = \frac{dx_\mu}{d\tau}=\gamma(u,ic)$$
   > 不难看出
   > $$p_\mu = mU_\mu \ , \ j_p=\rho U_p$$
   > 而对于动力学，对P进行微分既可以得到四维力矢量K，这里不再赘述（btw，其实他也可以用四维加速度去得到，有兴趣的读者可以自己推导一下）
