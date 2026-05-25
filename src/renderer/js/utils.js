/**
 * Utility Functions
 */

/**
 * Format a date string to French locale format
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateStr) {
  if (!dateStr) return '-';

  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a date for input[type="date"]
 * @param {string} dateStr - Date string
 * @returns {string} YYYY-MM-DD format
 */
export function formatDateForInput(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Show a notification toast
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'danger', 'warning', 'info'
 */
export function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.notification-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.className = `notification-toast notification-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;

  // Add styles if not already present
  if (!document.querySelector('#notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
      }

      .notification-success {
        background-color: #059669;
        color: white;
      }

      .notification-danger {
        background-color: #dc2626;
        color: white;
      }

      .notification-warning {
        background-color: #d97706;
        color: white;
      }

      .notification-info {
        background-color: #2563eb;
        color: white;
      }

      .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0.8;
        padding: 0;
        line-height: 1;
      }

      .notification-close:hover {
        opacity: 1;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(toast);

  // Close button handler
  toast.querySelector('.notification-close').addEventListener('click', () => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  });

  // Auto-close after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

/**
 * Calculate age from birth date
 * @param {string} birthDate - Birth date string
 * @returns {number} Age in years
 */
export function calculateAge(birthDate) {
  if (!birthDate) return null;

  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Get initials from name
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string} Initials
 */
export function getInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (!str) return '';

  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
