import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { createRequire } from 'node:module';

// =================================================================
// 💡 CORRECTIF MAGIQUE POUR LES MODULES NATIFS (.UNPACKED)
// =================================================================
// On crée un 'require' natif Node.js pour contourner les limites de la compilation Vite
const requireNative = createRequire(import.meta.url);

if (app.isPackaged) {
  // Chemin physique vers le dossier décompressé des node_modules de production
  const unpackedNodeModules = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules');

  // On force Node.js à chercher en priorité absolue dans ce dossier
  module.paths.unshift(unpackedNodeModules);

  // Patch de secours global pour s'assurer que n'importe quel require('better-sqlite3')
  // pointe directement vers le binaire décompressé
  const originalRequire = module.constructor.prototype.require;
  module.constructor.prototype.require = function (id) {
    if (id === 'better-sqlite3') {
      return originalRequire.call(this, path.join(unpackedNodeModules, 'better-sqlite3'));
    }
    return originalRequire.call(this, id);
  };
}

// L'importation de la base de données doit se faire APRÈS le patch des chemins
import AppDatabase from './db/database.js';

app.disableHardwareAcceleration();

let db;

// ==========================================
// IPC HANDLERS
// ==========================================
function setupIpcHandlers() {
  // Users CRUD
  ipcMain.handle('users:getAll', (event, activeOnly = false) => {
    return db.getAllUsers(activeOnly);
  });

  ipcMain.handle('users:get', (event, id) => {
    return db.getUser(id);
  });

  ipcMain.handle('users:getFullProfile', (event, id) => {
    return db.getUserFullProfile(id);
  });

  ipcMain.handle('users:create', (event, data) => {
    return db.createUser(data);
  });

  ipcMain.handle('users:update', (event, id, data) => {
    return db.updateUser(id, data);
  });

  ipcMain.handle('users:delete', (event, id) => {
    return db.deleteUser(id);
  });

  ipcMain.handle('users:search', (event, term) => {
    return db.searchUsers(term);
  });

  // Statistics
  ipcMain.handle('stats:get', () => {
    const users = db.getAllUsers();
    const activeUsers = users.filter(u => u.is_active === 1);
    const inactiveUsers = users.filter(u => u.is_active === 0);

    const genderStats = {
      Masculin: users.filter(u => u.gender === 'Masculin').length,
      Feminin: users.filter(u => u.gender === 'Féminin').length,
      Autre: users.filter(u => u.gender === 'Autre').length,
    };

    const housingStats = {
      Stable: users.filter(u => u.housing_type === 'Stable').length,
      Precaire: users.filter(u => u.housing_type === 'Précaire').length,
      'Hebergement collectif': users.filter(u => u.housing_type === 'Hébergement collectif').length,
    };

    const professionalStats = {
      Chomage: users.filter(u => u.professional_status_upon_graduation === 'Chomage').length,
      'En stage': users.filter(u => u.professional_status_upon_graduation === 'En stage').length,
      Employe: users.filter(u => u.professional_status_upon_graduation === 'Employe').length,
      'Propre chef': users.filter(u => u.professional_status_upon_graduation === 'Propre chef').length,
    };

    return {
      total: users.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
      genderStats,
      housingStats,
      professionalStats,
    };
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  db = new AppDatabase();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});