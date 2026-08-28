/**
 * Page Object de la pantalla de Productos (destino de un login exitoso).
 * Se usa para confirmar que el usuario realmente entro al sistema.
 */
class InventoryPage {
  static selectores = {
    contenedor: '[data-test="inventory-container"]',
    productos: '[data-test="inventory-item"]',
    titulo: '[data-test="title"]',
  };

  /** Verifica que el login fue exitoso: URL, titulo y catalogo cargado */
  static verificarAccesoExitoso() {
    cy.url().should('include', '/inventory.html');
    cy.get(this.selectores.titulo).should('have.text', 'Products');
    cy.get(this.selectores.contenedor).should('be.visible');
    return this;
  }

  /** Verifica la cantidad de productos visibles en el catalogo */
  static verificarCantidadDeProductos(cantidadEsperada) {
    cy.get(this.selectores.productos).should('have.length', cantidadEsperada);
    return this;
  }
}

export default InventoryPage;
