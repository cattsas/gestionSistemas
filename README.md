# Gestión de Sistemas

Sistema interno de gestión de stock informático: artículos, equipos, compras,
entregas a empleados y mantenimientos.

Next.js 15 (App Router) · Prisma 6 · MySQL/MariaDB · Tailwind + shadcn/ui

---

## Requisitos

- **Node.js 20 LTS**
- **MySQL o MariaDB** (XAMPP sirve)

## Puesta en marcha

```bash
cp .env.example .env          # en Windows: copy .env.example .env
```

Editar `.env` y, como mínimo, generar un `AUTH_SECRET` propio:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Crear la base vacía y levantar:

```bash
mysql -u root -e "CREATE DATABASE stock;"
npm ci
npm run db:deploy     # aplica las migraciones
npm run db:seed       # crea el usuario admin y datos de ejemplo
npm run dev
```

En <http://localhost:3000> se entra con el usuario `admin`. Si `SEED_ADMIN_PASS`
quedó vacío, el seed genera una contraseña aleatoria y **la imprime una sola
vez** por consola.

> El seed carga datos de ejemplo **solo si la base está vacía**. Sobre una
> instalación en uso se limita a garantizar que el usuario admin exista, sin
> tocar su contraseña.

### Si te quedaste afuera

`POST /api/usuario` requiere sesión, así que no sirve para recuperarse. Desde la
consola del servidor:

```bash
npm run user:create -- nuevoUsuario unaClaveSegura
```

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Compilar y servir en producción |
| `npm test` | Tests (necesita `TEST_DATABASE_URL`) |
| `npm run lint` | ESLint |
| `npm run db:deploy` | Aplica migraciones (producción) |
| `npm run db:migrate` | Crea una migración nueva (desarrollo) |
| `npm run db:seed` | Usuario admin + datos de ejemplo |
| `npm run db:reset` | **Borra la base** y la reconstruye |
| `npm run db:studio` | Explorador visual de la base |
| `npm run user:create` | Alta de usuario desde consola |

## Variables de entorno

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Conexión a la base |
| `TEST_DATABASE_URL` | Base de los tests. **Se trunca entera**: nunca apuntarla a la de trabajo |
| `SHADOW_DATABASE_URL` | Base auxiliar que Prisma usa al crear migraciones |
| `AUTH_SECRET` | Firma de la cookie de sesión. Distinto en cada entorno |
| `COOKIE_SECURE` | `true` solo si hay HTTPS. Ver la nota de despliegue |
| `SEED_ADMIN_USER` / `SEED_ADMIN_PASS` | Usuario inicial que crea el seed |

---

## Cómo está organizado

El sistema se apoya en un **registro de entidades**: un descriptor por entidad
en `src/lib/entities/` que declara sus campos, validaciones y relaciones. De ahí
se derivan los endpoints, las columnas de las tablas y los formularios.

```
src/
  lib/entities/      Descriptores: la fuente de verdad. Importan solo zod.
  lib/services/      CRUD contra Prisma, sin HTTP. Lo usan las rutas,
                     los Server Components y los tests.
  lib/api/           Contrato de respuestas y factory de route handlers.
  lib/auth/          Sesión (JWT firmado en cookie httpOnly).
  app/api/           Rutas: dos líneas cada una, delegan en el factory.
  app/dashboard/     Tres páginas dinámicas que sirven a las 9 entidades.
  components/        EntityForm y DataTable, ambos genéricos.
  middleware.js      Protege /dashboard/* y /api/*.
```

### Agregar una entidad nueva

1. Crear el descriptor en `src/lib/entities/loQueSea.js`.
2. Registrarlo en `src/lib/entities/index.js`.
3. Crear los dos route handlers, de dos líneas cada uno:

```js
// src/app/api/loQueSea/route.js
import { collection } from "@/lib/api/crudRoute";
export const { GET, POST } = collection("loQueSea");

// src/app/api/loQueSea/[id]/route.js
import { item } from "@/lib/api/crudRoute";
export const { GET, PUT, DELETE } = item("loQueSea");
```

El listado, el alta, la edición, el borrado y la entrada en el menú salen
derivados: no hay que escribir ninguna página.

### Contrato de la API

```jsonc
// Éxito
{ "data": [ ... ] }        // una colección vacía es 200 con [], nunca 404

// Error
{ "error": { "code": "VALIDATION", "message": "...", "fields": { "nombre": "..." } } }
```

Códigos: `VALIDATION` (422) · `NOT_FOUND` (404) · `CONFLICT` (409) ·
`FK_CONSTRAINT` (409) · `UNAUTHENTICATED` (401) · `BAD_REQUEST` (400) ·
`INTERNAL` (500).

Las claves foráneas se devuelven como el escalar más una etiqueta de solo
lectura, de modo que la respuesta de un `GET` se puede reenviar tal cual a un
`PUT`:

```jsonc
{ "id": 4, "descripcion": "Fuente 600W", "id_proveedor": 2,
  "id_proveedor_label": "Newbytes", "stock": 7 }
```

---

## Despliegue en un servidor Windows

Pensado para una máquina de la red interna a la que se accede por IP.

### 1. Preparar

Instalar Node 20 LTS y MariaDB/MySQL. Crear una base y un usuario **con
contraseña** (no usar `root` sin clave fuera de la máquina de desarrollo):

```sql
CREATE DATABASE stock;
CREATE USER 'gestion'@'localhost' IDENTIFIED BY 'una-clave-larga';
GRANT ALL PRIVILEGES ON stock.* TO 'gestion'@'localhost';
```

### 2. Publicar

```powershell
git clone <repo> C:\gestionSistemas
cd C:\gestionSistemas
copy .env.example .env
```

En `.env`:

```ini
DATABASE_URL="mysql://gestion:una-clave-larga@localhost:3306/stock"
AUTH_SECRET="<generar uno nuevo, distinto al de desarrollo>"
COOKIE_SECURE="false"
```

> **`COOKIE_SECURE` en `false` es intencional.** Accediendo por HTTP plano
> (`http://192.168.x.x:3000`), una cookie marcada como `secure` es descartada
> por el navegador y el login falla sin dar ninguna pista. Ponerla en `true`
> recién cuando haya HTTPS delante. La contrapartida es que la sesión viaja sin
> cifrar por la red interna.

```powershell
npm ci
npm run db:deploy
npm run db:seed        # anotar la contraseña que imprime
npm run build
```

### 3. Que arranque solo

Con [NSSM](https://nssm.cc/), para que sobreviva a los reinicios:

```powershell
nssm install GestionSistemas "C:\Program Files\nodejs\node.exe" ^
  "C:\gestionSistemas\node_modules\next\dist\bin\next" start
nssm set GestionSistemas AppDirectory C:\gestionSistemas
nssm set GestionSistemas AppStdout C:\gestionSistemas\logs\salida.log
nssm set GestionSistemas AppStderr C:\gestionSistemas\logs\error.log
nssm start GestionSistemas
```

### 4. Abrir el puerto

```powershell
New-NetFirewallRule -DisplayName "Gestion Sistemas" -Direction Inbound `
  -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
```

Conviene además fijarle una IP estática al equipo, para que la dirección no
cambie.

### 5. Backups

La base es el único dato que no se puede regenerar. Una tarea programada diaria:

```powershell
mysqldump -u gestion -p stock > C:\backups\stock_%DATE%.sql
```

### Actualizar

```powershell
git pull
npm ci
npm run db:deploy      # aplica solo las migraciones nuevas
npm run build
nssm restart GestionSistemas
```

---

## Tests

```bash
npm test
```

Los tests invocan los route handlers directamente (sin levantar servidor) contra
una base propia. **Truncan todas las tablas** en cada caso, por eso
`tests/setup/env.js` aborta si `DATABASE_URL` no apunta a una base cuyo nombre
contenga `test`.
