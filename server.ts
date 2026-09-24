import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { vendingService } from './src/server/vendingEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// --- ROUTES REST API DU DISTRIBUTEUR AUTOMATIQUE ---

// État complet et marquage M(t)
app.get('/api/state', (_req, res) => {
  res.json(vendingService.getState());
});

// Liste des places avec jetons
app.get('/api/places', (_req, res) => {
  res.json(vendingService.getPlaces());
});

// Liste des transitions avec activation
app.get('/api/transitions', (_req, res) => {
  res.json(vendingService.getTransitions());
});

// Boissons avec prix et stocks
app.get('/api/drinks', (_req, res) => {
  res.json(vendingService.getDrinks());
});

// Arcs du réseau
app.get('/api/arcs', (_req, res) => {
  res.json(vendingService.getArcs());
});

// Historique des franchissements
app.get('/api/history', (_req, res) => {
  res.json(vendingService.history);
});

// Insertion de monnaie (Transition T1)
app.post('/api/insert-money', (req, res) => {
  const { amount } = req.body || {};
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ detail: 'Le montant inséré doit être un nombre positif.' });
  }

  const [success, message] = vendingService.insertMoney(amount);
  if (!success) {
    return res.status(400).json({ detail: message });
  }
  return res.json({
    success: true,
    message,
    state: vendingService.getState(),
  });
});

// Sélection d'une boisson
app.post('/api/select-drink', (req, res) => {
  const { drink_id } = req.body || {};
  if (!drink_id) {
    return res.status(400).json({ detail: 'Identifiant de boisson manquant.' });
  }

  const [success, message] = vendingService.selectDrink(drink_id);
  if (!success) {
    return res.status(400).json({ detail: message });
  }
  return res.json({
    success: true,
    message,
    state: vendingService.getState(),
  });
});

// Franchissement manuel de transition (T1..T9)
app.post('/api/fire', (req, res) => {
  const { transition_id } = req.body || {};
  if (!transition_id) {
    return res.status(400).json({ detail: 'Identifiant de transition manquant.' });
  }

  const [success, message] = vendingService.fireTransition(transition_id);
  if (!success) {
    return res.status(400).json({ detail: message });
  }
  return res.json({
    success: true,
    message,
    state: vendingService.getState(),
  });
});

// Réinitialisation de la simulation (Marquage M0)
app.post('/api/reset', (_req, res) => {
  vendingService.reset();
  return res.json({
    success: true,
    message: 'Simulation réinitialisée avec succès au marquage initial M0.',
    state: vendingService.getState(),
  });
});

// Configuration Vite Dev Server / Static Assets
async function setupVite() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Distributeur Automatique] Serveur démarré sur http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Erreur démarrage serveur:', err);
});
