/**
 * Main Renderer - SPA Router and View Controller
 */

import './index.css';
import './renderer/css/main.css';
import './renderer/css/dashboard.css';
import './renderer/css/tables.css';
import './renderer/css/form.css';
import { renderDashboard } from './renderer/js/dashboard.js';
import { renderUserForm, handleUserFormSubmit } from './renderer/js/user-form.js';
import { renderUserDetails } from './renderer/js/users-details.js';
import { formatDate, debounce, showNotification } from './renderer/js/utils.js';

// ==========================================
// STATE
// ==========================================

const state = {
  currentView: 'dashboard',
  users: [],
  selectedUserId: null,
  searchTerm: '',
};

// ==========================================
// DOM ELEMENTS
// ==========================================

const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('search-input');
const navItems = document.querySelectorAll('.nav-item');

// ==========================================
// ROUTER
// ==========================================

const views = {
  dashboard: {
    title: 'Dashboard',
    showSearch: false,
    render: renderDashboard,
  },
  users: {
    title: 'Beneficiaires',
    showSearch: true,
    render: renderUsersList,
  },
  'add-user': {
    title: 'Nouveau Beneficiaire',
    showSearch: false,
    render: () => renderUserForm(null, handleFormSubmit, navigateTo),
  },
  'edit-user': {
    title: 'Modifier Beneficiaire',
    showSearch: false,
    render: () => renderUserForm(state.selectedUserId, handleFormSubmit, navigateTo),
  },
  'user-details': {
    title: 'Details du Beneficiaire',
    showSearch: false,
    render: () => renderUserDetails(state.selectedUserId, navigateTo, handleDelete),
  },
};

async function navigateTo(view, params = {}) {
  state.currentView = view;

  if (params.userId) {
    state.selectedUserId = params.userId;
  }

  // Update active nav item
  navItems.forEach((item) => {
    const itemView = item.dataset.view;
    item.classList.toggle('active', itemView === view ||
      (view === 'edit-user' && itemView === 'users') ||
      (view === 'user-details' && itemView === 'users'));
  });

  // Update page title and search visibility
  const viewConfig = views[view];
  if (viewConfig) {
    pageTitle.textContent = viewConfig.title;
    searchContainer.style.display = viewConfig.showSearch ? 'flex' : 'none';

    // Show loading state
    contentArea.innerHTML = '<div class="loading">Chargement</div>';

    // Render the view
    try {
      const html = await viewConfig.render();
      contentArea.innerHTML = html;

      // Attach event listeners after render
      attachViewEventListeners(view);
    } catch (error) {
      console.error('Error rendering view:', error);
      contentArea.innerHTML = `
        <div class="alert alert-danger">
          Une erreur est survenue lors du chargement de la page.
        </div>
      `;
    }
  }
}

// ==========================================
// USERS LIST VIEW
// ==========================================

async function renderUsersList() {
  try {
    const users = state.searchTerm
      ? await window.api.searchUsers(state.searchTerm)
      : await window.api.getUsers();

    state.users = users;

    if (users.length === 0) {
      return `
        <div class="table-container">
          <div class="empty-state">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 class="empty-state-title">Aucun beneficiaire</h3>
            <p class="empty-state-description">
              ${state.searchTerm
          ? 'Aucun resultat pour votre recherche. Essayez avec d\'autres termes.'
          : 'Commencez par ajouter un nouveau beneficiaire pour le voir apparaitre ici.'}
            </p>
            ${!state.searchTerm ? `
              <button class="btn btn-primary" data-action="add-user">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ajouter un beneficiaire
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }

    const rows = users.map(user => {
      const avatarClass = user.gender === 'Masculin' ? 'male' :
        user.gender === 'Féminin' ? 'female' : 'other';
      const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

      return `
        <tr data-user-id="${user.id}">
          <td>
            <div class="user-cell">
              <div class="user-avatar ${avatarClass}">${initials}</div>
              <div class="user-info">
                <span class="user-name">${user.last_name} ${user.first_name}</span>
                <span class="user-residence">${user.residence || 'Non renseigne'}</span>
              </div>
            </div>
          </td>
          <td>${user.gender || '-'}</td>
          <td>${formatDate(user.entry_date)}</td>
          <td>
            <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
              ${user.is_active ? 'Actif' : 'Inactif'}
            </span>
          </td>
          <td>
            <div class="cell-actions">
              <button class="action-btn view" data-action="view" data-id="${user.id}" title="Voir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button class="action-btn edit" data-action="edit" data-id="${user.id}" title="Modifier">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button class="action-btn delete" data-action="delete" data-id="${user.id}" title="Supprimer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">${users.length} beneficiaire${users.length > 1 ? 's' : ''}</h3>
          <div class="table-actions">
            <button class="btn btn-primary" data-action="add-user">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Beneficiaire</th>
              <th>Genre</th>
              <th>Date d'entree</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="table-footer">
          <span class="table-info">Affichage de ${users.length} beneficiaire${users.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading users:', error);
    return `
      <div class="alert alert-danger">
        Erreur lors du chargement des beneficiaires: ${error.message}
      </div>
    `;
  }
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function attachViewEventListeners(view) {
  // Handle table actions
  if (view === 'users') {
    contentArea.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', handleTableAction);
    });
  }

  // Handle form submission
  if (view === 'add-user' || view === 'edit-user') {
    const form = contentArea.querySelector('#user-form');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }

    // Impact score slider
    const impactRange = contentArea.querySelector('#impact_score');
    const impactValue = contentArea.querySelector('#impact_score_value');
    if (impactRange && impactValue) {
      impactRange.addEventListener('input', () => {
        impactValue.textContent = impactRange.value;
      });
    }

    // Cancel button
    const cancelBtn = contentArea.querySelector('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => navigateTo('users'));
    }
  }

  // Handle details view buttons
  if (view === 'user-details') {
    contentArea.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const id = e.currentTarget.dataset.id;

        if (action === 'edit') {
          navigateTo('edit-user', { userId: parseInt(id) });
        } else if (action === 'delete') {
          handleDelete(parseInt(id));
        } else if (action === 'back') {
          navigateTo('users');
        }
      });
    });
  }
}

function handleTableAction(e) {
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const id = btn.dataset.id ? parseInt(btn.dataset.id) : null;

  switch (action) {
    case 'view':
      navigateTo('user-details', { userId: id });
      break;
    case 'edit':
      navigateTo('edit-user', { userId: id });
      break;
    case 'delete':
      handleDelete(id);
      break;
    case 'add-user':
      navigateTo('add-user');
      break;
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const userData = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    gender: formData.get('gender') || null,
    birth_date: formData.get('birth_date'),
    entry_date: formData.get('entry_date'),
    exit_date: formData.get('exit_date') || null,
    cde_number: formData.get('cde_number') ? parseInt(formData.get('cde_number')) : null,
    residence: formData.get('residence') || null,
    education_level: formData.get('education_level') || null,
    housing_type: formData.get('housing_type') || null,
    family_situation: formData.get('family_situation') || null,
    contact: formData.get('contact') ? parseInt(formData.get('contact')) : null,
    parent_contact: formData.get('parent_contact') ? parseInt(formData.get('parent_contact')) : null,
    diploma_obtained_upon_graduation: formData.get('diploma_obtained_upon_graduation') || null,
    professional_status_upon_graduation: formData.get('professional_status_upon_graduation') || null,
    address_upon_graduation: formData.get('address_upon_graduation') || null,
    marital_satus: formData.get('marital_satus') || null,
    fetal_status: formData.get('fetal_status') || null,
    skills_acquired_upon_completion_of_the_program: formData.get('skills_acquired_upon_completion_of_the_program') || null,
    impact_evaluation: formData.get('impact_evaluation') || null,
    impact_score: formData.get('impact_score') ? parseInt(formData.get('impact_score')) : null,
    is_active: formData.get('is_active') === 'on' ? 1 : 0,
  };

  try {
    if (state.selectedUserId && state.currentView === 'edit-user') {
      await window.api.updateUser(state.selectedUserId, userData);
      showNotification('Beneficiaire mis a jour avec succes', 'success');
    } else {
      await window.api.createUser(userData);
      showNotification('Beneficiaire cree avec succes', 'success');
    }
    navigateTo('users');
  } catch (error) {
    console.error('Error saving user:', error);
    showNotification('Erreur lors de l\'enregistrement: ' + error.message, 'danger');
  }
}

async function handleDelete(id) {
  if (!confirm('Etes-vous sur de vouloir supprimer ce beneficiaire ? Cette action est irreversible.')) {
    return;
  }

  try {
    await window.api.deleteUser(id);
    showNotification('Beneficiaire supprime avec succes', 'success');
    navigateTo('users');
  } catch (error) {
    console.error('Error deleting user:', error);
    showNotification('Erreur lors de la suppression: ' + error.message, 'danger');
  }
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

const handleSearch = debounce(async (term) => {
  state.searchTerm = term;
  if (state.currentView === 'users') {
    navigateTo('users');
  }
}, 300);

searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

// ==========================================
// NAVIGATION EVENT LISTENERS
// ==========================================

navItems.forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const view = item.dataset.view;
    if (view) {
      state.searchTerm = '';
      searchInput.value = '';
      navigateTo(view);
    }
  });
});

// ==========================================
// INITIALIZE APP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');
});

// Export for use in other modules
export { navigateTo, state };
