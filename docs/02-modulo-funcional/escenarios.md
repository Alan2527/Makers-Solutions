# MakersPay — Escenarios de prueba

> **Qué es este documento:** la descripción, en lenguaje común, de todas las situaciones que hay que probar sobre la función "enviar dinero". Está escrito para que cualquier persona del equipo —técnica o no— pueda leerlo y decir "sí, eso es lo que tiene que pasar" o "no, acá falta algo".

---

## El requerimiento que se está probando

> Un usuario autenticado puede enviar dinero a otro usuario registrado usando su número de celular.

### Reglas de negocio definidas

| ID | Regla |
|---|---|
| **RN-01** | El monto mínimo por transacción es **$5.000 COP** |
| **RN-02** | El monto máximo por transacción es **$2.000.000 COP** |
| **RN-03** | El usuario no puede enviar más dinero del saldo disponible |
| **RN-04** | No se permiten envíos al mismo número de celular del remitente |
| **RN-05** | Si la transacción es exitosa: se descuenta el saldo del remitente, se incrementa el del destinatario y se registra el movimiento en el historial de **ambos** |
| **RN-06** | Si la transacción falla: se muestra un mensaje de error claro y **no se afecta el saldo** |

---

## Formato usado

Los escenarios están escritos en **Gherkin** (Dado / Cuando / Entonces), el formato estándar de la industria:

- **Dado** — la situación de partida
- **Cuando** — la acción que hace el usuario
- **Entonces** — lo que el sistema tiene que responder

---

## 1. Camino feliz

```gherkin
Característica: Envío de dinero entre usuarios de MakersPay

Escenario: Envío exitoso con monto válido y saldo suficiente
  Dado que Ana inició sesión en MakersPay
    Y su saldo disponible es $500.000
    Y Bruno está registrado con el celular 3009876543
    Y el saldo de Bruno es $100.000
  Cuando Ana envía $50.000 al celular 3009876543
  Entonces el sistema confirma la transacción como exitosa
    Y el saldo de Ana pasa a ser $450.000
    Y el saldo de Bruno pasa a ser $150.000
    Y el historial de Ana registra un envío de $50.000 a Bruno
    Y el historial de Bruno registra una recepción de $50.000 de Ana
```

> **Por qué se validan las cuatro consecuencias y no solo el mensaje de éxito:** un cartel de "transacción exitosa" no prueba nada por sí solo. Lo que importa es que el dinero efectivamente se movió y quedó registrado en ambos lados. Un sistema que descuenta pero no acredita también muestra "éxito".

---

## 2. Límites del monto (RN-01 y RN-02)

Se prueban los valores **justo debajo, justo en, y justo arriba** de cada límite. Los errores de programación se concentran en las fronteras: un `>` escrito donde iba un `>=` solo se detecta probando el valor exacto del límite.

```gherkin
Esquema del escenario: Validación de los límites de monto permitido
  Dado que Ana inició sesión en MakersPay
    Y su saldo disponible es $3.000.000
    Y Bruno está registrado con el celular 3009876543
  Cuando Ana envía <monto> al celular 3009876543
  Entonces el sistema responde con <resultado>
    Y muestra el mensaje "<mensaje>"

  Ejemplos:
    | monto      | resultado | mensaje                                          |
    | $4.999     | rechazo   | El monto mínimo por transacción es $5.000         |
    | $5.000     | éxito     | Transacción exitosa                              |
    | $5.001     | éxito     | Transacción exitosa                              |
    | $1.999.999 | éxito     | Transacción exitosa                              |
    | $2.000.000 | éxito     | Transacción exitosa                              |
    | $2.000.001 | rechazo   | El monto máximo por transacción es $2.000.000    |
```

**En castellano:** $5.000 y $2.000.000 **sí** se pueden enviar (son los límites incluidos). $4.999 y $2.000.001 **no**.

---

## 3. Saldo insuficiente (RN-03)

```gherkin
Esquema del escenario: El envío no puede superar el saldo disponible
  Dado que Ana inició sesión en MakersPay
    Y su saldo disponible es $100.000
    Y Bruno está registrado con el celular 3009876543
  Cuando Ana envía <monto> al celular 3009876543
  Entonces el sistema responde con <resultado>
    Y el saldo de Ana queda en <saldo final>

  Ejemplos:
    | monto    | resultado | saldo final |
    | $99.999  | éxito     | $1          |
    | $100.000 | éxito     | $0          |
    | $100.001 | rechazo   | $100.000    |
```

```gherkin
Escenario: Un usuario sin saldo no puede enviar dinero
  Dado que Ana inició sesión en MakersPay
    Y su saldo disponible es $0
  Cuando Ana intenta enviar $5.000 al celular 3009876543
  Entonces el sistema rechaza la transacción
    Y muestra el mensaje "Saldo insuficiente"
    Y el saldo de Ana permanece en $0
```

> **Nota sobre el caso "$100.000":** la regla dice *"no puede enviar más dinero del saldo disponible"*. Enviar exactamente todo el saldo no es "más", así que debe permitirse y dejar el saldo en cero. Este caso está marcado para confirmación con el equipo de producto (ver [consultas](./bugs.md)).

---

## 4. Envío al propio número (RN-04)

```gherkin
Escenario: Un usuario no puede enviarse dinero a sí mismo
  Dado que Ana inició sesión en MakersPay
    Y su número de celular registrado es 3001234567
    Y su saldo disponible es $500.000
  Cuando Ana intenta enviar $50.000 al celular 3001234567
  Entonces el sistema rechaza la transacción
    Y muestra el mensaje "No podés enviarte dinero a vos mismo"
    Y el saldo de Ana permanece en $500.000
```

> **Por qué importa aunque parezca inofensivo:** si el sistema lo permitiera y ejecutara el descuento y la acreditación como dos pasos separados, un error entre ambos podría hacer que el usuario pierda el dinero o lo duplique. Además ensucia el historial con movimientos sin sentido.

---

## 5. Destinatario inválido

```gherkin
Escenario: Envío a un celular que no está registrado
  Dado que Ana inició sesión en MakersPay
    Y su saldo disponible es $500.000
    Y el celular 3007777777 NO está registrado en MakersPay
  Cuando Ana intenta enviar $50.000 al celular 3007777777
  Entonces el sistema rechaza la transacción
    Y muestra un mensaje indicando que el destinatario no existe
    Y el saldo de Ana permanece en $500.000
```

> ⚠️ **Comportamiento no definido en el requerimiento.** El requerimiento dice "otro usuario registrado" pero no especifica qué debe pasar si no lo está. Ver consulta **RQ-04**.

```gherkin
Esquema del escenario: Validación del formato del número de celular
  Dado que Ana inició sesión en MakersPay
    Y su saldo disponible es $500.000
  Cuando Ana intenta enviar $50.000 al celular "<celular>"
  Entonces el sistema rechaza la transacción antes de procesarla
    Y muestra el mensaje "Número de celular inválido"

  Ejemplos:
    | celular      | descripción              |
    |              | campo vacío              |
    | 300123456    | menos dígitos de los     |
    | 30012345678  | más dígitos de los       |
    | 300ABC4567   | contiene letras          |
    | 300-123-4567 | contiene separadores     |
```

---

## 6. Validación del campo monto

```gherkin
Esquema del escenario: Valores no válidos en el campo monto
  Dado que Ana inició sesión en MakersPay
    Y su saldo disponible es $500.000
    Y Bruno está registrado con el celular 3009876543
  Cuando Ana intenta enviar "<monto>" al celular 3009876543
  Entonces el sistema rechaza la transacción antes de procesarla
    Y el saldo de Ana permanece en $500.000

  Ejemplos:
    | monto    | descripción                    |
    |          | campo vacío                    |
    | 0        | cero                           |
    | -50000   | monto negativo                 |
    | abc      | texto en lugar de número       |
    | 50.000,5 | monto con decimales            |
```

> ⚠️ **El caso de decimales no está definido** en el requerimiento. Ver consulta **RQ-06**.

---

## 7. Integridad del saldo (RN-06)

```gherkin
Escenario: Una transacción fallida no altera ningún saldo
  Dado que Ana inició sesión en MakersPay
    Y su saldo disponible es $500.000
    Y el saldo de Bruno es $100.000
  Cuando Ana intenta enviar $2.000.001 al celular de Bruno
  Entonces el sistema rechaza la transacción
    Y el saldo de Ana sigue siendo $500.000
    Y el saldo de Bruno sigue siendo $100.000
    Y no se registra ningún movimiento en el historial de Ana
    Y no se registra ningún movimiento en el historial de Bruno
```

> **Este escenario se repite después de cada caso de rechazo.** Verificar que el sistema muestre el mensaje de error no alcanza: hay que confirmar que además no tocó la plata ni el historial.

---

## 8. Historial de movimientos (RN-05)

```gherkin
Escenario: El movimiento queda correctamente registrado en ambos historiales
  Dado que Ana envió exitosamente $75.000 a Bruno
  Entonces el historial de Ana muestra el movimiento con:
    | campo       | valor esperado         |
    | tipo        | Envío                  |
    | monto       | $75.000                |
    | contraparte | Bruno (3009876543)     |
    | fecha       | fecha y hora del envío |
    | estado      | Exitosa                |
  Y el historial de Bruno muestra el mismo movimiento con:
    | campo       | valor esperado         |
    | tipo        | Recepción              |
    | monto       | $75.000                |
    | contraparte | Ana (3001234567)       |
    | fecha       | la misma fecha y hora  |
    | estado      | Exitosa                |
```

---

## Resumen de cobertura

| Regla de negocio | Escenarios que la cubren |
|---|---|
| RN-01 — Monto mínimo $5.000 | Sección 2 (3 escenarios de límite) |
| RN-02 — Monto máximo $2.000.000 | Sección 2 (3 escenarios de límite) |
| RN-03 — No superar el saldo | Sección 3 (4 escenarios) |
| RN-04 — No envío a sí mismo | Sección 4 |
| RN-05 — Efectos de una transacción exitosa | Secciones 1 y 8 |
| RN-06 — Una transacción fallida no afecta saldos | Sección 7 (+ verificación en cada rechazo) |

**Las 6 reglas de negocio están cubiertas.** El detalle caso por caso está en [casos-de-prueba.md](./casos-de-prueba.md) y la trazabilidad completa en [matriz-cobertura.md](./matriz-cobertura.md).
