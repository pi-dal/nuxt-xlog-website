### 粒子的完全非弹性碰撞生成一个新粒子

![relativistic_collision_hd.gif](/article-assets/STR-Four-Vector-Basic-Transformation/relativistic_collision_hd.gif)

对各个粒子，有以下四维矢量：

1. 入射粒子：
   $$P_1$$
2. 被入射粒子：
   $$P_2$$
3. 生成粒子 ：
   $$P_3$$
   由四维动量守恒可得：
   $$P_1 + P_2 = P_3$$
   平方可得
   $$P_1 \circ P_1 +P_2 \circ P_2 + 2P_1 \circ P_2 = P_3 \circ P_3$$
   即为
   $$m_1^2 + 2 \gamma_1 \gamma_2m_1m_2 \cdot \frac{(c^2-v_1v_2)}{c^2} + m_2^2 = m_3^2$$
   这就可以得到
   $$m_3$$
   而由四维动量守恒可以得到：
   $$v_3 = \frac{\gamma_1 \cdot m_1 \cdot v_1 + \gamma_2 \cdot m_2 \cdot v_2}{\gamma_1 \cdot m_1 + \gamma_2 \cdot m_2}$$

### 粒子的完全弹性碰撞

![elastic_collision_theta_alpha_hd.gif](/article-assets/STR-Four-Vector-Basic-Transformation/elastic_collision_theta_alpha_hd.gif)

对各个粒子，有以下四维矢量：

1. 入射粒子：
   $$P_1=\gamma_1 m \cdot (v \ , \ 0 \ , \ 0 , \ ic)$$
2. 静止粒子：
   $$P_2=M \cdot (0 \ , \ 0 \ , \ 0 , \ ic)$$
3. 生成粒子1：
   $$P_3 = \gamma_3 M \cdot (wcos(\theta) \ , \ wsin(\theta) \ , \ 0 \ , \ ic)$$
4. 生成粒子2：
   $$P_4 = \gamma_4 m \cdot (rcos(\alpha) \ , \ rsin(\alpha) \ , \ 0 \ , \ ic)$$
   由四维动量守恒有
   $$P_1 + P_2 = P_3 + P_4$$
   平方可以得到
   $$P_1 \circ P_1 +P_2 \circ P_2 + 2P_1 \circ P_2 = P_3 \circ P_3 +P_4 \circ P_4 + 2P_3 \circ P_4$$
   又因为
   $$P_1 \circ P_3 + P_2 \circ P_3 = P_3 \circ P_3 + P_4 \circ P_3 = P_3 \circ P_3 + P_1 \circ P_2$$
   可以得到
   $$
   \begin{gathered}
   P_1 \circ P_3 = \gamma_1 \cdot \gamma_3 \cdot m \cdot M \cdot (c^2 - v \cdot w \cdot \cos(\alpha))\\
   P_2 \circ P_3 = \gamma_3 \cdot M^2 \cdot c^2, P_3 \circ P_3 = M^2 \cdot c^2 \\
   P_1 \circ P_2 = \gamma_1 \cdot m \cdot M \cdot c^2
   \end{gathered}
   $$
   可以解得
   $$
   w = \frac{2 \cdot \left(1+\frac{M}{m}\cdot \frac{1}{\gamma_1}\right) \cdot v \cdot \cos(\alpha)}{\left(1+\frac{M}{m}\cdot \frac{1}{\gamma_1}\right)^2 + v^2 \cdot \cos^2(\alpha)}
   $$
   由能量守恒和动量守恒便可以解得了
   $$
   \begin{gathered}
   \gamma_4 = \gamma_1 + \frac{M}{m} - \frac{M}{m} \cdot \gamma_3 \\
   r_x = \left(\gamma_1 \cdot v - \gamma_w \cdot \frac{M}{m} \cdot w_x\right)/\gamma_r \\
   w_x = w \cdot cos(\alpha) \\
   \beta = \sin^{-1}(r_x/r)
   \end{gathered}
   $$
