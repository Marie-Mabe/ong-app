/**
 * User Details View Component
 */

import { formatDate, calculateAge, getInitials } from './utils.js';

/**
 * Render user details view
 * @param {number} userId - User ID to display
 * @param {Function} navigateTo - Navigation function
 * @param {Function} onDelete - Delete handler
 * @returns {string} HTML string
 */
export async function renderUserDetails(userId, _navigateTo, _onDelete) {
  if (!userId) {
    return `
      <div class="alert alert-danger">
        Aucun beneficiaire selectionne.
      </div>
    `;
  }

  try {
    const user = await window.api.getUser(userId);

    if (!user) {
      return `
        <div class="alert alert-danger">
          Beneficiaire non trouve. Il a peut-etre ete supprime.
        </div>
      `;
    }

    const age = calculateAge(user.birth_date);
    const initials = getInitials(user.first_name, user.last_name);
    const avatarClass = user.gender === 'Masculin' ? 'male' :
      user.gender === 'Féminin' ? 'female' : 'other';

    return `
      <div class="page-header">
        <div class="page-header-left">
          <button class="back-btn" data-action="back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-secondary" data-action="edit" data-id="${user.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </button>
          <button class="btn btn-danger" data-action="delete" data-id="${user.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>

      <!-- User Header Card -->
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-body" style="display: flex; align-items: center; gap: 24px;">
          <div class="user-avatar ${avatarClass}" style="width: 80px; height: 80px; font-size: 1.5rem;">
            ${initials}
          </div>
          <div style="flex: 1;">
            <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--gray-900); margin-bottom: 4px;">
              ${user.last_name} ${user.first_name}
            </h2>
            <p style="color: var(--gray-500); margin-bottom: 12px;">
              ${user.residence || 'Residence non renseignee'} ${age ? `- ${age} ans` : ''}
            </p>
            <div style="display: flex; gap: 12px;">
              <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                ${user.is_active ? 'Actif' : 'Inactif'}
              </span>
              ${user.cde_number ? `<span class="badge badge-primary">CDE #${user.cde_number}</span>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Details Sections -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
        <!-- Personal Information -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Informations Personnelles</h3>
          </div>
          <div class="card-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Nom complet</span>
                <span class="detail-value">${user.last_name} ${user.first_name}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Genre</span>
                <span class="detail-value ${!user.gender ? 'empty' : ''}">${user.gender || 'Non renseigne'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Date de naissance</span>
                <span class="detail-value">${formatDate(user.birth_date)}${age ? ` (${age} ans)` : ''}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Date d'entree</span>
                <span class="detail-value">${formatDate(user.entry_date)}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Date de sortie</span>
                <span class="detail-value ${!user.exit_date ? 'empty' : ''}">${user.exit_date ? formatDate(user.exit_date) : 'Toujours actif'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Statut</span>
                <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                  ${user.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Situation -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Situation</h3>
          </div>
          <div class="card-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Numero CDE</span>
                <span class="detail-value ${!user.cde_number ? 'empty' : ''}">${user.cde_number || 'Non attribue'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Residence</span>
                <span class="detail-value ${!user.residence ? 'empty' : ''}">${user.residence || 'Non renseignee'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Niveau d'education</span>
                <span class="detail-value ${!user.education_level ? 'empty' : ''}">${user.education_level || 'Non renseigne'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Type de logement</span>
                <span class="detail-value ${!user.housing_type ? 'empty' : ''}">${user.housing_type || 'Non renseigne'}</span>
              </div>

              <div class="detail-item" style="grid-column: 1 / -1;">
                <span class="detail-label">Situation familiale</span>
                <span class="detail-value ${!user.family_situation ? 'empty' : ''}">${user.family_situation || 'Non renseignee'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Post-Graduation Information -->
        <div class="card" style="grid-column: 1 / -1;">
          <div class="card-header">
            <h3 class="card-title">Informations a la Sortie</h3>
          </div>
          <div class="card-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Diplome obtenu</span>
                <span class="detail-value ${!user.diploma_obtained_upon_graduation ? 'empty' : ''}">${user.diploma_obtained_upon_graduation || 'Non renseigne'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Statut professionnel</span>
                <span class="detail-value ${!user.professional_status_upon_graduation ? 'empty' : ''}">${user.professional_status_upon_graduation || 'Non renseigne'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Adresse a la sortie</span>
                <span class="detail-value ${!user.address_upon_graduation ? 'empty' : ''}">${user.address_upon_graduation || 'Non renseignee'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Situation matrimoniale</span>
                <span class="detail-value ${!user.marital_satus ? 'empty' : ''}">${user.marital_satus || 'Non renseigne'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Statut familial</span>
                <span class="detail-value ${!user.fetal_status ? 'empty' : ''}">${user.fetal_status || 'Non renseigne'}</span>
              </div>

              <div class="detail-item" style="grid-column: 1 / -1;">
                <span class="detail-label">Competences acquises a la completion du programme</span>
                <span class="detail-value ${!user.skills_acquired_upon_completion_of_the_program ? 'empty' : ''}" style="white-space: pre-wrap;">
                  ${user.skills_acquired_upon_completion_of_the_program || 'Aucune competence renseignee'}
                </span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Contact</span>
                <span class="detail-value ${!user.contact ? 'empty' : ''}">${user.contact || 'Non attribue'}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Contact parent</span>
                <span class="detail-value ${!user.parent_contact ? 'empty' : ''}">${user.parent_contact || 'Non attribue'}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Evaluation -->
        <div class="card" style="grid-column: 1 / -1;">
          <div class="card-header">
            <h3 class="card-title">Evaluation d'Impact</h3>
          </div>
          <div class="card-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Score d'impact</span>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="detail-value" style="font-size: 1.5rem; font-weight: 600; color: var(--primary-600);">
                    ${user.impact_score !== null ? user.impact_score : '-'}/100
                  </span>
                  ${user.impact_score !== null ? `
                    <div style="flex: 1; max-width: 200px; height: 8px; background: var(--gray-200); border-radius: 4px; overflow: hidden;">
                      <div style="width: ${user.impact_score}%; height: 100%; background: linear-gradient(90deg, var(--primary-500), var(--primary-600)); border-radius: 4px;"></div>
                    </div>
                  ` : ''}
                </div>
              </div>

              <div class="detail-item" style="grid-column: 1 / -1;">
                <span class="detail-label">Evaluation detaillee</span>
                <span class="detail-value ${!user.impact_evaluation ? 'empty' : ''}" style="white-space: pre-wrap;">
                  ${user.impact_evaluation || 'Aucune evaluation renseignee'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="card" style="grid-column: 1 / -1;">
          <div class="card-header">
            <h3 class="card-title">Informations Systeme</h3>
          </div>
          <div class="card-body">
            <div class="detail-grid three-cols">
              <div class="detail-item">
                <span class="detail-label">ID</span>
                <span class="detail-value">#${user.id}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Cree le</span>
                <span class="detail-value">${formatDate(user.created_at)}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Derniere modification</span>
                <span class="detail-value">${formatDate(user.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading user details:', error);
    return `
      <div class="alert alert-danger">
        Erreur lors du chargement des details: ${error.message}
      </div>
    `;
  }
}
