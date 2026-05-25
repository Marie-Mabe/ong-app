/**
 * User Form Component
 */

import { formatDateForInput } from './utils.js';

/**
 * Render the user form (create or edit mode)
 * @param {number|null} userId - User ID for edit mode, null for create mode
 * @param {Function} onSubmit - Submit handler
 * @param {Function} navigateTo - Navigation function
 * @returns {string} HTML string
 */
export async function renderUserForm(userId, onSubmit, navigateTo) {
  let user = null;

  if (userId) {
    try {
      user = await window.api.getUser(userId);
      if (!user) {
        return `
          <div class="alert alert-danger">
            Beneficiaire non trouve. Il a peut-etre ete supprime.
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading user:', error);
      return `
        <div class="alert alert-danger">
          Erreur lors du chargement du beneficiaire: ${error.message}
        </div>
      `;
    }
  }

  const isEdit = !!user;
  const title = isEdit ? 'Modifier le Beneficiaire' : 'Nouveau Beneficiaire';
  const subtitle = isEdit
    ? `Modification des informations de ${user.first_name} ${user.last_name}`
    : 'Remplissez les informations pour creer un nouveau beneficiaire';

  return `
    <div class="page-header">
      <div class="page-header-left">
        <button class="back-btn" data-action="cancel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>
    </div>

    <div class="form-container">
      <div class="form-header">
        <h2 class="form-title">${title}</h2>
        <p class="form-subtitle">${subtitle}</p>
      </div>

      <form id="user-form">
        <div class="form-body">
          <!-- Personal Information Section -->
          <div class="form-section">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Informations Personnelles
            </h3>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required" for="last_name">Nom</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  class="form-input"
                  placeholder="Entrez le nom"
                  value="${user?.last_name || ''}"
                  required
                >
              </div>

              <div class="form-group">
                <label class="form-label required" for="first_name">Prenom</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  class="form-input"
                  placeholder="Entrez le prenom"
                  value="${user?.first_name || ''}"
                  required
                >
              </div>

              <div class="form-group">
                <label class="form-label" for="gender">Genre</label>
                <select id="gender" name="gender" class="form-select">
                  <option value="">Selectionnez</option>
                  <option value="Masculin" ${user?.gender === 'Masculin' ? 'selected' : ''}>Masculin</option>
                  <option value="Féminin" ${user?.gender === 'Féminin' ? 'selected' : ''}>Féminin</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label required" for="birth_date">Date de Naissance</label>
                <input
                  type="date"
                  id="birth_date"
                  name="birth_date"
                  class="form-input"
                  value="${formatDateForInput(user?.birth_date)}"
                  required
                >
              </div>

              <div class="form-group">
                <label class="form-label required" for="entry_date">Date d'Entree</label>
                <input
                  type="date"
                  id="entry_date"
                  name="entry_date"
                  class="form-input"
                  value="${formatDateForInput(user?.entry_date) || formatDateForInput(new Date().toISOString())}"
                  required
                >
              </div>

              <div class="form-group">
                <label class="form-label" for="exit_date">Date de Sortie</label>
                <input
                  type="date"
                  id="exit_date"
                  name="exit_date"
                  class="form-input"
                  value="${formatDateForInput(user?.exit_date)}"
                >
                <span class="form-hint">Laissez vide si toujours actif</span>
              </div>
            </div>
          </div>

          <!-- Situation Section -->
          <div class="form-section">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
              Situation
            </h3>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="cde_number">Numero CDE</label>
                <input
                  type="number"
                  id="cde_number"
                  name="cde_number"
                  class="form-input"
                  placeholder="Ex: 12345"
                  value="${user?.cde_number || ''}"
                >
              </div>

              <div class="form-group">
                <label class="form-label" for="residence">Residence</label>
                <input
                  type="text"
                  id="residence"
                  name="residence"
                  class="form-input"
                  placeholder="Adresse ou quartier"
                  value="${user?.residence || ''}"
                >
              </div>

              <div class="form-group">
                <label class="form-label" for="education_level">Niveau d'Education</label>
                <select id="education_level" name="education_level" class="form-select">
                  <option value="">Selectionnez</option>
                  <option value="Aucun" ${user?.education_level === 'Aucun' ? 'selected' : ''}>Aucun</option>
                  <option value="Primaire" ${user?.education_level === 'Primaire' ? 'selected' : ''}>Primaire</option>
                  <option value="Secondaire" ${user?.education_level === 'Secondaire' ? 'selected' : ''}>Secondaire</option>
                  <option value="Professionnel" ${user?.education_level === 'Professionnel' ? 'selected' : ''}>Professionnel</option>
                  <option value="Universitaire" ${user?.education_level === 'Universitaire' ? 'selected' : ''}>Universitaire</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="housing_type">Type de Logement</label>
                <select id="housing_type" name="housing_type" class="form-select">
                  <option value="">Selectionnez</option>
                  <option value="Stable" ${user?.housing_type === 'Stable' ? 'selected' : ''}>Stable</option>
                  <option value="Précaire" ${user?.housing_type === 'Précaire' ? 'selected' : ''}>Précaire</option>
                  <option value="Hébergement collectif" ${user?.housing_type === 'Hébergement collectif' ? 'selected' : ''}>Hébergement collectif</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label class="form-label" for="family_situation">Situation Familiale</label>
                <input
                  type="text"
                  id="family_situation"
                  name="family_situation"
                  class="form-input"
                  placeholder="Ex: Marie, 2 enfants"
                  value="${user?.family_situation || ''}"
                >
              </div>
            </div>
          </div>

          <!-- Post-Graduation Information Section -->
          <div class="form-section">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6m0 0v6m0-6h6m0 0h6M2 12.5a10 10 0 0 1 12.5-9.5" />
              </svg>
              Informations a la Sortie
            </h3>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="diploma_obtained_upon_graduation">Diplome Obtenu</label>
                <input
                  type="text"
                  id="diploma_obtained_upon_graduation"
                  name="diploma_obtained_upon_graduation"
                  class="form-input"
                  placeholder="Ex: Certificat de formation"
                  value="${user?.diploma_obtained_upon_graduation || ''}"
                >
              </div>

              <div class="form-group">
                <label class="form-label" for="professional_status_upon_graduation">Statut Professionnel</label>
                <select id="professional_status_upon_graduation" name="professional_status_upon_graduation" class="form-select">
                  <option value="">Selectionnez</option>
                  <option value="Chomage" ${user?.professional_status_upon_graduation === 'Chomage' ? 'selected' : ''}>Chomage</option>
                  <option value="En stage" ${user?.professional_status_upon_graduation === 'En stage' ? 'selected' : ''}>En stage</option>
                  <option value="Employe" ${user?.professional_status_upon_graduation === 'Employe' ? 'selected' : ''}>Employe</option>
                  <option value="Propre chef" ${user?.professional_status_upon_graduation === 'Propre chef' ? 'selected' : ''}>Propre chef</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="address_upon_graduation">Adresse a la Sortie</label>
                <input
                  type="text"
                  id="address_upon_graduation"
                  name="address_upon_graduation"
                  class="form-input"
                  placeholder="Adresse de residence"
                  value="${user?.address_upon_graduation || ''}"
                >
              </div>

              <div class="form-group">
                <label class="form-label" for="marital_satus">Situation Matrimoniale</label>
                <select id="marital_satus" name="marital_satus" class="form-select">
                  <option value="">Selectionnez</option>
                  <option value="Celibataire" ${user?.marital_satus === 'Celibataire' ? 'selected' : ''}>Celibataire</option>
                  <option value="Marie" ${user?.marital_satus === 'Marie' ? 'selected' : ''}>Marie</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="fetal_status">Statut Familial</label>
                <input
                  type="text"
                  id="fetal_status"
                  name="fetal_status"
                  class="form-input"
                  placeholder="Ex: Avec enfants, Sans charge"
                  value="${user?.fetal_status || ''}"
                >
              </div>

              <div class="form-group full-width">
                <label class="form-label" for="skills_acquired_upon_completion_of_the_program">Competences Acquises</label>
                <textarea
                  id="skills_acquired_upon_completion_of_the_program"
                  name="skills_acquired_upon_completion_of_the_program"
                  class="form-textarea"
                  placeholder="Decrivez les competences acquises a la fin du programme..."
                >${user?.skills_acquired_upon_completion_of_the_program || ''}</textarea>
              </div>

              <div class="form-group full-width">
                <label class="form-label" for="contact">Contact</label>
                <input
                  type="number"
                  id="contact"
                  name="contact"
                  class="form-input"
                  placeholder="ID du contact"
                  value="${user?.contact || ''}"
                >
              </div>

              <div class="form-group full-width">
                <label class="form-label" for="parent_contact">Contact Parents</label>
                <input
                  type="number"
                  id="parent_contact"
                  name="parent_contact"
                  class="form-input"
                  placeholder="ID du contact parental"
                  value="${user?.parent_contact || ''}"
                >
              </div>
            </div>
          </div>

          <!-- Evaluation Section -->
          <div class="form-section">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Evaluation
            </h3>

            <div class="form-grid">
              <div class="form-group full-width">
                <label class="form-label" for="impact_evaluation">Evaluation d'Impact</label>
                <textarea
                  id="impact_evaluation"
                  name="impact_evaluation"
                  class="form-textarea"
                  placeholder="Decrivez l'impact du programme sur le beneficiaire..."
                >${user?.impact_evaluation || ''}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label" for="impact_score">Score d'Impact</label>
                <div class="form-range-container">
                  <div class="form-range-header">
                    <span>0</span>
                    <span class="form-range-value" id="impact_score_value">${user?.impact_score || 50}</span>
                    <span>100</span>
                  </div>
                  <input
                    type="range"
                    id="impact_score"
                    name="impact_score"
                    class="form-range"
                    min="0"
                    max="100"
                    value="${user?.impact_score || 50}"
                  >
                </div>
              </div>

              <div class="form-group">
                <label class="form-check">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    class="form-check-input"
                    ${user?.is_active !== 0 ? 'checked' : ''}
                  >
                  <span class="form-check-label">Beneficiaire actif</span>
                </label>
                <span class="form-hint">Decochez si le beneficiaire a quitte le programme</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-footer">
          <button type="button" class="btn btn-outline" data-action="cancel">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            ${isEdit ? 'Enregistrer les modifications' : 'Creer le beneficiaire'}
          </button>
        </div>
      </form>
    </div>
  `;
}

/**
 * Handle form submission (legacy, now handled in renderer.js)
 */
export function handleUserFormSubmit(e) {
  // This is now handled in the main renderer.js
}
