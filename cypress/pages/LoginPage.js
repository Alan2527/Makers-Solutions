/**
 * Page Object de la pantalla de Login de SauceDemo.
 *
 * Por que existe este archivo:
 * si manana la aplicacion cambia el nombre de un campo, se corrige UNA sola
 * linea aca y todos los tests siguen funcionando. Los archivos de prueba
 * describen QUE se valida; este archivo describe COMO se interactua.
 */
class LoginPage {
  // Localizadores: se usan atributos data-test, que son los que la propia
  // aplicacion expone para automatizacion. Son mas estables que clases CSS,
  // que cambian cada vez que alguien retoca el diseno.
  static selectores = {
    usuario: '[data-test="username"]',
    password: '[data-test="password"]',
    botonLogin: '[data-test="login-button"]',
    mensajeError: '[data-test="error"]',
    logo: '.login_logo',
  };

  /** Abre la pantalla de login */
  static visitar() {
    cy.visit('/');
    cy.get(this.selectores.logo).should('be.visible');
    return this;
  }

  static escribirUsuario(usuario) {
    cy.get(this.selectores.usuario).clear().type(usuario);
    return this;
  }

  static escribirPassword(password) {
    cy.get(this.selectores.password).clear().type(password, { log: false });
    return this;
  }

  static clickLogin() {
    cy.get(this.selectores.botonLogin).click();
    return this;
  }

  /** Flujo completo de login. Campos vacios se dejan sin completar a proposito. */
  static iniciarSesion(usuario, password) {
    this.visitar();
    if (usuario) this.escribirUsuario(usuario);
    if (password) this.escribirPassword(password);
    this.clickLogin();
    return this;
  }

  // --- Verificaciones ---

  /** Verifica el texto exacto del mensaje de error mostrado al usuario */
  static verificarMensajeError(textoEsperado) {
    cy.get(this.selectores.mensajeError)
      .should('be.visible')
      .and('have.text', textoEsperado);
    return this;
  }

  /** Verifica que seguimos en la pantalla de login (no hubo acceso) */
  static verificarQueSigueEnLogin() {
    cy.url().should('not.include', '/inventory.html');
    cy.get(this.selectores.botonLogin).should('be.visible');
    return this;
  }

}

export default LoginPage;
