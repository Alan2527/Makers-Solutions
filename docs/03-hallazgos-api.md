# Hallazgos del Módulo API — reqres.in

> **Resumen en una línea:** la API dice que guarda los usuarios, pero no los guarda.

---

## Por qué existe este documento

El enunciado de la prueba pide, para el Módulo API, hacer lo siguiente:

1. Crear un usuario (`POST /users`) y verificar que responda **201**.
2. Tomar el ID que devuelve la API.
3. Consultar ese usuario (`GET /users/{id}`) y verificar que responda **200** con el mismo nombre y puesto.

**Los pasos 1 y 2 funcionan. El paso 3 no se puede cumplir**, porque la API tiene un defecto.

Este documento explica el defecto, muestra la evidencia y justifica por qué el caso de prueba `API-02` quedó **en rojo de forma deliberada** en lugar de "arreglarlo" para que pase.

---

## HALLAZGO-API-01 — La API confirma una creación que nunca ocurrió

| Campo | Valor |
|---|---|
| **ID** | HALLAZGO-API-01 |
| **Severidad** | Crítica |
| **Prioridad** | Alta |
| **Componente** | `POST /api/users` — `GET /api/users/{id}` |
| **Detectado en** | Ejecución de la suite automatizada, caso `API-02` |
| **Estado** | Abierto |
| **Tipo** | Defecto de contrato (la API no cumple lo que promete) |

### Explicado sin tecnicismos

Imaginá que cargás un cliente nuevo en un sistema. El sistema te muestra un cartel verde: **"Cliente creado con éxito, número 254"**.

Vas a buscar al cliente 254 y el sistema te contesta: **"ese cliente no existe"**.

Eso es exactamente lo que pasa acá. La API responde con un código `201 Created`, que en la web significa literalmente *"listo, lo creé y lo podés ir a buscar"*. Pero cuando lo vas a buscar, no está.

### Por qué es grave

El código `201 Created` no es un mensaje decorativo: es una promesa formal. El estándar de HTTP (RFC 9110) define que un `201` significa que **el recurso fue creado y es accesible en la dirección indicada**.

Cualquier sistema que consuma esta API va a confiar en esa promesa. Las consecuencias reales:

- Una aplicación muestra "usuario creado" al cliente final, y el usuario no existe.
- Un proceso que crea un registro y después lo actualiza, falla en el segundo paso.
- Datos que se dan por guardados y se pierden en silencio, sin ningún error visible.

Un `201` que miente es peor que un error: **un error se ve, esto no.**

### Pasos para reproducirlo

1. Enviar una petición `POST` a `https://reqres.in/api/users` con este contenido:
   ```json
   { "name": "Test User", "job": "Automation Engineer" }
   ```
2. Anotar el `id` que devuelve la respuesta.
3. Enviar una petición `GET` a `https://reqres.in/api/users/{id}` usando ese mismo `id`.

### Resultado esperado

`200 OK`, con los datos del usuario creado en el paso 1.

### Resultado obtenido

`404 Not Found`, con el cuerpo de la respuesta vacío (`{}`).

### Evidencia

**Paso 1 — Creación (respuesta real):**

```json
{
  "name": "Test User",
  "job": "Automation Engineer",
  "id": "254",
  "createdAt": "2026-08-28T12:56:18.626Z"
}
```
`Código HTTP: 201 Created`

**Paso 3 — Consulta del usuario recién creado:**

```
GET https://reqres.in/api/users/254
Código HTTP: 404 Not Found
Cuerpo: {}
```

**Contraprueba —** el endpoint de consulta *sí funciona* con usuarios que existen de antes:

```
GET https://reqres.in/api/users/2
Código HTTP: 200 OK
Cuerpo: { "data": { "id": 2, "email": "janet.weaver@reqres.in", ... } }
```

Esto descarta que el problema esté en el endpoint de consulta o en el código de las pruebas. **El problema es que la creación no persiste el dato.**

### Verificalo vos mismo

Copiá y pegá esto en una terminal. No hace falta instalar nada más que `curl`:

```bash
curl -s -X POST https://reqres.in/api/users -H "Content-Type: application/json" -d '{"name":"Test User","job":"Automation Engineer"}'
```

Tomá el `id` que devuelve y consultalo:

```bash
curl -s -i https://reqres.in/api/users/EL_ID_QUE_TE_DEVOLVIO
```

### Causa raíz

`reqres.in` es un servicio público de **simulación** de APIs, pensado para practicar. Sus respuestas están predefinidas y no tiene base de datos detrás. Solo existen los usuarios de ejemplo con ID del 1 al 12.

Esto no invalida el hallazgo: **desde el punto de vista de quien la consume, la API se comporta de forma incorrecta**, y eso es precisamente lo que las pruebas tienen que detectar y reportar.

### Recomendación

- **Para el equipo de la API:** si el recurso no se persiste, la respuesta correcta no es `201 Created`. Debería ser `200 OK` con una aclaración, o documentar explícitamente que es un endpoint de simulación.
- **Para los equipos que la consumen:** no asumir que un `201` de esta API implica que el dato quedó guardado. Verificar siempre con una consulta posterior.

---

## HALLAZGO-API-02 — La API acepta datos vacíos sin validar

| Campo | Valor |
|---|---|
| **ID** | HALLAZGO-API-02 |
| **Severidad** | Media |
| **Prioridad** | Media |
| **Componente** | `POST /api/users` |
| **Detectado en** | Caso `API-06` |
| **Estado** | Abierto |

### Explicado sin tecnicismos

Se puede "crear un usuario" **sin mandar ningún dato**: sin nombre, sin puesto, sin nada. La API responde `201 Created` igual, como si todo estuviera bien.

### Pasos para reproducirlo

Enviar un `POST` a `/api/users` con el cuerpo vacío: `{}`

### Resultado esperado

`400 Bad Request`, indicando qué campos obligatorios faltan.

### Resultado obtenido

`201 Created`. La respuesta trae únicamente `id` y `createdAt`, sin `name` ni `job`.

### Por qué importa

Una API que no valida lo que recibe deja entrar datos incompletos al sistema. Esos registros rotos aparecen después, mucho más lejos y mucho más caros de arreglar: reportes que no cuadran, pantallas que se rompen al mostrar un campo vacío, procesos que fallan a mitad de camino.

Validar en la puerta de entrada es siempre más barato que limpiar adentro.

---

## Cómo leer los resultados de la suite automatizada

Esta es la parte importante para interpretar el reporte:

| Caso | Estado | Qué significa |
|---|---|---|
| `API-01` | 🟢 Verde | La creación responde 201 correctamente. |
| `API-02` | 🔴 **Rojo (esperado)** | **Es el defecto HALLAZGO-API-01.** Este caso representa lo que el enunciado pide y lo que la API *debería* hacer. Está en rojo porque la API está mal, no porque el código lo esté. |
| `API-03` | 🟢 Verde | Documenta el comportamiento *actual* (que el usuario no se persiste). Funciona como alarma: **si este caso se pone en rojo algún día, significa que arreglaron la API** y HALLAZGO-API-01 se puede cerrar. |
| `API-04` | 🟢 Verde | Contraprueba: consultar un usuario existente sí funciona. |
| `API-05` | 🟢 Verde | Un usuario inexistente devuelve 404, como corresponde. |
| `API-06` | 🟢 Verde | Documenta HALLAZGO-API-02 (no valida datos de entrada). |
| `API-07` | 🟢 Verde | La API responde dentro del tiempo aceptable. |

---

## Decisión de diseño: por qué `API-02` quedó en rojo

Había tres caminos posibles frente a este defecto:

| Opción | Qué implicaba | Decisión |
|---|---|---|
| **A.** Simular la respuesta para que el caso pase | Interceptar la llamada y devolver un 200 falso | ❌ **Descartada.** La suite quedaría toda en verde ocultando un defecto crítico. Es exactamente lo que una prueba nunca debe hacer. |
| **B.** Cambiar la validación a `404` y darlo por bueno | El caso pasa, pero valida un comportamiento incorrecto | ❌ **Descartada.** Convierte un defecto en el comportamiento oficial esperado, sin que nadie lo decida. |
| **C.** Dejar el caso en rojo y documentar el defecto | Se ve el problema y queda trazado | ✅ **Elegida.** |

El criterio de fondo:

> **Una suite de pruebas no está para estar en verde. Está para decir la verdad sobre el sistema.**

Un rojo explicado y documentado es información accionable. Un verde conseguido tapando el problema es una suite que da falsa tranquilidad — y el día que haya un defecto real, tampoco lo va a detectar.

Se cubrieron ambos lados de todas formas: `API-02` representa el requisito y queda en rojo; `API-03` documenta la realidad y queda en verde, avisando automáticamente si algún día la API se corrige.
