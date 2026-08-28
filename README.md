# Prueba Técnica QA Full Stack Sr — Makers

Suite de pruebas que cubre los tres módulos del enunciado: automatización de un smoke test de login, diseño de pruebas funcionales de una billetera digital, y pruebas funcionales de API.

**Stack:** Cypress + JavaScript · Allure · GitHub Actions

---

## 🔗 Accesos rápidos

| | |
|---|---|
| 📊 **Dashboard de resultados** | *(se publica automáticamente al habilitar GitHub Pages — ver [Puesta en marcha](#puesta-en-marcha))* |
| 📈 **Reporte Allure** | Publicado junto al dashboard, en `/allure` |
| 🐞 **Hallazgos de API** | [docs/03-hallazgos-api.md](docs/03-hallazgos-api.md) |
| 📋 **Módulo funcional** | [Escenarios](docs/02-modulo-funcional/escenarios.md) · [Casos de prueba](docs/02-modulo-funcional/casos-de-prueba.md) · [Bugs y consultas](docs/02-modulo-funcional/bugs.md) |

---

## Resultados

| Módulo | Entregable | Casos | Resultado |
|---|---|---|---|
| **1 · Automatización** | Smoke test de login en [saucedemo.com](https://www.saucedemo.com/) | 9 automatizados | ✅ 9 en verde |
| **2 · Funcional** | Diseño de pruebas de MakersPay | 27 diseñados | 📋 11 consultas al equipo de producto |
| **3 · API** | Pruebas funcionales de [reqres.in](https://reqres.in/api/) | 7 automatizados | ✅ 6 en verde · 🔴 1 en rojo *(defecto real, ver abajo)* |

### ⚠️ Sobre el caso en rojo — leer antes de interpretar el reporte

**El caso `API-02` falla a propósito. No es un error del código: es un defecto real de la API bajo prueba.**

El enunciado pide crear un usuario, tomar el ID devuelto y consultarlo esperando un `200`. Al ejecutarlo se detectó que:

| Paso | Petición | Respuesta |
|---|---|---|
| 1 · Crear | `POST /api/users` | `201 Created` — devuelve `id: 254` |
| 2 · Consultar | `GET /api/users/254` | `404 Not Found` — cuerpo vacío |
| Contraprueba | `GET /api/users/2` | `200 OK` — usuario existente |

La API confirma la creación con un `201 Created` pero **no guarda el usuario**. Es como cargar un cliente, recibir el mensaje *"creado con éxito, número 254"*, ir a buscarlo y que el sistema responda *"ese cliente no existe"*.

**Se decidió dejar el caso en rojo** en lugar de simular la respuesta para que pasara. Una suite en verde que oculta un defecto crítico da falsa tranquilidad, y el día que aparezca un problema real tampoco lo va a detectar.

El análisis completo, la evidencia y las tres alternativas evaluadas están en [docs/03-hallazgos-api.md](docs/03-hallazgos-api.md).

---

## Cómo ejecutar

**Requisitos:** Node.js 18 o superior.

```bash
npm install
```

| Comando | Qué hace |
|---|---|
| `npm test` | Ejecuta toda la suite |
| `npm run test:ui` | Solo el módulo 1 (login) |
| `npm run test:api` | Solo el módulo 3 (API) |
| `npm run cy:open` | Abre Cypress en modo interactivo, para ver las pruebas correr |
| `npm run allure:serve` | Genera y abre el reporte Allure en el navegador |

Para ver el reporte completo después de ejecutar:

```bash
npm run report
```

> El módulo 3 requiere conexión a internet: prueba una API pública real, sin simulaciones.

---

## Estructura del proyecto

```
├── cypress/
│   ├── e2e/ui/login.cy.js        Módulo 1 — 9 casos de login
│   ├── e2e/api/reqres.cy.js      Módulo 3 — 7 casos de API
│   ├── pages/                    Page Objects (cómo se interactúa con la app)
│   ├── fixtures/                 Datos de prueba (usuarios, mensajes esperados)
│   └── support/                  Comandos reutilizables y validación de contratos
├── docs/
│   ├── 02-modulo-funcional/      Módulo 2 — MakersPay
│   └── 03-hallazgos-api.md       Defectos encontrados en la API
├── dashboard/                    Dashboard de resultados
└── .github/workflows/ci.yml      Integración continua
```

---

## Decisiones técnicas

**Cypress + JavaScript.** De las tecnologías permitidas por el enunciado (Cypress, SerenityBDD o Selenium), es la única que cubre interfaz gráfica y API en un mismo proyecto, con una sola instalación y un solo reporte.

**Page Object Model.** Los archivos de prueba describen *qué* se valida; los Page Objects describen *cómo* se interactúa con la aplicación. Si mañana cambia el nombre de un campo, se corrige una línea en un solo archivo y las 9 pruebas siguen funcionando.

**Datos separados del código.** Ninguna credencial ni texto esperado está escrito dentro de un test: todo vive en `cypress/fixtures/`.

**Localizadores `data-test`.** Se usan los atributos que la propia aplicación expone para automatización, en lugar de clases de CSS, que cambian cada vez que alguien retoca el diseño.

**Sin esperas fijas.** No hay pausas de N segundos en ninguna prueba. Se espera por condiciones concretas, lo que evita pruebas lentas y falsos rojos.

**Un reintento, solo en modo automático.** En el servidor de integración cada prueba puede reintentarse una vez para absorber inestabilidad de red. En modo interactivo no hay reintentos, para no ocultar fallos reales durante el desarrollo.

**Integración continua.** Cada cambio en la rama `main` ejecuta la suite completa, genera el reporte Allure y republica el dashboard.

---

## Cobertura del enunciado

| Requisito | Estado |
|---|---|
| **Módulo 1** — Login exitoso con credenciales válidas | ✅ `SD-01` |
| **Módulo 1** — Login fallido con contraseña incorrecta | ✅ `SD-02` |
| **Módulo 1** — Validación de campos obligatorios | ✅ `SD-03`, `SD-04`, `SD-09` |
| *Casos adicionales de automatización* | ✅ `SD-05` a `SD-08` — usuario bloqueado, enumeración de usuarios, control de acceso por URL, enmascarado de contraseña |
| **Módulo 2** — Escenarios de prueba | ✅ [escenarios.md](docs/02-modulo-funcional/escenarios.md) |
| **Módulo 2** — Casos de prueba | ✅ 27 casos en [casos-de-prueba.md](docs/02-modulo-funcional/casos-de-prueba.md) |
| **Módulo 2** — Reporte de bugs | ✅ 11 defectos del requerimiento en [bugs.md](docs/02-modulo-funcional/bugs.md) |
| **Módulo 2** — Técnicas y tipos de prueba | ✅ 6 técnicas y 7 tipos documentados |
| **Módulo 3** — POST /users devuelve 201 | ✅ `API-01` |
| **Módulo 3** — Extraer ID y consultar GET /users/{id} | 🔴 `API-02` — *bloqueado por defecto de la API* |
| **Módulo 3** — Casos adicionales | ✅ `API-03` a `API-07` — contrato con JSON Schema, manejo de errores, validación de entrada, rendimiento |

**Cobertura de reglas de negocio de MakersPay: 6 de 6 (100%).**

---

## Puesta en marcha

Para que el dashboard y el reporte queden publicados y accesibles por link:

1. En el repositorio, ir a **Settings → Pages**
2. En **Source**, seleccionar **GitHub Actions**
3. La siguiente ejecución del workflow publica el sitio automáticamente

La URL queda disponible en la pestaña **Actions**, en el paso *Publicar dashboard y reporte*.

---

## Nota sobre el módulo 2

MakersPay es un producto ficticio descrito en el enunciado: **no existe una aplicación para ejecutar las pruebas**. Por eso el módulo funcional es un entregable de diseño y análisis.

Los bugs que se reportan son **defectos del requerimiento** — huecos verificables hoy en el texto del enunciado, como que no define qué pasa ante envíos simultáneos o si el sistema falla a mitad de una transferencia. Un requerimiento ambiguo es un defecto, y es el más barato de corregir.

No se presentan bugs inventados como si hubieran sido encontrados en ejecución. La plantilla de reporte incluye dos ejemplos, claramente identificados como simulados.
