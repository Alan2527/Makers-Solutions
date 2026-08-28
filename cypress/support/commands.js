/**
 * Comandos personalizados reutilizables.
 * Mantienen los archivos de prueba cortos y legibles.
 */

/**
 * Realiza el login por interfaz grafica.
 * Si un campo llega vacio, no se completa: asi se prueban los campos obligatorios.
 * @param {string} usuario
 * @param {string} password
 */
Cypress.Commands.add('loginUI', (usuario, password) => {
  cy.visit('/');
  if (usuario) cy.get('[data-test="username"]').type(usuario);
  // log:false evita que la contrasena quede escrita en el reporte
  if (password) cy.get('[data-test="password"]').type(password, { log: false });
  cy.get('[data-test="login-button"]').click();
});

/**
 * Llamada HTTP a la API bajo prueba sin fallar automaticamente ante un 4xx/5xx.
 * Necesario para poder ASSERTAR codigos de error en lugar de que el test explote.
 * @param {object} opciones - mismas opciones que cy.request
 */
Cypress.Commands.add('api', (opciones) => {
  return cy.request({
    failOnStatusCode: false,
    ...opciones,
    url: `${Cypress.env('apiBaseUrl')}${opciones.url}`,
  });
});
