import * as allure from 'allure-cypress';
import {
  validarSchema,
  schemaUsuarioCreado,
  schemaUsuarioConsultado,
} from '../../support/validarSchema';

/**
 * MODULO 3 - PRUEBAS FUNCIONALES DE API
 * API bajo prueba: https://reqres.in/api/
 *
 * IMPORTANTE - LEER ANTES DE INTERPRETAR LOS RESULTADOS
 *
 * El caso API-02 esta EN ROJO a proposito. No es un error de este codigo:
 * es un defecto real de la API que se detecto durante las pruebas.
 * La API responde "201 Created" al crear un usuario, pero despues ese
 * usuario no existe: consultarlo devuelve "404 No encontrado".
 *
 * El detalle completo del hallazgo esta en: docs/03-hallazgos-api.md
 */

const USUARIO_A_CREAR = {
  name: 'Test User',
  job: 'Automation Engineer',
};

describe('Modulo 3 | Pruebas funcionales de API (reqres.in)', () => {
  beforeEach(() => {
    allure.epic('Modulo 3 - API');
  });

  // =====================================================================
  // FLUJO PRINCIPAL SOLICITADO EN EL ENUNCIADO
  // =====================================================================
  context('Flujo solicitado en el enunciado', () => {
    it('API-01 | Crear un usuario devuelve 201 y los datos enviados', () => {
      allure.feature('Creacion de usuario');
      allure.story('POST /users');
      allure.severity('blocker');
      allure.description(
        'Envia el usuario y verifica que la API responda "201 Creado", que devuelva ' +
          'exactamente el nombre y el puesto enviados, y que asigne un identificador ' +
          'y una fecha de creacion validos.'
      );

      cy.api({
        method: 'POST',
        url: '/users',
        body: USUARIO_A_CREAR,
      }).then((respuesta) => {
        expect(respuesta.status, 'Codigo de estado HTTP').to.eq(201);
        expect(respuesta.body.name, 'Nombre devuelto').to.eq(USUARIO_A_CREAR.name);
        expect(respuesta.body.job, 'Puesto devuelto').to.eq(USUARIO_A_CREAR.job);
        expect(respuesta.body.id, 'Identificador asignado').to.exist;
        expect(respuesta.body.createdAt, 'Fecha de creacion').to.exist;

        validarSchema(schemaUsuarioCreado, respuesta.body);

        allure.attachment(
          'Respuesta de la creacion',
          JSON.stringify(respuesta.body, null, 2),
          'application/json'
        );
      });
    });

    it('API-02 | Consultar el usuario recien creado devuelve 200 con sus datos', () => {
      allure.feature('Consulta de usuario');
      allure.story('GET /users/{id}');
      allure.severity('blocker');
      allure.tag('HALLAZGO-API-01');
      allure.description(
        'ESTE CASO FALLA POR UN DEFECTO DE LA API, NO POR UN ERROR DEL CODIGO.\n\n' +
          'El enunciado pide: crear un usuario, tomar el ID devuelto y consultarlo ' +
          'esperando un 200 con el mismo nombre y puesto.\n\n' +
          'Comportamiento real detectado: la API confirma la creacion con un 201 pero ' +
          'no guarda el usuario. Al consultarlo responde 404 con el cuerpo vacio.\n\n' +
          'Ver docs/03-hallazgos-api.md'
      );

      // Paso 1: crear el usuario y quedarse con el ID que devuelve la API
      cy.api({
        method: 'POST',
        url: '/users',
        body: USUARIO_A_CREAR,
      }).then((creacion) => {
        expect(creacion.status, 'La creacion debe responder 201').to.eq(201);
        const idCreado = creacion.body.id;

        allure.attachment(
          'Paso 1 - Usuario creado',
          JSON.stringify(creacion.body, null, 2),
          'application/json'
        );

        // Paso 2: consultar ese mismo usuario por su ID
        cy.api({ method: 'GET', url: `/users/${idCreado}` }).then((consulta) => {
          allure.attachment(
            'Paso 2 - Consulta del usuario creado',
            JSON.stringify(
              {
                url: `/users/${idCreado}`,
                statusRecibido: consulta.status,
                bodyRecibido: consulta.body,
              },
              null,
              2
            ),
            'application/json'
          );

          expect(
            consulta.status,
            `DEFECTO DETECTADO: se creo el usuario con ID ${idCreado} y la API respondio ` +
              `201 Creado, pero al consultarlo devuelve ${consulta.status}. ` +
              `El recurso nunca se persistio. Ver docs/03-hallazgos-api.md`
          ).to.eq(200);

          expect(consulta.body.data.first_name).to.eq(USUARIO_A_CREAR.name);
          expect(consulta.body.data.job).to.eq(USUARIO_A_CREAR.job);
        });
      });
    });
  });

  // =====================================================================
  // EVIDENCIA DEL DEFECTO Y CASOS ADICIONALES
  // =====================================================================
  context('Casos adicionales', () => {
    it('API-03 | Se documenta el comportamiento real: el usuario creado no se persiste', () => {
      allure.feature('Creacion de usuario');
      allure.story('Evidencia del defecto');
      allure.severity('critical');
      allure.tag('HALLAZGO-API-01');
      allure.description(
        'Contracara del caso API-02. Este caso NO valida lo que la API deberia hacer, ' +
          'sino lo que hace hoy: confirma que el usuario creado no queda guardado. ' +
          'Sirve como alerta: si algun dia este caso empieza a fallar, significa que ' +
          'la API se corrigio y el defecto HALLAZGO-API-01 puede cerrarse.'
      );

      cy.api({ method: 'POST', url: '/users', body: USUARIO_A_CREAR }).then((creacion) => {
        const idCreado = creacion.body.id;

        cy.api({ method: 'GET', url: `/users/${idCreado}` }).then((consulta) => {
          expect(creacion.status, 'La API confirma la creacion').to.eq(201);
          expect(
            consulta.status,
            'Comportamiento actual: el recurso creado no existe'
          ).to.eq(404);
          expect(consulta.body, 'La respuesta llega sin contenido').to.deep.eq({});
        });
      });
    });

    it('API-04 | Consultar un usuario preexistente devuelve 200 y respeta el contrato', () => {
      allure.feature('Consulta de usuario');
      allure.story('GET /users/{id}');
      allure.severity('critical');
      allure.description(
        'Prueba de contrato sobre un usuario que si existe en la API. Demuestra que el ' +
          'endpoint de consulta funciona correctamente y que el rojo del caso API-02 ' +
          'proviene de la falta de persistencia, no del endpoint de consulta.'
      );

      cy.api({ method: 'GET', url: '/users/2' }).then((respuesta) => {
        expect(respuesta.status, 'Codigo de estado HTTP').to.eq(200);
        validarSchema(schemaUsuarioConsultado, respuesta.body);
        expect(respuesta.body.data.id).to.eq(2);
      });
    });

    it('API-05 | Consultar un usuario inexistente devuelve 404', () => {
      allure.feature('Consulta de usuario');
      allure.story('Manejo de errores');
      allure.severity('normal');
      allure.description(
        'Verifica que la API responde correctamente cuando se pide un usuario que no existe, ' +
          'en lugar de devolver un error de servidor.'
      );

      cy.api({ method: 'GET', url: '/users/23' }).then((respuesta) => {
        expect(respuesta.status).to.eq(404);
      });
    });

    it('API-06 | Crear un usuario con el cuerpo vacio tambien devuelve 201', () => {
      allure.feature('Creacion de usuario');
      allure.story('Validacion de datos de entrada');
      allure.severity('normal');
      allure.tag('HALLAZGO-API-02');
      allure.description(
        'Riesgo cubierto: que la API acepte datos incompletos sin avisar. ' +
          'Se envia una peticion sin ningun dato. La API responde 201 igual, sin validar ' +
          'los campos obligatorios. Se documenta como HALLAZGO-API-02.'
      );

      cy.api({ method: 'POST', url: '/users', body: {} }).then((respuesta) => {
        expect(
          respuesta.status,
          'Comportamiento actual: la API no valida los campos obligatorios'
        ).to.eq(201);
        expect(respuesta.body.name, 'No se devuelve nombre').to.be.undefined;

        allure.attachment(
          'Respuesta al enviar datos vacios',
          JSON.stringify(respuesta.body, null, 2),
          'application/json'
        );
      });
    });

    it('API-07 | La API responde en menos de 3 segundos', () => {
      allure.feature('Rendimiento');
      allure.story('Tiempo de respuesta');
      allure.severity('minor');
      allure.description(
        'Prueba de rendimiento basica. Verifica que el tiempo de respuesta se mantenga ' +
          'dentro de un umbral aceptable para el usuario final.'
      );

      cy.api({ method: 'GET', url: '/users?page=2' }).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
        expect(respuesta.duration, 'Tiempo de respuesta en milisegundos').to.be.lessThan(3000);
      });
    });
  });
});
