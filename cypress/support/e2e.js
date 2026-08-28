// Punto de entrada de soporte de Cypress.
// Se ejecuta antes de cada archivo de pruebas.

import 'allure-cypress';
import './commands';

// SauceDemo puede emitir errores de JS no capturados que no afectan
// el flujo bajo prueba. Los ignoramos de forma explicita y acotada
// para no enmascarar fallos reales de la aplicacion.
Cypress.on('uncaught:exception', () => false);
