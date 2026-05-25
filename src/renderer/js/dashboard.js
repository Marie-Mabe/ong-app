/**
 * Dashboard View
 */

export async function renderDashboard() {
  try {
    const stats = await window.api.getStats();

    const genderTotal = stats.genderStats.Masculin + stats.genderStats['Feminin'] + stats.genderStats.Autre;
    const housingTotal = stats.housingStats.Stable + stats.housingStats['Precaire'] + stats.housingStats['Hebergement collectif'];
    const professionalTotal = (stats.professionalStats?.Chomage || 0) + (stats.professionalStats?.['En stage'] || 0) + (stats.professionalStats?.Employe || 0) + (stats.professionalStats?.['Propre chef'] || 0);

    return `
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <h1 class="welcome-title">Bienvenue sur le Dashboard</h1>
        <p class="welcome-text">
          Gerez efficacement les beneficiaires de CDE LA MOISSON.
          Consultez les statistiques et suivez l'evolution de vos actions.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Total Beneficiaires</div>
            <div class="stat-value">${stats.total}</div>
            <div class="stat-subvalue">Inscrits dans le systeme</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Beneficiaires Actifs</div>
            <div class="stat-value">${stats.active}</div>
            <div class="stat-subvalue">${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% du total</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon inactive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Beneficiaires Inactifs</div>
            <div class="stat-value">${stats.inactive}</div>
            <div class="stat-subvalue">${stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% du total</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon gender">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12" />
              <path d="M6 12h12" />
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Repartition Genre</div>
            <div class="stat-value">${stats.genderStats.Masculin}/${stats.genderStats['Feminin']}</div>
            <div class="stat-subvalue">Masculin / Feminin</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Gender Distribution -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Repartition par Genre</h3>
          </div>
          <div class="chart-content">
            <div class="distribution-list">
              <div class="distribution-item">
                <div class="distribution-header">
                  <span class="distribution-label">Masculin</span>
                  <span class="distribution-value">${stats.genderStats.Masculin}</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill primary" style="width: ${genderTotal > 0 ? (stats.genderStats.Masculin / genderTotal) * 100 : 0}%"></div>
                </div>
              </div>

              <div class="distribution-item">
                <div class="distribution-header">
                  <span class="distribution-label">Feminin</span>
                  <span class="distribution-value">${stats.genderStats['Feminin'] || 0}</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill accent" style="width: ${genderTotal > 0 ? ((stats.genderStats['Feminin'] || 0) / genderTotal) * 100 : 0}%"></div>
                </div>
              </div>

            
            </div>
          </div>
        </div>

        <!-- Housing Distribution -->
      
        <!-- Professional Status Distribution -->
        ${stats.professionalStats ? `
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Repartition par Situation Professionnelle</h3>
          </div>
          <div class="chart-content">
            <div class="distribution-list">
              <div class="distribution-item">
                <div class="distribution-header">
                  <span class="distribution-label">Employe</span>
                  <span class="distribution-value">${stats.professionalStats.Employe || 0}</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill success" style="width: ${professionalTotal > 0 ? ((stats.professionalStats.Employe || 0) / professionalTotal) * 100 : 0}%"></div>
                </div>
              </div>

              <div class="distribution-item">
                <div class="distribution-header">
                  <span class="distribution-label">Propre chef</span>
                  <span class="distribution-value">${stats.professionalStats['Propre chef'] || 0}</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill primary" style="width: ${professionalTotal > 0 ? ((stats.professionalStats['Propre chef'] || 0) / professionalTotal) * 100 : 0}%"></div>
                </div>
              </div>

              <div class="distribution-item">
                <div class="distribution-header">
                  <span class="distribution-label">En stage</span>
                  <span class="distribution-value">${stats.professionalStats['En stage'] || 0}</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill accent" style="width: ${professionalTotal > 0 ? ((stats.professionalStats['En stage'] || 0) / professionalTotal) * 100 : 0}%"></div>
                </div>
              </div>

              <div class="distribution-item">
                <div class="distribution-header">
                  <span class="distribution-label">Chomage</span>
                  <span class="distribution-value">${stats.professionalStats.Chomage || 0}</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill danger" style="width: ${professionalTotal > 0 ? ((stats.professionalStats.Chomage || 0) / professionalTotal) * 100 : 0}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    return `
      <div class="alert alert-danger">
        Erreur lors du chargement des statistiques: ${error.message}
      </div>
    `;
  }
}
