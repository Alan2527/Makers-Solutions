import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Valida que una respuesta de la API cumpla el contrato esperado.
 *
 * Por que importa: un test que solo mira el codigo 200 pasa aunque la API
 * devuelva basura. Validar el contrato detecta cambios silenciosos, como que
 * un campo cambie de nombre o de tipo, antes de que rompan al consumidor.
 *
 * @param {object} schema - contrato esperado (JSON Schema)
 * @param {object} datos  - cuerpo de la respuesta recibida
 */
export function validarSchema(schema, datos) {
  const validar = ajv.compile(schema);
  const esValido = validar(datos);

  const errores = (validar.errors || [])
    .map((e) => `  - "${e.instancePath || 'raiz'}" ${e.message}`)
    .join('\n');

  expect(
    esValido,
    esValido
      ? 'La respuesta cumple el contrato esperado'
      : `La respuesta NO cumple el contrato esperado:\n${errores}`
  ).to.be.true;
}

/** Contrato de la respuesta de POST /users (creacion) */
export const schemaUsuarioCreado = {
  type: 'object',
  required: ['name', 'job', 'id', 'createdAt'],
  properties: {
    name: { type: 'string', minLength: 1 },
    job: { type: 'string', minLength: 1 },
    id: { type: ['string', 'number'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

/** Contrato de la respuesta de GET /users/{id} (consulta) */
export const schemaUsuarioConsultado = {
  type: 'object',
  required: ['data'],
  properties: {
    data: {
      type: 'object',
      required: ['id', 'email', 'first_name', 'last_name', 'avatar'],
      properties: {
        id: { type: 'number' },
        email: { type: 'string', format: 'email' },
        first_name: { type: 'string', minLength: 1 },
        last_name: { type: 'string', minLength: 1 },
        avatar: { type: 'string', format: 'uri' },
      },
    },
  },
};
