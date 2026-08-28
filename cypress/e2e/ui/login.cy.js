import * as allure from 'allure-cypress';
import LoginPage from '../../pages/LoginPage';
import InventoryPage from '../../pages/InventoryPage';

/**
 * MODULO 1 - SMOKE TEST DE INICIO DE SESION
 * Aplicacion bajo prueba: https://www.saucedemo.com/
 *
 * Alcance: el conjunto minimo solicitado en el enunciado.
 *   1. Login exitoso con credenciales validas  -> SD-01
 *   2. Login fallido con contrasena incorrecta -> SD-02
 *   3. Validacion de campos obligatorios       -> SD-03 y SD-04
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
