## 四维矢量的特性

其实讲了这么多，我们还是没有很好介绍一下四维矢量的特性，但这是我们后边解决实际问题的关键，下面我来介绍一下几个四维矢量的特性

### 洛伦兹协变性

这是四维矢量的一个重要性质，下面我们来推导一下

$$
\begin{gather*}
\text{这是四维矢量的一个重要性质。} \\[1em]
\text{在狭义相对论中，物理定律的形式在所有惯性参考系中都相同。} \\[1em]
\text{这意味着物理量在洛伦兹变换下应保持某种不变性。} \\[1em]
\text{四维矢量的引入正是为了在数学上实现这种不变性。} \\[1em]
\text{对一个四维矢量 } X=(x, y, z, ict) \text{ 和另一个四维矢量 } Y=(x', y', z', ict'). \\[1em]
\text{它们的内积定义为：} \\[1em]
X \circ Y = x x' + y y' + z z' + (ict)(ict') = x x' + y y' + z z' - c^2 tt' \\[1em]
\text{此内积是一个标量。} \\[1em]
\text{在所有惯性参考系中具有相同的值。} \\[1em]
\text{因此在洛伦兹变换下保持不变。} \\[1em]
\text{我们来推导一下。} \\[1em]
\text{设四维矢量 } X \text{ 在 } S \text{ 系中表示为列向量 } X. \\[1em]
\text{在 } S' \text{ 中表示为 } X'. \\[1em]
\text{且它们通过洛伦兹变换矩阵 } L \text{ 相关联：}X' = L X\text{。} \\[1em]
\text{类似地，}Y' = LY\text{。} \\[1em]
\text{（值得注意的是，在采用虚时间分量 } ict \text{ 的坐标系中，洛伦兹变换矩阵 } L \text{ 是一个正交矩阵。）} \\[1em]
\text{即它满足 } L^T L = I\text{，其中 } I \text{ 是单位矩阵。} \\[1em]
\text{这个性质确保了在变换后内积的数值不变。）} \\[1em]
\begin{gathered}
\text{那么，变换后的四维矢量 } X' \text{ 和 } Y' \text{ 的内积为：} \\[8pt]
X' \circ Y' = (X')^T Y' = (L X)^T (L Y) = X^T L^T L Y
\end{gathered} \\[1em]
\begin{gathered}
\text{由于洛伦兹变换矩阵 } L \text{ 在虚时间坐标系中满足正交条件 } L^T L = I\text{，} \\[8pt]
\text{因此上式变为：} \\
X^T L^T L Y = X^T I Y = X^T Y = X \circ Y
\end{gathered} \\[1em]
\text{这证明了洛伦兹协变性：} \\[1em]
\text{在经过洛伦兹变换后，四维矢量的内积数值保持不变。} \\[1em]
\text{这一特性使得我们可以通过构造洛伦兹不变量（如四维矢量的模长）来简化对物理量的处理。} \\[1em]
\text{而不必担心选择不同的惯性参考系会导致数值变化。} \\[1em]
\text{例如，四维矢量的模长 } X \circ X = x^2+y^2+z^2-c^2t^2 \text{ 在任何参考系中都是不变的。}
\end{gather*}
$$

### 一些特殊四维矢量的内积与守恒

1. 四维速度的内积
   $$U \circ U =U \circ U =-c^2$$
2. 四维动量的内积
   $$
   P \circ U = -m(U \circ U)=-mc^2=-E_0 \ , \
   P \circ P = -m^2c^2
   $$
3. 四维动量是守恒的

> 你是否注意到因为洛伦兹协变性，我们可以得到

$$
P \circ P = -(\frac{E_{tot}}{c})^2 + p^2 \ , \
P' \circ P' = -(\frac{E_0}{c})^2
$$

这就是著名的相对论能量-动量关系
$$E_{tot}^2 = E_0^2 + p^2c^2$$

> 那么这样的话对光子就有

$$
 E_{tot}=p \cdot c \ , \
 P \circ P = 0
$$
