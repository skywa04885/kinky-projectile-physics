# Variables with units

($V$) velocity, unit: $\frac{m}{s}$

($P$) pressure, unit: $\frac{kg}{m^2}$, $Pa$

($T$) temperature, unit: $k$

($\rho$) density, unit: $\frac{kg}{m^3}$

($\mu$) viscosity, unit: $Pa \cdot s$

# Ideal Gas Law

The ideal gas law relates pressure to the density and temperature.

$$P=R \rho T$$

where $R$ is a gas specific constant.

We can use this equation to derive the density of a gas based on the temperature, constant and the pressure (which is useful for is since we receive these from the weather API), so:

$$\frac{P}{R \cdot T} = \rho,\ R \cdot T \neq 0$$