const { defineConfig } = require('cypress');
const { allureCypress } = require('allure-cypress/reporter');

module.exports = defineConfig({
  // Aplicacion bajo prueba del Modulo 1 (UI)
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',

    // Evidencia automatica de cada ejecucion
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',

    // Tiempos de espera explicitos: sin sleeps fijos en los tests
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,
    requestTimeout: 15000,

    // Reintento solo en ejecucion headless (CI), nunca en modo interactivo.
    // Evita falsos rojos por inestabilidad de red sin ocultar bugs reales.
    retries: { runMode: 1, openMode: 0 },

    viewportWidth: 1280,
    viewportHeight: 800,

    setupNodeEvents(on, config) {
      // Reporte Allure: genera los resultados que luego se publican en GitHub Pages
      allureCypress(on, config, {
        resultsDir: 'allure-results',
      });
      return config;
    },
  },

  env: {
    // Aplicacion bajo prueba del Modulo 3 (API)
    apiBaseUrl: 'https://reqres.in/api',
  },
});
