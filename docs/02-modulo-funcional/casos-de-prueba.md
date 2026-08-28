# MakersPay — Casos de prueba, técnicas y cobertura

> **Qué es este documento:** la lista de pruebas a ejecutar, qué técnica justifica cada una, y la verificación de que ninguna regla de negocio quedó sin cubrir.

Los escenarios en lenguaje natural están en [escenarios.md](./escenarios.md).

---

## 1. Técnicas de prueba aplicadas

| Técnica | En qué consiste | Dónde se aplicó |
|---|---|---|
| **Partición de equivalencia** | Agrupar los valores posibles en familias que el sistema trata igual, y probar un representante de cada una | Montos y formato de celular. Probar los 2.000.000 de montos posibles es imposible: si $50.000 funciona, $60.000 también |
| **Análisis de valores límite** | Probar el valor justo debajo, justo en y justo arriba de cada frontera | Los 6 valores de monto. Un `>` escrito donde iba `>=` solo aparece probando el límite exacto |
| **Tabla de decisión** | Cruzar las combinaciones de condiciones del negocio | Sección 3 |
| **Transición de estados** | Verificar cómo evoluciona el saldo antes y después de cada operación | MP-01, MP-08, MP-13 |
| **Conjetura de errores** | Usar la experiencia para anticipar dónde suele fallar este tipo de sistema | Consultas RQ-03 y RQ-04 (doble envío y concurrencia) |

## 2. Tipos de prueba a ejecutar

| Tipo | Alcance | Prioridad |
|---|---|---|
| **Funcional** | Que las 6 reglas de negocio se cumplan | Alta |
| **Integración** | Que el descuento, la acreditación y ambos historiales queden consistentes | Alta |
| **Seguridad** | Validación de los montos también del lado del servidor | Alta |
| **Regresión** | Reejecutar la suite ante cada cambio del módulo de pagos | Alta |
| **Usabilidad** | Que los mensajes de error digan qué pasó y cómo resolverlo | Media |

---

## 3. Tabla de decisión

Condiciones: **C1** destinatario registrado · **C2** es el propio número · **C3** monto dentro de $5.000–$2.000.000 · **C4** saldo suficiente.

| Regla | C1 | C2 | C3 | C4 | Resultado esperado | Caso |
|---|---|---|---|---|---|---|
| R1 | Sí | No | Sí | Sí | ✅ Transacción exitosa | MP-01 |
| R2 | Sí | No | Sí | **No** | ❌ Saldo insuficiente | MP-09 |
| R3 | Sí | No | **No** | Sí | ❌ Monto fuera de rango | MP-02 / MP-07 |
| R4 | Sí | **Sí** | Sí | Sí | ❌ No podés enviarte a vos mismo | MP-10 |
| R5 | **No** | No | Sí | Sí | ❌ Destinatario no registrado | MP-11 |

---

## 4. Casos de prueba

**Datos base:** Ana (remitente, celular 3001234567) · Bruno (destinatario registrado, celular 3009876543, saldo $100.000).

| ID | Caso | Saldo de Ana | Acción | Resultado esperado | Técnica |
|---|---|---|---|---|---|
| **MP-01** | Envío exitoso | $500.000 | Enviar $50.000 a Bruno | Éxito · Ana $450.000 · Bruno $150.000 · movimiento en ambos historiales | Camino feliz |
| **MP-02** | Monto bajo el mínimo | $3.000.000 | Enviar $4.999 | Rechazo: "El monto mínimo es $5.000" | Valor límite |
| **MP-03** | Monto igual al mínimo | $3.000.000 | Enviar $5.000 | Éxito | Valor límite |
| **MP-04** | Monto sobre el mínimo | $3.000.000 | Enviar $5.001 | Éxito | Valor límite |
| **MP-05** | Monto bajo el máximo | $3.000.000 | Enviar $1.999.999 | Éxito | Valor límite |
| **MP-06** | Monto igual al máximo | $3.000.000 | Enviar $2.000.000 | Éxito | Valor límite |
| **MP-07** | Monto sobre el máximo | $3.000.000 | Enviar $2.000.001 | Rechazo: "El monto máximo es $2.000.000" | Valor límite |
| **MP-08** | Monto igual al saldo | $100.000 | Enviar $100.000 | Éxito · saldo final $0 | Valor límite |
| **MP-09** | Monto mayor al saldo | $100.000 | Enviar $100.001 | Rechazo: "Saldo insuficiente" · saldo intacto | Valor límite |
| **MP-10** | Envío al propio número | $500.000 | Enviar $50.000 a 3001234567 | Rechazo · saldo intacto | Tabla de decisión |
| **MP-11** | Destinatario no registrado | $500.000 | Enviar $50.000 a 3007777777 | Rechazo · saldo intacto | Tabla de decisión |
| **MP-12** | Montos inválidos | $500.000 | Enviar `0`, `-50000`, `abc` o el campo vacío | Rechazo antes de procesar · saldo intacto | Partición de equivalencia |
| **MP-13** | Integridad tras un rechazo | $500.000 | Provocar cualquier rechazo | Ambos saldos intactos · sin movimientos en el historial | Transición de estados |
| **MP-14** | Contenido del historial | — | Consultar ambos historiales tras un envío exitoso | Tipo, monto, contraparte, fecha y estado correctos, con sentido opuesto en cada uno | Funcional |

**14 casos.** MP-13 se verifica además al final de cada caso de rechazo: que el sistema muestre el mensaje de error no alcanza, hay que confirmar que no tocó la plata ni el historial.

---

## 5. Matriz de cobertura

| Regla | Descripción | Casos que la cubren | Cobertura |
|---|---|---|---|
| **RN-01** | Monto mínimo $5.000 | MP-02, MP-03, MP-04 | ✅ Completa (3 valores límite) |
| **RN-02** | Monto máximo $2.000.000 | MP-05, MP-06, MP-07 | ✅ Completa (3 valores límite) |
| **RN-03** | No superar el saldo | MP-08, MP-09 | ✅ Completa |
| **RN-04** | No envío al propio número | MP-10 | ✅ Completa |
| **RN-05** | Efectos de una transacción exitosa | MP-01, MP-14 | ✅ Completa (saldos + ambos historiales) |
| **RN-06** | Un rechazo no afecta saldos | MP-09, MP-12, MP-13 | ✅ Completa |

**Cobertura de reglas de negocio: 6 de 6 (100%).**

MP-11 y MP-12 no derivan de ninguna regla escrita: cubren huecos del requerimiento, documentados como consultas en [bugs.md](./bugs.md).

---

## 6. Priorización para la ejecución

Si hubiera que ejecutar solo una parte por falta de tiempo:

1. **MP-01** — si el camino feliz no funciona, no tiene sentido seguir
2. **MP-09, MP-13** — todo lo que pueda hacer aparecer o desaparecer dinero
3. **MP-03, MP-06, MP-02, MP-07** — los límites exactos del monto
4. El resto
