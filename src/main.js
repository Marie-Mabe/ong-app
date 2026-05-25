import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import AppDatabase from './db/database.js';

// Fix GPU issues on Linux
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
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  db = new AppDatabase();
  setupIpcHandlers();
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
