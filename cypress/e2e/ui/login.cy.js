import * as allure from 'allure-cypress';
import LoginPage from '../../pages/LoginPage';
import InventoryPage from '../../pages/InventoryPage';

/**
 * MODULO 1 - SMOKE TEST DE INICIO DE SESION
 * Aplicacion bajo prueba: https://www.saucedemo.com/
 *
 * Un "smoke test" responde una sola pregunta: la funcionalidad critica
 * del sistema, funciona? Si el login esta roto, no tiene sentido probar
 * nada mas. Por eso este conjunto es corto, rapido y se ejecuta primero.
 */
describe('Modulo 1 | Smoke Test de Inicio de Sesion', () => {
  let usuarios;
  let mensajes;

  before(() => {
    cy.fixture('usuarios').then((datos) => (usuarios = datos));
    cy.fixture('mensajes').then((datos) => (mensajes = datos));
  });

  beforeEach(() => {
    allure.epic('Modulo 1 - Automatizacion');
    allure.feature('Inicio de sesion');
  });

  // =====================================================================
  // CASOS OBLIGATORIOS SOLICITADOS EN EL ENUNCIADO
  // =====================================================================
  context('Casos obligatorios del enunciado', () => {
    it('SD-01 | Un usuario valido puede iniciar sesion y accede al catalogo', () => {
      allure.story('Login exitoso con credenciales validas');
      allure.severity('blocker');
      allure.description(
        'Verifica el camino feliz: con usuario y contrasena correctos el sistema ' +
          'permite el acceso y muestra el catalogo de productos.'
      );

      const { usuario, password } = usuarios.validos.standard;

      LoginPage.iniciarSesion(usuario, password);

      InventoryPage.verificarAccesoExitoso();
      InventoryPage.verificarCantidadDeProductos(6);
    });

    it('SD-02 | Con contrasena incorrecta el acceso es rechazado', () => {
      allure.story('Login fallido con contrasena incorrecta');
      allure.severity('critical');
      allure.description(
        'Verifica que un usuario existente con la contrasena equivocada NO puede ' +
          'entrar, que ve un mensaje de error y que permanece en la pantalla de login.'
      );

      const { usuario, password } = usuarios.invalidos.passwordIncorrecta;

      LoginPage.iniciarSesion(usuario, password);

      LoginPage.verificarMensajeError(mensajes.login.credencialesInvalidas);
      LoginPage.verificarQueSigueEnLogin();
    });

    it('SD-03 | El campo Usuario es obligatorio', () => {
      allure.story('Validacion de campos obligatorios');
      allure.severity('normal');
      allure.description(
        'Verifica que al intentar ingresar sin usuario el sistema lo informa ' +
          'explicitamente en lugar de fallar en silencio.'
      );

      const { usuario, password } = usuarios.invalidos.sinUsuario;

      LoginPage.iniciarSesion(usuario, password);

      LoginPage.verificarMensajeError(mensajes.login.usuarioRequerido);
      LoginPage.verificarQueSigueEnLogin();
    });

    it('SD-04 | El campo Contrasena es obligatorio', () => {
      allure.story('Validacion de campos obligatorios');
      allure.severity('normal');
      allure.description(
        'Verifica que al intentar ingresar sin contrasena el sistema lo informa ' +
          'explicitamente en lugar de fallar en silencio.'
      );

      const { usuario, password } = usuarios.invalidos.sinPassword;

      LoginPage.iniciarSesion(usuario, password);

      LoginPage.verificarMensajeError(mensajes.login.passwordRequerida);
      LoginPage.verificarQueSigueEnLogin();
    });
  });

  // =====================================================================
  // CASOS ADICIONALES (no solicitados, agregados por analisis de riesgo)
  // =====================================================================
  context('Casos adicionales por analisis de riesgo', () => {
    it('SD-05 | Un usuario bloqueado no puede ingresar aunque su contrasena sea correcta', () => {
      allure.story('Usuario bloqueado');
      allure.severity('critical');
      allure.description(
        'Riesgo cubierto: que un usuario dado de baja o bloqueado por seguridad ' +
          'siga teniendo acceso al sistema.'
      );

      const { usuario, password } = usuarios.especiales.bloqueado;

      LoginPage.iniciarSesion(usuario, password);

      LoginPage.verificarMensajeError(mensajes.login.usuarioBloqueado);
      LoginPage.verificarQueSigueEnLogin();
    });

    it('SD-06 | Un usuario inexistente recibe el mismo mensaje generico que una contrasena incorrecta', () => {
      allure.story('Enumeracion de usuarios');
      allure.severity('normal');
      allure.description(
        'Riesgo cubierto (seguridad): si el sistema respondiera "ese usuario no existe" ' +
          'un atacante podria descubrir que cuentas son validas. El mensaje debe ser ' +
          'identico al de contrasena incorrecta.'
      );

      const { usuario, password } = usuarios.invalidos.usuarioInexistente;

      LoginPage.iniciarSesion(usuario, password);

      LoginPage.verificarMensajeError(mensajes.login.credencialesInvalidas);
    });

    it('SD-07 | Sin sesion iniciada no se puede acceder al catalogo por URL directa', () => {
      allure.story('Control de acceso');
      allure.severity('blocker');
      allure.description(
        'Riesgo cubierto (seguridad): que alguien salte la pantalla de login ' +
          'escribiendo directamente la direccion de una pantalla interna.'
      );

      cy.visit('/inventory.html', { failOnStatusCode: false });

      LoginPage.verificarQueSigueEnLogin();
      cy.get(LoginPage.selectores.mensajeError)
        .should('be.visible')
        .and('contain.text', 'You can only access');
    });

    it('SD-08 | La contrasena se muestra enmascarada en pantalla', () => {
      allure.story('Proteccion de datos sensibles');
      allure.severity('minor');
      allure.description(
        'Riesgo cubierto: que la contrasena quede visible para alguien mirando la pantalla.'
      );

      LoginPage.visitar();
      LoginPage.escribirPassword('secret_sauce');
      LoginPage.verificarPasswordEnmascarada();
    });

    it('SD-09 | Con ambos campos vacios se prioriza el aviso de Usuario requerido', () => {
      allure.story('Validacion de campos obligatorios');
      allure.severity('minor');
      allure.description(
        'Verifica el orden de precedencia de las validaciones: el sistema informa ' +
          'primero el campo Usuario. Documenta el comportamiento actual esperado.'
      );

      const { usuario, password } = usuarios.invalidos.ambosVacios;

      LoginPage.iniciarSesion(usuario, password);

      LoginPage.verificarMensajeError(mensajes.login.usuarioRequerido);
    });
  });
});
