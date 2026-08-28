# MakersPay — Casos de prueba, técnicas y cobertura

> **Qué es este documento:** la lista concreta de pruebas a ejecutar, qué técnica justifica cada una, y la verificación de que ninguna regla de negocio quedó sin cubrir.

Los escenarios en lenguaje natural están en [escenarios.md](./escenarios.md).

---

## 1. Técnicas de prueba aplicadas

| Técnica | En qué consiste | Dónde se aplicó | Por qué |
|---|---|---|---|
| **Partición de equivalencia** | Agrupar los valores posibles en familias que el sistema trata igual, y probar un representante de cada una | Montos, formato de celular | Probar los 2.000.000 de montos posibles es imposible. Si $50.000 funciona, $60.000 también: son la misma familia |
| **Análisis de valores límite** | Probar el valor justo debajo, justo en, y justo arriba de cada frontera | $4.999 / $5.000 / $5.001 y $1.999.999 / $2.000.000 / $2.000.001 | Los errores se concentran en las fronteras. Un `>` escrito donde iba `>=` solo aparece probando el límite exacto |
| **Tabla de decisión** | Cruzar todas las combinaciones de condiciones del negocio | Sección 3 | Las reglas se combinan entre sí. Garantiza que ninguna combinación quede sin probar |
| **Transición de estados** | Verificar cómo evoluciona el saldo antes y después de cada operación | MP-01, MP-09, MP-21 | El saldo es un estado que se modifica: importa el valor final, no solo el mensaje |
| **Conjetura de errores** | Usar la experiencia para anticipar dónde suele fallar este tipo de sistema | MP-22 a MP-26 | Doble clic, concurrencia y atomicidad no están en el requerimiento, pero son las fallas típicas de una billetera |
| **Pruebas basadas en riesgo** | Priorizar según impacto y probabilidad | Priorización de toda la suite | Con tiempo limitado, primero lo que puede hacer perder dinero |

## 2. Tipos de prueba a ejecutar

| Tipo | Alcance en este módulo | Prioridad |
|---|---|---|
| **Funcional** | Que las 6 reglas de negocio se cumplan | Alta |
| **Integración** | Que el descuento, la acreditación y ambos historiales se actualicen de forma consistente | Alta |
| **Seguridad** | Validación en servidor, sesión expirada, manipulación del monto | Alta |
| **Regresión** | Reejecutar la suite ante cada cambio del módulo de pagos | Alta |
| **Usabilidad** | Que los mensajes de error digan qué pasó y cómo resolverlo | Media |
| **Rendimiento** | Comportamiento con múltiples transacciones simultáneas | Media |
| **Compatibilidad** | Navegadores y resoluciones móviles | Baja |

---

## 3. Tabla de decisión

Condiciones evaluadas: **C1** destinatario registrado · **C2** es el propio número · **C3** monto dentro de $5.000–$2.000.000 · **C4** saldo suficiente.

| Regla | C1 | C2 | C3 | C4 | Resultado esperado | Caso |
|---|---|---|---|---|---|---|
| R1 | Sí | No | Sí | Sí | ✅ Transacción exitosa | MP-01 |
| R2 | Sí | No | Sí | **No** | ❌ Saldo insuficiente | MP-10 |
| R3 | Sí | No | **No** | Sí | ❌ Monto fuera de rango | MP-02 / MP-07 |
| R4 | Sí | No | **No** | **No** | ❌ Monto fuera de rango (se valida primero) | MP-13 |
| R5 | Sí | **Sí** | Sí | Sí | ❌ No podés enviarte a vos mismo | MP-11 |
| R6 | **No** | No | Sí | Sí | ❌ Destinatario no registrado | MP-12 |

> **R4 define un orden de precedencia** que el requerimiento no especifica: cuando fallan dos reglas a la vez, ¿cuál mensaje se muestra? Ver consulta **RQ-11**.

---

## 4. Casos de prueba

**Datos base:** Ana (remitente, celular 3001234567, saldo $500.000) · Bruno (destinatario registrado, celular 3009876543, saldo $100.000).

| ID | Caso | Precondición | Acción | Resultado esperado | Técnica | Prior. |
|---|---|---|---|---|---|---|
| **MP-01** | Envío exitoso | Saldo $500.000 | Enviar $50.000 a Bruno | Éxito · Ana $450.000 · Bruno $150.000 · movimiento en ambos historiales | Camino feliz + transición de estados | 🔴 Alta |
| **MP-02** | Monto bajo el mínimo | Saldo $3.000.000 | Enviar $4.999 | Rechazo: "El monto mínimo es $5.000" | Valor límite | 🔴 Alta |
| **MP-03** | Monto igual al mínimo | Saldo $3.000.000 | Enviar $5.000 | Éxito | Valor límite | 🔴 Alta |
| **MP-04** | Monto sobre el mínimo | Saldo $3.000.000 | Enviar $5.001 | Éxito | Valor límite | 🟡 Media |
| **MP-05** | Monto bajo el máximo | Saldo $3.000.000 | Enviar $1.999.999 | Éxito | Valor límite | 🟡 Media |
| **MP-06** | Monto igual al máximo | Saldo $3.000.000 | Enviar $2.000.000 | Éxito | Valor límite | 🔴 Alta |
| **MP-07** | Monto sobre el máximo | Saldo $3.000.000 | Enviar $2.000.001 | Rechazo: "El monto máximo es $2.000.000" | Valor límite | 🔴 Alta |
| **MP-08** | Monto menor al saldo | Saldo $100.000 | Enviar $99.999 | Éxito · saldo final $1 | Valor límite | 🟡 Media |
| **MP-09** | Monto igual al saldo | Saldo $100.000 | Enviar $100.000 | Éxito · saldo final $0 | Valor límite | 🔴 Alta |
| **MP-10** | Monto mayor al saldo | Saldo $100.000 | Enviar $100.001 | Rechazo · saldo intacto | Valor límite | 🔴 Alta |
| **MP-11** | Envío al propio número | Saldo $500.000 | Enviar $50.000 a 3001234567 | Rechazo · saldo intacto | Tabla de decisión | 🔴 Alta |
| **MP-12** | Destinatario no registrado | Saldo $500.000 | Enviar $50.000 a 3007777777 | Rechazo · saldo intacto | Tabla de decisión | 🔴 Alta |
| **MP-13** | Usuario sin saldo | Saldo $0 | Enviar $5.000 | Rechazo: "Saldo insuficiente" | Partición de equivalencia | 🔴 Alta |
| **MP-14** | Monto en cero | Saldo $500.000 | Enviar $0 | Rechazo | Partición de equivalencia | 🟡 Media |
| **MP-15** | Monto negativo | Saldo $500.000 | Enviar -$50.000 | Rechazo · saldo intacto | Partición de equivalencia | 🔴 Alta |
| **MP-16** | Monto no numérico | Saldo $500.000 | Enviar "abc" | Rechazo antes de procesar | Partición de equivalencia | 🟡 Media |
| **MP-17** | Monto con decimales | Saldo $500.000 | Enviar $50.000,50 | ⚠️ No definido (RQ-02) | Partición de equivalencia | 🟡 Media |
| **MP-18** | Celular con formato inválido | Saldo $500.000 | Enviar a "300ABC4567" | Rechazo: "Número inválido" | Partición de equivalencia | 🟡 Media |
| **MP-19** | Celular vacío | Saldo $500.000 | Enviar sin destinatario | Rechazo · campo obligatorio | Partición de equivalencia | 🟡 Media |
| **MP-20** | Monto vacío | Saldo $500.000 | Enviar sin monto | Rechazo · campo obligatorio | Partición de equivalencia | 🟡 Media |
| **MP-21** | Integridad tras un rechazo | Saldo $500.000 | Provocar cualquier rechazo | Ambos saldos intactos · sin movimientos en historial | Transición de estados | 🔴 Alta |
| **MP-22** | Doble clic en Enviar | Saldo $500.000 | Doble clic con $50.000 | ⚠️ Una sola transacción (RQ-03) | Conjetura de errores | 🔴 Alta |
| **MP-23** | Envíos concurrentes | Saldo $100.000 | Dos envíos de $80.000 simultáneos | ⚠️ Uno pasa, otro se rechaza · nunca saldo negativo (RQ-04) | Conjetura de errores | 🔴 Alta |
| **MP-24** | Contenido del historial | Envío exitoso previo | Consultar ambos historiales | Tipo, monto, contraparte, fecha y estado correctos y con sentido opuesto | Funcional | 🟡 Media |
| **MP-25** | Sesión expirada | Sesión vencida | Confirmar envío | Redirige al login · no ejecuta · saldo intacto | Seguridad | 🔴 Alta |
| **MP-26** | Validación en servidor | — | Manipular la petición con $5.000.000 | El servidor rechaza | Seguridad | 🔴 Alta |
| **MP-27** | Atomicidad ante falla | — | Interrumpir entre descuento y acreditación | Reversión completa (RQ-10) | Conjetura de errores | 🔴 Alta |

**Totales:** 27 casos · 16 de prioridad alta · 6 marcados ⚠️ por comportamiento no definido en el requerimiento.

---

## 5. Matriz de cobertura

Verificación de que ninguna regla quedó sin probar:

| Regla | Descripción | Casos que la cubren | Cobertura |
|---|---|---|---|
| **RN-01** | Monto mínimo $5.000 | MP-02, MP-03, MP-04 | ✅ Completa (3 valores límite) |
| **RN-02** | Monto máximo $2.000.000 | MP-05, MP-06, MP-07 | ✅ Completa (3 valores límite) |
| **RN-03** | No superar el saldo | MP-08, MP-09, MP-10, MP-13, MP-23 | ✅ Completa |
| **RN-04** | No envío al propio número | MP-11 | ✅ Completa |
| **RN-05** | Efectos de una transacción exitosa | MP-01, MP-24, MP-27 | ✅ Completa (saldos + ambos historiales) |
| **RN-06** | Un rechazo no afecta saldos | MP-10, MP-15, MP-21, MP-25 | ✅ Completa |

**Cobertura de reglas de negocio: 6 de 6 (100%).**

Los casos MP-12, MP-14 a MP-20, MP-22, MP-25 y MP-26 **no derivan de ninguna regla escrita**: cubren huecos del requerimiento y riesgos de seguridad detectados en el análisis. Están documentados como consultas en [bugs.md](./bugs.md).

---

## 6. Priorización sugerida para la ejecución

Si hubiera que ejecutar solo una parte por falta de tiempo, este es el orden:

1. **MP-01** — si el camino feliz no funciona, no tiene sentido seguir
2. **MP-10, MP-13, MP-23** — todo lo que pueda generar dinero de la nada
3. **MP-03, MP-06, MP-07, MP-02** — los límites exactos del monto
4. **MP-21, MP-27** — integridad del saldo ante fallas
5. **MP-25, MP-26** — seguridad
6. El resto
