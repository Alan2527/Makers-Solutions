# MakersPay — Reporte de bugs y consultas

> **Nota de transparencia:** MakersPay es un producto ficticio descrito en el enunciado. **No existe una aplicación para ejecutar las pruebas.** Por eso este documento se divide en dos partes:
>
> - **Parte A — Defectos reales del requerimiento.** Hallazgos verificables hoy, obtenidos analizando el texto del enunciado. Un requerimiento ambiguo es un defecto, y es el más barato de corregir.
> - **Parte B — Plantilla de reporte de bugs**, con un ejemplo **claramente identificado como simulado**.
>
> No se presentan bugs inventados como si hubieran sido encontrados en ejecución.

---

# Parte A — Defectos del requerimiento

Detectados analizando el requerimiento antes de escribir una sola prueba. Cada uno es una decisión que, si no se toma explícitamente, la termina tomando por su cuenta quien programa.

## 🔴 Severidad crítica

### RQ-01 · No se define el comportamiento ante envíos concurrentes
No se define qué pasa si el usuario lanza dos envíos al mismo tiempo (dos dispositivos, dos pestañas).

**Riesgo:** con saldo de $100.000 y dos envíos simultáneos de $80.000, si ambos leen el saldo antes de que el otro lo descuente, los dos se aprueban y el saldo queda en **-$60.000**. Es la falla clásica de los sistemas financieros: genera dinero de la nada.

**Consulta:** ¿las transacciones bloquean el saldo mientras se procesan? ¿Cuál de las dos se rechaza?

### RQ-02 · No se define la atomicidad de la operación
La regla RN-05 lista tres efectos (descontar, acreditar, registrar en ambos historiales) pero no dice si ocurren como una única operación indivisible.

**Riesgo:** si el sistema falla después de descontarle a Ana y antes de acreditarle a Bruno, **el dinero desaparece**. Sin una definición explícita, no hay forma de exigir la reversión.

**Consulta:** ¿la transferencia es transaccional? Si falla a mitad, ¿se revierte automáticamente?

### RQ-03 · No se define la idempotencia ante envíos duplicados
No se especifica qué pasa si el usuario hace doble clic en "Enviar" o si la app reintenta por una demora de red.

**Riesgo:** transferencias duplicadas. Es una de las causas más frecuentes de reclamos en billeteras digitales reales.

**Consulta:** ¿se usa una clave de idempotencia por transacción? Bloquear el botón en la pantalla **no alcanza**: la protección tiene que estar en el servidor.

## 🟠 Severidad alta

### RQ-04 · No se define qué pasa si el destinatario no está registrado
El requerimiento dice "otro usuario registrado", pero no define el comportamiento cuando el celular ingresado no corresponde a ningún usuario.

**Riesgo:** además del hueco funcional hay un riesgo de privacidad. Si el sistema responde "ese número no está registrado", cualquiera puede averiguar quién tiene cuenta en MakersPay probando números.

**Consulta:** ¿se rechaza con un mensaje genérico? ¿Se ofrece invitar al contacto?
**Caso asociado:** MP-11

### RQ-05 · No se define un límite acumulado por período
Hay un máximo de $2.000.000 **por transacción**, pero nada impide hacer 50 transacciones de $2.000.000 seguidas.

**Riesgo:** el límite por transacción, solo, no protege contra el vaciado rápido de una cuenta comprometida. Además, la mayoría de las regulaciones de dinero electrónico exigen topes diarios y mensuales.

**Consulta:** ¿existe un límite diario o mensual? ¿Por monto, por cantidad de operaciones, o ambos?

## 🟡 Severidad media

### RQ-06 · No se definen decimales ni redondeo
Todos los montos del requerimiento son enteros. No se aclara si se aceptan centavos.

**Riesgo:** si el sistema los acepta sin definirlo, aparecen errores de redondeo que en un sistema financiero se acumulan y descuadran la contabilidad.

**Consulta:** ¿se aceptan decimales? Si no, ¿se rechaza el monto o se redondea? ¿Hacia dónde?
**Caso asociado:** MP-12

---

## Resumen

| Severidad | Cantidad | IDs |
|---|---|---|
| 🔴 Crítica | 3 | RQ-01, RQ-02, RQ-03 |
| 🟠 Alta | 2 | RQ-04, RQ-05 |
| 🟡 Media | 1 | RQ-06 |

**Las tres críticas comparten una misma raíz:** el requerimiento describe el camino feliz de la transferencia, pero no define qué pasa cuando algo se interrumpe o se solapa. En un sistema que mueve dinero, ahí está el riesgo.

---

# Parte B — Plantilla de reporte de bugs

Formato a utilizar cuando exista una aplicación para ejecutar las pruebas.

```
ID:               BUG-XXX
Título:           [Módulo] Resumen en una línea de qué falla
Severidad:        Crítica / Alta / Media / Baja
Ambiente:         Navegador, versión, sistema operativo, entorno (QA/Staging)
Caso asociado:    MP-XX
Regla de negocio: RN-XX

Precondiciones:
  Estado del sistema y datos necesarios antes de empezar.

Pasos para reproducir:
  1. ...
  2. ...

Resultado esperado:
  Qué debería pasar, y de dónde sale esa expectativa.

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

### Ejemplo — ⚠️ SIMULADO, NO ES UN HALLAZGO REAL

> Ilustra únicamente cómo se completa la plantilla.

```
ID:               BUG-001  [EJEMPLO SIMULADO]
Título:           [Envío de dinero] Una transacción rechazada descuenta el saldo del remitente
Severidad:        Crítica
Caso asociado:    MP-13
Regla de negocio: RN-06

Precondiciones:
  Ana con sesión iniciada y saldo de $500.000.

Pasos para reproducir:
  1. Ingresar a "Enviar dinero"
  2. Ingresar el celular de Bruno
  3. Ingresar el monto 2500000 (supera el máximo permitido)
  4. Confirmar el envío
  5. Volver al inicio y consultar el saldo

Resultado esperado:
  Transacción rechazada y saldo de Ana en $500.000. RN-06 establece que
  una transacción fallida no afecta el saldo.

Resultado obtenido:
  Se muestra el mensaje de rechazo, pero el saldo de Ana queda en
  $2.500.000 menos. El dinero se descontó sin acreditarse a nadie.

Impacto en el usuario:
  Pérdida directa de dinero del cliente. Requiere conciliación manual y
  compromete la confianza en el producto.
```
