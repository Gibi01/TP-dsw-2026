# Cómo integrar esto en tu proyecto (rama frontend)

Ya ajustado a tu estructura real (`Paginas/`, sin axios, MUI + Tailwind).

## 1. Copiar archivos

Copiá manteniendo la ruta:

```
src/Tipos/dominio.ts
src/Servicios/api.ts
src/Servicios/especialidadesService.ts
src/Servicios/profesionalesService.ts
src/Paginas/Doctores.tsx
src/Paginas/Especialidades.tsx
src/Paginas/Registro.tsx
src/Paginas/Login.tsx
```

`src/App.tsx` te lo dejo reescrito completo con las rutas nuevas
agregadas, conservando `Inicio` y `/reserva` tal cual estaban. Podés
pisar tu archivo actual con este.

## 2. Actualizar tu navBar

No tengo el contenido de `Componentes/navBar.tsx` (no lo subiste),
así que no lo toqué para no pisarte algo que no vi. Agregale, donde
tengas los demás `Link`/`Button` de navegación, algo como:

```tsx
import { Link as RouterLink } from "react-router-dom";
// ...
<Button color="inherit" component={RouterLink} to="/doctores">Doctores</Button>
<Button color="inherit" component={RouterLink} to="/especialidades">Especialidades</Button>
<Button color="inherit" component={RouterLink} to="/login">Iniciar sesión</Button>
<Button variant="outlined" color="inherit" component={RouterLink} to="/registro">Registrarme</Button>
```

Si me pasás el archivo real de tu navBar, te lo devuelvo ya integrado.

## 3. Nada de dependencias nuevas

`Servicios/api.ts` usa `fetch` nativo (no agrega axios, ya que no
estaba en tu `package.json`). El resto de los servicios usan datos
mock y ya están listos: cuando conectes el backend, solo hay que
descomentar la línea marcada `// Real:` en cada función.

## 4. Posible ajuste de versión de MUI

Tu `package.json` tiene `@mui/material` en `^9.2.0`. Usé la API de
`Grid` con la prop `item` (`<Grid item xs={12} sm={6} ...>`), que es
la forma "clásica". Si tu versión de MUI ya migró a `Grid2` (`size={{ xs: 12, sm: 6 }}`
en vez de `item`/`xs`/`sm` sueltos), avisame o probá correrlo — si
tira error de tipos en `Grid`, es por eso y es un cambio de una
línea.

## 5. Variable de entorno (para más adelante)

Cuando conectes el backend, creá un `.env` en la raíz del frontend:

```
VITE_API_URL=http://localhost:3000/api
```
