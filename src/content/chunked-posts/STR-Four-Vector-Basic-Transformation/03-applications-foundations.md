## 四维矢量解决各类时空与碰撞问题的妙用

### 相对论情形下的多普勒效应

由四维波矢，可以得到

$$
k'_x = \gamma\left(k_x - \frac{v}{c^2}\omega\right) \ , \ k'_y = k_y \ , \ k'_z = k_z \ , \ \omega' = \gamma(\omega - v k_x)
$$

即有
$$ \omega' = \gamma\omega(1 - \frac{v}{c}cos\theta) $$
这就是相对论情形下的多普勒效应

### 粒子碰撞堙灭产生光子

![pair_annihilation_hd.gif](/article-assets/STR-Four-Vector-Basic-Transformation/pair_annihilation_hd.gif)

对各个粒子，会有以下四维动量：

1. 入射粒子：
   $$P_1=\gamma m \cdot (v \ , \ 0 \ , \ 0 , \ ic)$$
2. 静止粒子：
   $$P_2=M \cdot (0 \ , \ 0 \ , \ 0 , \ ic)$$
3. 垂直出射的光子束：
   $$P_3=\frac{hf_1}{c} \cdot (0 \ , \ 1 \ , \ 0 \ , \ i)$$
4. 倾斜出射的光子束：
   $$P_4=\frac{hf_2}{c} \cdot (cos(\theta) \ , \ -sin(\theta) \ , \ 0 \ , \ i)$$
   由四维动量守恒有
   $$P_1 + P_2 = P_3 + P_4$$
   可以得到：
   $$
   \begin{gathered}
   E_1 + E_2 = E_3 + E_4\\
   E_1 \cdot \frac{v}{c} = E_4 \cdot cos(\theta) \\
   E_3 = -E_4 \cdot sin(\theta)
   \end{gathered}
   $$
   所以可以有
   $$
   \begin{gathered}
   E_4^2 - E_3^2=E_1^2 \cdot \frac{v^2}{c^2} \\
   (E_1 + E_2) \cdot (E_4 - E_3)=E_4^2 - E_3^2 \\
   E_4 - E_3 = \frac{E_1^2 \cdot \frac{v^2}{c^2}}{E_1 + E_2}
   \end{gathered}
   $$
   又有
   $$\frac{v^2}{c^2} = 1 - \frac{1}{\gamma^2} = 1 - \frac{E_2^2}{E_1^2} = \frac{E_1^2 - E_2^2}{E_1^2}$$
   得到
   $$2 \cdot E_4 = E_1 + E_2 + \frac{E_1^2}{E_1+E_2} \cdot \frac{E_1^2-E_2^2}{E_1^2} = E_1 + E_2 + E_1 - E_2 = 2 \cdot E_1$$
   所以
   $$
   \begin{gathered}
   E_1 = E_4 \\
   E_2 = E_3
   \end{gathered}
   $$
   得到了
   $$cos(\theta) = \frac{v}{c} = \sqrt{1 - \frac{E_2^2}{E_1^2}}$$

### 光照射粒子产生新粒子

![pair_production_hd.gif](/article-assets/STR-Four-Vector-Basic-Transformation/pair_production_hd.gif)

对各个粒子，会有以下四维动量：

1. 入射的光：
   $$P_1=\frac{hf}{c} \cdot (1 \ , \ 0 \ , \ 0 \ , \ i)$$
2. 静止粒子
   $$P_2=M \cdot (0 \ , \ 0 \ , \ 0 \ , \ ic)$$
3. 新粒子
   $$P_3$$
   由四维动量守恒可以得到
   $$P_1 + P_2 = P_3$$
   平方有
   $$P_1 \circ P_1+2 P_1 \circ P_2+P_2 \circ P_2=P_3 \circ P_3$$
   若原来的粒子相当中>>新的粒子，则有：
   $$0 + 2 \cdot h \cdot f \cdot M + (M \cdot c)^2 \approx (M + 2 \cdot m)^2 \cdot c^2$$
   化简就可以得到
   $$h \cdot f \approx 2 \cdot m \cdot c^2 + 2 \cdot m^2 \cdot c^2 / M = 2 \cdot m \cdot c^2 \cdot \left(1 + \frac{m}{M}\right)$$
   > 由此可知：如果涉及的粒子是电子，那么入射量子的能量必须至少是产生粒子的静止能量的两倍。
