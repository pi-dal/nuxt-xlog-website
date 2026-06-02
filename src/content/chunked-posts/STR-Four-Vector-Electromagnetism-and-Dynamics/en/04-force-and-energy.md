## Electromagnetic Force Density, Momentum and Energy

The core principle of special relativity is that physical laws take the same form in all inertial frames. In the classical Lorentz force formula

$$\mathbf{F} = q(\mathbf{E} + \mathbf{v} \times \mathbf{B})$$

the quantities $\mathbf{E}$, $\mathbf{B}$ and $\mathbf{v}$ do not transform simply under Lorentz transformations. To ensure covariance of the force law, we need to introduce the four-vector of electromagnetic force.

For four-momentum, using the momentum theorem we obtain

$$
\begin{gathered}
K = \frac{d}{d\tau}(P) = \frac{d}{dt}(P) \cdot \frac{dt}{d\tau} = \gamma \cdot \frac{d}{dt}(P) \\
= \gamma \cdot (\frac{d\vec{p}}{dt} \ , \ \frac{1}{c} \cdot \frac{dE_{tot}}{dt}) \\
= \gamma \cdot (\vec{f} \ , \ \frac{1}{c} \cdot \vec{f} \cdot \vec{u}) \\
= \gamma \cdot q \cdot (\vec{E} + \vec{u} \times \vec{B} \ , \ \frac{1}{c} \cdot \vec{E} \cdot \vec{u}) \\
= \frac{q}{c} \cdot F \cdot U
\end{gathered}
$$

Thus we have

$$
\begin{gathered}
K' = L \cdot K = \frac{q}{c} (L \cdot F \cdot L^{-1}) \cdot (L \cdot U) \\
= \frac{q}{c} F' \cdot U'
\end{gathered}
$$

We find that $K$ is indeed a four-vector satisfying Lorentz covariance.

### Particle Motion in Magnetic Fields

The analysis of charged particle motion in magnetic fields can also be completed within the four-dimensional framework. Using the electromagnetic field tensor and four-velocity, we can fully describe particle trajectories in electromagnetic fields without relying on a specific reference frame.
