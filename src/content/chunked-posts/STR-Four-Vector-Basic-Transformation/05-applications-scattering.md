### 康普顿散射

![compton_scattering_hd.gif](/article-assets/STR-Four-Vector-Basic-Transformation/compton_scattering_hd.gif)

对各个粒子，有以下四维矢量：

1. 入射的光：
   $$P_1=\frac{hf}{c} \cdot (1 \ , \ 0 \ , \ 0 \ , \ i)$$
2. 静止粒子
   $$P_2=m \cdot (0 \ , \ 0 \ , \ 0 \ , \ ic)$$
3. 新粒子1
   $$P_3 = \frac{hf'}{c} \cdot (cos(\theta) \ , \ sin(\theta) \ , \ 0 \ , \ i)$$
4. 新粒子2
   $$P_4 = \gamma m \cdot ( \vec{v}\ , \ ic)$$
   由四维动量守恒有
   $$P_1 + P_2 = P_3 + P_4$$
   平方可以得到
   $$P_1 \circ P_1 +P_2 \circ P_2 + 2P_1 \circ P_2 = P_3 \circ P_3 +P_4 \circ P_4 + 2P_3 \circ P_4$$
   即是
   $$P_1 \circ P_2 = P_3 \circ P_4$$
   又因为
   $$P_1 \circ P_3 + P_2 \circ P_3 = P_3 \circ P_3 + P_4 \circ P_3 = P_1 \circ P_2$$
   即是
   $$\frac{h}{\lambda} \cdot \frac{h}{\lambda'}(1-\cos \theta)+m_0 \cdot c \cdot \frac{h}{\lambda'}=m_0 \cdot c \cdot \frac{h}{\lambda}$$
   得到了
   $$\lambda'-\lambda = \frac{h}{m_0\cdot c} \cdot (1-\cos \theta)$$
   这就是康普顿散射的经典结论！

### 逆康普顿散射

![inverse_compton_scattering_hd.gif](/article-assets/STR-Four-Vector-Basic-Transformation/inverse_compton_scattering_hd.gif)

对各个粒子，有以下四维矢量：

1. 入射的光：
   $$P_1=\frac{hf}{c} \cdot (1 \ , \ 0 \ , \ 0 \ , \ i)$$
2. 高速粒子
   $$P_2 = \gamma_2 m \cdot (v \ , \ 0 \ , \ 0 \ , \ ic)$$
3. 新粒子1
   $$P_3 = \frac{hf'}{c} \cdot (1 \ , \ 0 \ , \ 0 \ , \ i)$$
4. 新粒子2
   $$P_4 = \gamma_4 m \cdot (v' \ , \ 0 \ , \ 0 \ , \ ic)$$
   由四维动量守恒有
   $$P_1 + P_2 = P_3 + P_4$$
   平方可以得到
   $$P_1 \circ P_1 +P_2 \circ P_2 + 2P_1 \circ P_2 = P_3 \circ P_3 +P_4 \circ P_4 + 2P_3 \circ P_4$$
   即是
   $$P_1 \circ P_2 = P_3 \circ P_4$$
   又因为
   $$P_1 \circ P_3 + P_2 \circ P_3 = P_3 \circ P_3 + P_4 \circ P_3 = P_1 \circ P_2$$即是
   $$\frac{2}{\gamma_2 m c^2} \cdot h \cdot f \cdot h \cdot f' + h \cdot f' \cdot \left(1-\frac{v}{c}\right) = h \cdot f \cdot \left(1+\frac{v}{c}\right) \approx 2 \cdot h \cdot f$$
   若v接近于c，会有
   $$h \cdot f' \cdot \left(\frac{1}{\gamma_2 m_0 c^2} \cdot h \cdot f + \frac{1}{2} \cdot \left(1-\frac{v}{c}\right)\right) = h \cdot f$$
   这就得到了f与f‘的关系！

## 对四维矢量的思考

我希望这篇基础的介绍性文章可以给你一些启示，但其实四维矢量的妙用远不只于此，鉴于篇幅问题这篇文章便想在此作结了（也许后边可以开个系列记录一下：P 我们看到四维矢量为理解相对论现象提供了统一且优雅的数学框架，希望这些可以给你一些启示与思考，也许有时候抽象的数学工具可以大大推动我们对物理的思考。

> PS：对于四维矢量可不可以再中学物理竞赛使用的问题，我目前的经验是对于极其有把握的题目可以尝试，但是一旦出错不要有念想会有过程的分数，没办法物理竞赛也是应试，最基础的最经典的方法往往最受青睐（但是四维矢量用来验证还是很好的：D
