const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Users CRUD
  getUsers: (activeOnly = false) => ipcRenderer.invoke('users:getAll', activeOnly),
  getUser: (id) => ipcRenderer.invoke('users:get', id),
  getUserFullProfile: (id) => ipcRenderer.invoke('users:getFullProfile', id),
  createUser: (data) => ipcRenderer.invoke('users:create', data),
  updateUser: (id, data) => ipcRenderer.invoke('users:update', id, data),
  deleteUser: (id) => ipcRenderer.invoke('users:delete', id),
  searchUsers: (term) => ipcRenderer.invoke('users:search', term),

  // Statistics
  getStats: () => ipcRenderer.invoke('stats:get'),
});
