> This article uses complex Euclidean space. Many textbooks adopt the Minkowski metric formalism, but due to personal preference I only provide derivations in one approach. The physical ideas are equivalent, and I hope this is also helpful for those using the other approach.
> If you need it, this article also provides a [slidev presentation](https://talks.pi-dal.com/2025-07-22-STR-Four-Vector) (you can export PDF and other formats).

In my journey learning physics olympiad, I found that resources in Chinese about four-vectors in Special Relativity (STR) — whether articles or books — are extremely scarce. Therefore, I hope to draw on my own learning to write a relevant article that can serve as a reference for fellow students interested in this topic.

## Why Use Four-Vectors?

When studying STR, I often found myself troubled by the "proper" states in various scenarios. The solutions to many practice problems — and even the problems themselves — contained certain fallacies, which made my understanding of different scenarios chaotic. But why does using these "classical" transformation formulas feel so counterintuitive? The root cause is likely that our understanding of time and space is built on the classical **Galilean spacetime**, which doesn't work under Einstein's special relativity, because spacetime is not independent. This is based on the two postulates of special relativity:

1. **Constancy of the speed of light**: The speed of light in a vacuum is the same constant in all inertial reference frames, independent of the motion of the source or observer.
2. **Principle of relativity**: The laws of physics take the same form in all inertial reference frames; there is no "absolutely stationary" inertial frame.

What conclusions can we draw from these?

$$
From\ the\ constancy\ of\ light\ speed,\ we\ can\ derive\
x^2+y^2+z^2-c^2t^2=0
$$

This conclusion can be reached by simply considering the wavefront equations of two light beams at different times.

If the old spacetime framework leads to complexity in understanding, is there a way to resolve this? The answer is yes. Minkowski proposed such a spacetime. Since special relativity is essentially the theory of invariants of the Lorentz group, constructing such a spacetime elegantly solves the problem — this is Minkowski spacetime.
