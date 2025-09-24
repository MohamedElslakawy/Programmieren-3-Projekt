/*
  Author: Fighan Suliman
  Version: 1.0
  Datum: 24.09.2025

  Testet die App-Komponente. Prüft, ob der Text "learn react" im DOM gerendert wird.
*/

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  // App-Komponente rendern
  render(<App />);

  // Prüfen, ob der Text "learn react" im DOM vorhanden ist
  const linkElement = screen.getByText(/learn react/i);

  // Erwartung: Das Element ist im Dokument
  expect(linkElement).toBeInTheDocument();
});
