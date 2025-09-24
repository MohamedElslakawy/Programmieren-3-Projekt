/*
  Author: Fighan Suliman
  Version: 1.0
  Datum: 24.09.2025

  Misst Performance-Kennzahlen der Web-App (Web Vitals) und leitet sie an eine Callback-Funktion weiter.
*/

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamisches Importieren der Web-Vitals-Bibliothek
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // CLS, FID, FCP, LCP und TTFB messen und an Callback weitergeben
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
