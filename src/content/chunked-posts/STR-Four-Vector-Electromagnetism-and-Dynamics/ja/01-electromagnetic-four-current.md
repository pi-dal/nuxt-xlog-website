## 電磁法則の四元ベクトル表現

### 電荷は四元スカラー

前回の議論から、四元電流密度ベクトルが得られました

$$j_p=(j_x \ ,\ j_y \ , \ j_z \ , \ ic\rho)$$

そして

$$\rho = \gamma \rho' \ , \ dV = \frac{dV'}{\gamma}$$

より

$$\rho dV = \rho' dV'$$

が導かれ、電荷は四元スカラーであることがわかります。

### ローレンツ条件

ローレンツ条件

$$\nabla \cdot A + \frac{1}{c^2} \frac{\partial \phi}{\partial t} = 0$$

は

$$\partial_\mu A_\mu = 0  \ ,\ A_\mu = \left(A_x, A_y, A_z, \frac{i}{c}\varphi\right) = \left(\mathbf{A}, \frac{i}{c}\varphi\right)$$

と書けます。

### ダランベール方程式

ダランベール方程式

$$\nabla^2 \mathbf{A} - \frac{1}{c^2} \frac{\partial^2 \mathbf{A}}{\partial t^2} = - \mu_0 \mathbf{j} \ , \ \nabla^2 \varphi - \frac{1}{c^2} \frac{\partial^2 \varphi}{\partial t^2} = - \frac{\rho}{\varepsilon_0}$$

と四元スカラー演算子

$$\square = \partial_\mu \partial_\mu = \nabla^2 - \frac{1}{c^2} \frac{\partial^2}{\partial t^2}$$

から

$$\square A_\mu = - \mu_0 J_\mu$$

が得られます。
