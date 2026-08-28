# MakersPay — Reporte de bugs y consultas

> **Nota de transparencia:** MakersPay es un producto ficticio descrito en el enunciado. **No existe una aplicación para ejecutar las pruebas.** Por lo tanto este documento se divide en dos partes bien diferenciadas:
>
> - **Parte A — Defectos reales del requerimiento.** Hallazgos verificables hoy, obtenidos analizando el texto del enunciado. Son defectos genuinos: un requerimiento ambiguo es un defecto, y es el más barato de corregir.
> - **Parte B — Plantilla de reporte de bugs.** El formato que se usaría al ejecutar sobre una aplicación real, con dos ejemplos **claramente identificados como simulados**.
>
> No se presentan bugs inventados como si hubieran sido encontrados en ejecución.

---

# Parte A — Defectos del requerimiento (reales)

Encontrados analizando el requerimiento antes de escribir una sola prueba. En un proyecto real, estas consultas se resuelven con el equipo de producto **antes** de desarrollar: cada una es una decisión que, si no se toma explícitamente, la termina tomando por su cuenta quien programa.

## Severidad crítica

### RQ-04 · No se define el comportamiento ante envíos concurrentes
**Descripción:** el requerimiento dice que no se puede enviar más del saldo disponible, pero no define qué pasa si el usuario lanza dos envíos al mismo tiempo (dos dispositivos, dos pestañas).
**Riesgo:** con saldo de $100.000 y dos envíos simultáneos de $80.000, si ambos leen el saldo antes de que el otro lo descuente, los dos se aprueban y el saldo queda en **-$60.000**. Es la falla clásica de los sistemas financieros y genera dinero de la nada.
**Consulta:** ¿las transacciones se procesan con bloqueo sobre el saldo? ¿Se encolan? ¿Cuál se rechaza?
**Caso asociado:** MP-23

### RQ-10 · No se define la atomicidad de la operación
**Descripción:** la regla RN-05 lista tres efectos (descontar, acreditar, registrar en ambos historiales) pero no dice si ocurren como una única operación indivisible.
**Riesgo:** si el sistema falla después de descontarle a Ana y antes de acreditarle a Bruno, **el dinero desaparece**. Sin una definición explícita, no hay forma de probar ni de exigir la reversión.
**Consulta:** ¿la transferencia es transaccional? Si falla a mitad, ¿se revierte automáticamente o queda pendiente de conciliación manual?
**Caso asociado:** MP-27

### RQ-03 · No se define la idempotencia ante envíos duplicados
**Descripción:** no se especifica qué pasa si el usuario hace doble clic en "Enviar" o si la app reintenta por una demora de red.
**Riesgo:** transferencias duplicadas. Es una de las causas más frecuentes de reclamos en billeteras digitales reales.
**Consulta:** ¿se usa una clave de idempotencia por transacción? ¿Se bloquea el botón tras el primer clic? (bloquear el botón en la pantalla **no alcanza**: la protección tiene que estar en el servidor)
**Caso asociado:** MP-22

## Severidad alta

### RQ-01 · No se define qué pasa si el destinatario no está registrado
**Descripción:** el requerimiento dice "otro usuario registrado", pero no define el comportamiento cuando el celular ingresado no corresponde a ningún usuario.
**Riesgo:** además del hueco funcional hay un riesgo de privacidad: si el sistema responde "ese número no está registrado", cualquiera puede averiguar quién tiene cuenta en MakersPay probando números.
**Consulta:** ¿se rechaza con mensaje genérico? ¿Se ofrece invitar al contacto? ¿Qué mensaje exacto se muestra?
**Caso asociado:** MP-12

### RQ-05 · No se define un límite acumulado por período
**Descripción:** hay un máximo de $2.000.000 **por transacción**, pero nada impide hacer 50 transacciones de $2.000.000 en un minuto.
**Riesgo:** el límite por transacción, solo, no protege contra el vaciado rápido de una cuenta comprometida. Además, la mayoría de las regulaciones de dinero electrónico exigen topes diarios y mensuales.
**Consulta:** ¿existe un límite diario o mensual? ¿Por monto, por cantidad de operaciones, o ambos?

### RQ-06 · No se define el estado del destinatario
**Descripción:** no se aclara si se puede enviar dinero a un usuario bloqueado, suspendido o con la cuenta dada de baja.
**Riesgo:** dinero enviado a una cuenta que no puede usarlo, sin forma clara de recuperarlo.
**Consulta:** ¿se valida el estado del destinatario antes de acreditar?

## Severidad media

### RQ-02 · No se definen decimales ni redondeo
**Descripción:** todos los montos del requerimiento son enteros. No se aclara si se aceptan centavos.
**Riesgo:** si el sistema los acepta sin definirlo, aparecen errores de redondeo que en un sistema financiero se acumulan y descuadran la contabilidad.
**Consulta:** ¿se aceptan decimales? Si no, ¿se rechaza el monto o se redondea? ¿Hacia dónde?
**Caso asociado:** MP-17

### RQ-07 · No se define el formato válido del número de celular
**Descripción:** no se especifica longitud, prefijo, indicativo de país ni si se aceptan espacios o guiones.
**Riesgo:** sin una definición, las validaciones de la pantalla y del servidor van a diferir. Los montos son en pesos colombianos, así que el formato local (10 dígitos, comenzando en 3) parece lo esperable, pero es una suposición.
**Consulta:** ¿cuál es el formato aceptado? ¿Se admiten números internacionales?
**Caso asociado:** MP-18

### RQ-08 · No se aclara si se puede enviar el saldo completo
**Descripción:** la regla dice "no puede enviar **más** dinero del saldo disponible". Interpretado literalmente, enviar exactamente todo el saldo está permitido y deja la cuenta en cero.
**Riesgo:** si el desarrollo lo interpreta al revés, el caso del saldo exacto se rechaza sin motivo. Es exactamente el tipo de ambigüedad que produce un error en el límite.
**Consulta:** confirmar que enviar el saldo completo está permitido.
**Caso asociado:** MP-09

### RQ-09 · No se define la reversión de una transferencia
**Descripción:** no se contempla qué pasa si un usuario se equivoca de destinatario.
**Consulta:** ¿existe anulación? ¿Ventana de tiempo? ¿Requiere aprobación del receptor?

### RQ-11 · No se define la precedencia de los mensajes de error
**Descripción:** cuando fallan dos reglas a la vez (por ejemplo, monto fuera de rango **y** saldo insuficiente), no se define qué mensaje se muestra.
**Riesgo:** el usuario corrige un problema, reintenta y aparece otro error distinto. Mala experiencia y más consultas al soporte.
**Consulta:** ¿cuál es el orden de validación?

## Resumen

| Severidad | Cantidad | IDs |
|---|---|---|
| 🔴 Crítica | 3 | RQ-03, RQ-04, RQ-10 |
| 🟠 Alta | 3 | RQ-01, RQ-05, RQ-06 |
| 🟡 Media | 5 | RQ-02, RQ-07, RQ-08, RQ-09, RQ-11 |
| | **11** | |

**Las tres críticas comparten una misma raíz:** el requerimiento describe el camino feliz de la transferencia, pero no define qué pasa cuando algo se interrumpe o se solapa. En un sistema que mueve dinero, eso es justamente donde está el riesgo.

---

# Parte B — Plantilla de reporte de bugs

Formato a utilizar cuando exista una aplicación para ejecutar las pruebas.

```
ID:               BUG-XXX
Título:           [Módulo] Resumen en una línea de qué falla
Severidad:        Crítica / Alta / Media / Baja
Prioridad:        Alta / Media / Baja
Ambiente:         Navegador, versión, sistema operativo, entorno (QA/Staging)
Build:            Versión donde se detectó
Caso asociado:    MP-XX
Regla de negocio: RN-XX

Precondiciones:
  Estado del sistema y datos necesarios antes de empezar.

Pasos para reproducir:
  1. ...
  2. ...
  3. ...

Resultado esperado:
  Qué debería pasar, y de dónde sale esa expectativa (regla de negocio o consulta resuelta).

Resultado obtenido:
  Qué pasó realmente.

Evidencia:
  Captura, video, logs, petición y respuesta.

Impacto en el usuario:
  Qué consecuencia real tiene para quien usa el producto.
```

### Criterios de severidad

| Severidad | Criterio en este producto |
|---|---|
| **Crítica** | Pérdida o creación de dinero, saldos incorrectos, acceso a la cuenta de otro usuario |
| **Alta** | Una regla de negocio no se cumple, o una función principal no se puede usar |
| **Media** | Falla con alternativa disponible, o mensajes de error confusos |
| **Baja** | Cosmético, textos, alineación |

---

### Ejemplo simulado 1 — ⚠️ NO ES UN HALLAZGO REAL

> Ilustra únicamente cómo se completa la plantilla.

```
ID:               BUG-001  [EJEMPLO SIMULADO]
Título:           [Envío de dinero] El monto de $5.000 se rechaza siendo el mínimo permitido
Severidad:        Alta
Prioridad:        Alta
Caso asociado:    MP-03
Regla de negocio: RN-01

Precondiciones:
  Ana con sesión iniciada y saldo de $500.000. Bruno registrado.

Pasos para reproducir:
  1. Ingresar a "Enviar dinero"
  2. Ingresar el celular 3009876543
  3. Ingresar el monto 5000
  4. Confirmar el envío

Resultado esperado:
  Transacción exitosa. RN-01 define $5.000 como el monto mínimo permitido,
  por lo tanto ese valor está incluido.

Resultado obtenido:
  Se rechaza con el mensaje "El monto mínimo por transacción es $5.000".
  El sistema aplica "mayor que" donde corresponde "mayor o igual que".

Impacto en el usuario:
  Ningún usuario puede enviar el monto mínimo publicado. Genera desconfianza
  y consultas al soporte, porque el mensaje de error nombra el mismo valor
  que el usuario acaba de ingresar.
```

### Ejemplo simulado 2 — ⚠️ NO ES UN HALLAZGO REAL

```
ID:               BUG-002  [EJEMPLO SIMULADO]
Título:           [Envío de dinero] Una transacción rechazada descuenta el saldo del remitente
Severidad:        Crítica
Prioridad:        Alta
Caso asociado:    MP-21
Regla de negocio: RN-06

Precondiciones:
  Ana con saldo de $500.000.

Pasos para reproducir:
  1. Ingresar a "Enviar dinero"
  2. Ingresar el celular de Bruno
  3. Ingresar el monto 2500000 (supera el máximo permitido)
  4. Confirmar el envío
  5. Volver a la pantalla de inicio y consultar el saldo

Resultado esperado:
  Transacción rechazada y saldo de Ana en $500.000. RN-06 establece que
  una transacción fallida no afecta el saldo.

Resultado obtenido:
  Se muestra el mensaje de rechazo, pero el saldo de Ana queda en $2.500.000
  menos. El dinero se descontó sin acreditarse a nadie.

Impacto en el usuario:
  Pérdida directa de dinero del cliente. Requiere conciliación manual y
  compromete la confianza en el producto.
```
