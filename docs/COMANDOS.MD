fASE 1:
-  DESARROLLO DEL ENTORNO NODE.js
 ```sh
mkdir pkm-linguistico && cd pkm-linguistico
pnpm init                          # package.json raíz

mkdir backend web mobile shared
cd backend && pnpm init && cd ..
cd web && pnpm init && cd ..
cd mobile && pnpm init && cd ..
cd shared && pnpm init && cd ..

 ```
- Instalacion de las depenencias del backend
```sh
cd backend

# Dependencias de producción
pnpm add express dotenv

# Dependencias de desarrollo
pnpm add -D typescript @types/node @types/express tsx
```

Tras crear un puerto de entrada PORT=3000 para realizar las pruebas
se abre el puerto de 3000 y sale el mensaje dentro de la carpeta backend
```sh
pnpm dev 
```

Este comando primero comprueba la dependencia y pnpm se niega correr en cualquier script (por ejemplo: pnpm dev) mientras builds esta pendiente de aprobar, esta descrito por defeto. Ocurrio esto durante la intalacion  de las dependencias de desarrollo `pnpm add -D typescript @types/node @types/express tsx`.  (Un bloqueó fue el script de build/postinstall de `esbuild`). Por lo que se tuvo que se puso explicitamente.

Desde hace unas versiones, pnpm bloquea por defecto cualquier script de instalación (postinstall) de las dependencias, salvo que tú lo apruebes explícitamente. Es una medida de seguridad ante ataques de cadena de suministro: paquetes maliciosos han usado justo estos scripts automáticos para ejecutar código no deseado en el ordenador de quien instala. Pnpm prefiere pedirte permiso antes que ejecutar cualquier script a ciegas.
```sh
pnpm approve-builds esbuild
# Esto aprueba esbuild directamente por nombre, sin menú. Luego:
pnpm install     # ejecuta el script ya aprobado
pnpm dev         # ahora sí debería arrancar
```

Para crear tsconfig.json se puede realizar mediante este comando:
```sh
pnpm exec tsc --init
```


descargar más dependencias para realizar los tests
```sh
pnpm add -D vitest supertest @types/supertest
```
Añdir la dependencia de mongoose
```sh
pnpm add mongoose
```