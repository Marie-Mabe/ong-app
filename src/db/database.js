import path from 'path';
import { app } from 'electron';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const Database = app.isPackaged
    ? require(path.join(
        process.resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        'better-sqlite3'
    ))
    : require('better-sqlite3');

class AppDatabase {
    constructor() {
        const dbPath = path.join(app.getPath('userData'), 'app_database.sqlite3');
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        this.initialize();
    }

    initialize() {
        this.db.exec(`
      -- TABLE PRINCIPALE : USERS
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          gender TEXT CHECK (gender IN ('Masculin', 'Féminin', 'Autre')),
          birth_date DATE NOT NULL,
          entry_date DATE NOT NULL,
          exit_date DATE,
          cde_number INTEGER,
          residence TEXT,
          education_level TEXT CHECK (
              education_level IN ('Aucun', 'Primaire', 'Secondaire', 'Professionnel', 'Universitaire')
          ),
          housing_type TEXT CHECK (
              housing_type IN ('Stable', 'Précaire', 'Hébergement collectif')
          ),
          family_situation TEXT,
          impact_evaluation TEXT,
          impact_score INTEGER CHECK (impact_score BETWEEN 0 AND 100),
          is_active BOOLEAN DEFAULT 1,
          contact INTEGER,
          parent_contact INTEGER, 
          diploma_obtained_upon_graduation TEXT, 
          professional_status_upon_graduation CHECK (
               professional_status_upon_graduation IN ('Chomage', 'En stage', 'Employe', 'Propre chef') 
          ),
          address_upon_graduation TEXT, 
          marital_satus CHECK (
               marital_satus IN ('Celibataire', 'Marie') 
          ),
          fetal_status TEXT, 
          skills_acquired_upon_completion_of_the_program TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          CHECK (exit_date IS NULL OR exit_date >= entry_date),
          CHECK (birth_date < entry_date)
      );

      -- CONTACTS
      CREATE TABLE IF NOT EXISTS user_contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          contact_type TEXT NOT NULL CHECK (
              contact_type IN ('Téléphone', 'Email', 'Adresse', 'Urgence')
          ),
          label TEXT,
          value TEXT NOT NULL,
          is_primary BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- INSTITUTIONS
      CREATE TABLE IF NOT EXISTS user_institutions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          institution_name TEXT NOT NULL,
          institution_type TEXT CHECK (
              institution_type IN ('École', 'Formation', 'Entreprise', 'Centre de soins', 'Autre')
          ),
          start_date DATE,
          end_date DATE,
          status TEXT CHECK (status IN ('En cours', 'Terminé', 'Abandonné')),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CHECK (end_date IS NULL OR end_date >= start_date)
      );

      -- ÉDUCATION DES PARENTS
      CREATE TABLE IF NOT EXISTS parent_education (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          parent_type TEXT NOT NULL CHECK (parent_type IN ('Père', 'Mère', 'Tuteur')),
          education_level TEXT CHECK (
              education_level IN ('Aucun', 'Primaire', 'Secondaire', 'Professionnel', 'Universitaire', 'Inconnu')
          ),
          occupation TEXT,
          is_alive BOOLEAN,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- SERVICES ESSENTIELS
      CREATE TABLE IF NOT EXISTS essential_services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          service_type TEXT NOT NULL CHECK (
              service_type IN ('Eau', 'Électricité', 'Santé', 'Transport', 'Alimentation', 'Éducation')
          ),
          has_access BOOLEAN DEFAULT 0,
          access_quality TEXT CHECK (access_quality IN ('Bon', 'Moyen', 'Faible', 'Inexistant')),
          notes TEXT,
          assessed_at DATE DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- HISTORIQUE MÉDICAL
      CREATE TABLE IF NOT EXISTS medical_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          condition_type TEXT NOT NULL,
          description TEXT NOT NULL,
          diagnosis_date DATE,
          is_chronic BOOLEAN DEFAULT 0,
          is_resolved BOOLEAN DEFAULT 0,
          severity TEXT CHECK (severity IN ('Légère', 'Modérée', 'Sévère')),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- SUIVI MÉDICAL
      CREATE TABLE IF NOT EXISTS medical_followup (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          followup_date DATE NOT NULL,
          provider_name TEXT,
          provider_type TEXT CHECK (
              provider_type IN ('Médecin généraliste', 'Spécialiste', 'Hôpital', 'Psychologue', 'Autre')
          ),
          reason TEXT NOT NULL,
          diagnosis TEXT,
          treatment TEXT,
          next_appointment DATE,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- PRÉSENCE
      CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          attendance_date DATE NOT NULL,
          status TEXT NOT NULL CHECK (
              status IN ('Présent', 'Absent justifié', 'Absent non justifié', 'Retard')
          ),
          activity_type TEXT,
          duration_minutes INTEGER,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(user_id, attendance_date, activity_type)
      );

      -- RÉFÉRENTS
      CREATE TABLE IF NOT EXISTS referents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          referent_name TEXT NOT NULL,
          referent_role TEXT NOT NULL CHECK (
              referent_role IN ('Travailleur social', 'Éducateur', 'Psychologue', 'Mentor', 'Tuteur', 'Autre')
          ),
          organization TEXT,
          phone TEXT,
          email TEXT,
          is_primary BOOLEAN DEFAULT 0,
          assignment_date DATE DEFAULT CURRENT_TIMESTAMP,
          end_date DATE,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CHECK (end_date IS NULL OR end_date >= assignment_date)
      );

      -- INDEX
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
      CREATE INDEX IF NOT EXISTS idx_users_entry_date ON users(entry_date);
      CREATE INDEX IF NOT EXISTS idx_contacts_user ON user_contacts(user_id);
      CREATE INDEX IF NOT EXISTS idx_institutions_user ON user_institutions(user_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, attendance_date);
      CREATE INDEX IF NOT EXISTS idx_medical_followup_user ON medical_followup(user_id);
      CREATE INDEX IF NOT EXISTS idx_referents_user ON referents(user_id);

      -- TRIGGERS
      CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
      AFTER UPDATE ON users
      BEGIN
          UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

        // Migration: Add missing columns if they don't exist
        this.migrateDatabase();
    }

    migrateDatabase() {
        try {
            const columnsToAdd = [
                { name: 'contact', type: 'INTEGER', default: null },
                { name: 'parent_contact', type: 'INTEGER', default: null },
                { name: 'diploma_obtained_upon_graduation', type: 'TEXT', default: null },
                { name: 'professional_status_upon_graduation', type: 'TEXT', default: null },
                { name: 'address_upon_graduation', type: 'TEXT', default: null },
                { name: 'marital_satus', type: 'TEXT', default: null },
                { name: 'fetal_status', type: 'TEXT', default: null },
                { name: 'skills_acquired_upon_completion_of_the_program', type: 'TEXT', default: null },
            ];

            const tableInfo = this.db.prepare("PRAGMA table_info(users)").all();
            const existingColumns = tableInfo.map(col => col.name);

            for (const column of columnsToAdd) {
                if (!existingColumns.includes(column.name)) {
                    const defaultClause = column.default !== null ? `DEFAULT ${column.default}` : '';
                    this.db.exec(`ALTER TABLE users ADD COLUMN ${column.name} ${column.type} ${defaultClause}`);
                    console.log(`Added column: ${column.name}`);
                }
            }
        } catch (error) {
            console.error('Migration error:', error);
        }
    }

    // ==========================================
    // USERS CRUD
    // ==========================================

    createUser(user) {
        const stmt = this.db.prepare(`
      INSERT INTO users (
        first_name, last_name, gender, birth_date, entry_date, exit_date,
        cde_number, residence, education_level, housing_type, family_situation,
        impact_evaluation, impact_score, is_active, contact, parent_contact, 
        diploma_obtained_upon_graduation, professional_status_upon_graduation,
        address_upon_graduation, marital_satus, fetal_status, skills_acquired_upon_completion_of_the_program
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            user.first_name,
            user.last_name,
            user.gender || null,
            user.birth_date,
            user.entry_date,
            user.exit_date || null,
            user.cde_number || null,
            user.residence || null,
            user.education_level || null,
            user.housing_type || null,
            user.family_situation || null,
            user.impact_evaluation || null,
            user.impact_score || null,
            user.is_active !== undefined ? user.is_active : 1,
            user.contact || null,
            user.parent_contact || null,
            user.diploma_obtained_upon_graduation || null,
            user.professional_status_upon_graduation || null,
            user.address_upon_graduation || null,
            user.marital_satus || null,
            user.fetal_status || null,
            user.skills_acquired_upon_completion_of_the_program || null,
        );

        return result.lastInsertRowid;
    }

    getUser(id) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    }

    getAllUsers(activeOnly = false) {
        const query = activeOnly
            ? 'SELECT * FROM users WHERE is_active = 1 ORDER BY last_name, first_name'
            : 'SELECT * FROM users ORDER BY last_name, first_name';
        return this.db.prepare(query).all();
    }

    updateUser(id, user) {
        const fields = Object.keys(user).filter(k => k !== 'id');
        if (fields.length === 0) return false;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => user[f]);

        const stmt = this.db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
        const result = stmt.run(...values, id);

        return result.changes > 0;
    }

    deleteUser(id) {
        const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    deactivateUser(id) {
        return this.updateUser(id, { is_active: 0 });
    }

    // ==========================================
    // CONTACTS CRUD
    // ==========================================

    createContact(contact) {
        const stmt = this.db.prepare(`
      INSERT INTO user_contacts (user_id, contact_type, label, value, is_primary)
      VALUES (?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            contact.user_id,
            contact.contact_type,
            contact.label || null,
            contact.value,
            contact.is_primary || 0
        );

        return result.lastInsertRowid;
    }

    getContactsByUser(userId) {
        const stmt = this.db.prepare('SELECT * FROM user_contacts WHERE user_id = ?');
        return stmt.all(userId);
    }

    updateContact(id, contact) {
        const fields = Object.keys(contact).filter(k => k !== 'id' && k !== 'user_id');
        if (fields.length === 0) return false;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => contact[f]);

        const stmt = this.db.prepare(`UPDATE user_contacts SET ${setClause} WHERE id = ?`);
        const result = stmt.run(...values, id);

        return result.changes > 0;
    }

    deleteContact(id) {
        const stmt = this.db.prepare('DELETE FROM user_contacts WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // ==========================================
    // INSTITUTIONS CRUD
    // ==========================================

    createInstitution(institution) {
        const stmt = this.db.prepare(`
      INSERT INTO user_institutions (
        user_id, institution_name, institution_type, start_date, 
        end_date, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            institution.user_id,
            institution.institution_name,
            institution.institution_type || null,
            institution.start_date || null,
            institution.end_date || null,
            institution.status || null,
            institution.notes || null
        );

        return result.lastInsertRowid;
    }

    getInstitutionsByUser(userId) {
        const stmt = this.db.prepare('SELECT * FROM user_institutions WHERE user_id = ? ORDER BY start_date DESC');
        return stmt.all(userId);
    }

    updateInstitution(id, institution) {
        const fields = Object.keys(institution).filter(k => k !== 'id' && k !== 'user_id');
        if (fields.length === 0) return false;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => institution[f]);

        const stmt = this.db.prepare(`UPDATE user_institutions SET ${setClause} WHERE id = ?`);
        const result = stmt.run(...values, id);

        return result.changes > 0;
    }

    deleteInstitution(id) {
        const stmt = this.db.prepare('DELETE FROM user_institutions WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // ==========================================
    // PARENT EDUCATION CRUD
    // ==========================================

    createParentEducation(parentEd) {
        const stmt = this.db.prepare(`
      INSERT INTO parent_education (user_id, parent_type, education_level, occupation, is_alive)
      VALUES (?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            parentEd.user_id,
            parentEd.parent_type,
            parentEd.education_level || null,
            parentEd.occupation || null,
            parentEd.is_alive !== undefined ? parentEd.is_alive : null
        );

        return result.lastInsertRowid;
    }

    getParentEducationByUser(userId) {
        const stmt = this.db.prepare('SELECT * FROM parent_education WHERE user_id = ?');
        return stmt.all(userId);
    }

    updateParentEducation(id, parentEd) {
        const fields = Object.keys(parentEd).filter(k => k !== 'id' && k !== 'user_id');
        if (fields.length === 0) return false;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => parentEd[f]);

        const stmt = this.db.prepare(`UPDATE parent_education SET ${setClause} WHERE id = ?`);
        const result = stmt.run(...values, id);

        return result.changes > 0;
    }

    deleteParentEducation(id) {
        const stmt = this.db.prepare('DELETE FROM parent_education WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // ==========================================
    // ESSENTIAL SERVICES CRUD
    // ==========================================

    createEssentialService(service) {
        const stmt = this.db.prepare(`
      INSERT INTO essential_services (
        user_id, service_type, has_access, access_quality, notes, assessed_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            service.user_id,
            service.service_type,
            service.has_access || 0,
            service.access_quality || null,
            service.notes || null,
            service.assessed_at || null
        );

        return result.lastInsertRowid;
    }

    getEssentialServicesByUser(userId) {
        const stmt = this.db.prepare('SELECT * FROM essential_services WHERE user_id = ? ORDER BY assessed_at DESC');
        return stmt.all(userId);
    }

    updateEssentialService(id, service) {
        const fields = Object.keys(service).filter(k => k !== 'id' && k !== 'user_id');
        if (fields.length === 0) return false;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => service[f]);

        const stmt = this.db.prepare(`UPDATE essential_services SET ${setClause} WHERE id = ?`);
        const result = stmt.run(...values, id);

        return result.changes > 0;
    }

    deleteEssentialService(id) {
        const stmt = this.db.prepare('DELETE FROM essential_services WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // ==========================================
    // MEDICAL HISTORY CRUD
    // ==========================================

    createMedicalHistory(history) {
        const stmt = this.db.prepare(`
      INSERT INTO medical_history (
        user_id, condition_type, description, diagnosis_date, 
        is_chronic, is_resolved, severity, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            history.user_id,
            history.condition_type,
            history.description,
            history.diagnosis_date || null,
            history.is_chronic || 0,
            history.is_resolved || 0,
            history.severity || null,
            history.notes || null
        );

        return result.lastInsertRowid;
    }

    getMedicalHistoryByUser(userId) {
        const stmt = this.db.prepare('SELECT * FROM medical_history WHERE user_id = ? ORDER BY diagnosis_date DESC');
        return stmt.all(userId);
    }

    updateMedicalHistory(id, history) {
        const fields = Object.keys(history).filter(k => k !== 'id' && k !== 'user_id');
        if (fields.length === 0) return false;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => history[f]);

        const stmt = this.db.prepare(`UPDATE medical_history SET ${setClause} WHERE id = ?`);
        const result = stmt.run(...values, id);

        return result.changes > 0;
    }

    deleteMedicalHistory(id) {
        const stmt = this.db.prepare('DELETE FROM medical_history WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // ==========================================
    // MEDICAL FOLLOWUP CRUD
    // ==========================================

    createMedicalFollowup(followup) {
        const stmt = this.db.prepare(`
      INSERT INTO medical_followup (
        user_id, followup_date, provider_name, provider_type, 
        reason, diagnosis, treatment, next_appointment, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            followup.user_id,
            followup.followup_date,
            followup.provider_name || null,
            followup.provider_type || null,
            followup.reason,
            followup.diagnosis || null,
            followup.treatment || null,
            followup.next_appointment || null,
            followup.notes || null
        );

        return result.lastInsertRowid;
    }

    getMedicalFollowupByUser(userId) {
        const stmt = this.db.prepare('SELECT * FROM medical_followup WHERE user_id = ? ORDER BY followup_date DESC');
        return stmt.all(userId);
    }

    updateMedicalFollowup(id, followup) {
        const fields = Object.keys(followup).filter(k => k !== 'id' && k !== 'user_id');
        if (fields.length === 0) return false;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => followup[f]);

        const stmt = this.db.prepare(`UPDATE medical_followup SET ${setClause} WHERE id = ?`);
        const result = stmt.run(...values, id);

        return result.changes > 0;
    }

    deleteMedicalFollowup(id) {
        const stmt = this.db.prepare('DELETE FROM medical_followup WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // ==========================================
    // ATTENDANCE CRUD
    // ==========================================

    createAttendance(attendance) {
        const stmt = this.db.prepare(`
      INSERT INTO attendance (
        user_id, attendance_date, status, activity_type, duration_minutes, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            attendance.user_id,
            attendance.attendance_date,
            attendance.status,
            attendance.activity_type || null,
            attendance.duration_minutes || null,
            attendance.notes || null
        );

        return result.lastInsertRowid;
    }

    getAttendanceByUser(userId, startDate = null, endDate = null) {
        let query = 'SELECT * FROM attendance WHERE user_id = ?';
        const params = [userId];

        if (startDate) {
            query += ' AND attendance_date >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND attendance_date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY attendance_date DESC';

        const stmt = this.db.prepare(query);
        return stmt.all(...params);
    }

    updateAttendance(id, attendance) {
        const fields = Object.keys(attendance).filter(k => k !== 'id' && k !== 'user_id');
        if (fields.length === 0) return false;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => attendance[f]);

        const stmt = this.db.prepare(`UPDATE attendance SET ${setClause} WHERE id = ?`);
        const result = stmt.run(...values, id);

        return result.changes > 0;
    }

    deleteAttendance(id) {
        const stmt = this.db.prepare('DELETE FROM attendance WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // ==========================================
    // REFERENTS CRUD
    // ==========================================

    createReferent(referent) {
        const stmt = this.db.prepare(`
      INSERT INTO referents (
        user_id, referent_name, referent_role, organization, 
        phone, email, is_primary, assignment_date, end_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            referent.user_id,
            referent.referent_name,
            referent.referent_role,
            referent.organization || null,
            referent.phone || null,
            referent.email || null,
            referent.is_primary || 0,
            referent.assignment_date || null,
            referent.end_date || null,
            referent.notes || null
        );

        return result.lastInsertRowid;
    }

    getReferentsByUser(userId, activeOnly = false) {
        let query = 'SELECT * FROM referents WHERE user_id = ?';
        if (activeOnly) {
            query += ' AND end_date IS NULL';
        }
        query += ' ORDER BY is_primary DESC, assignment_date DESC';

        const stmt = this.db.prepare(query);
        return stmt.all(userId);
    }

    updateReferent(id, referent) {
        const fields = Object.keys(referent).filter(k => k !== 'id' && k !== 'user_id');
        if (fields.length === 0) return false;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => referent[f]);

        const stmt = this.db.prepare(`UPDATE referents SET ${setClause} WHERE id = ?`);
        const result = stmt.run(...values, id);

        return result.changes > 0;
    }

    deleteReferent(id) {
        const stmt = this.db.prepare('DELETE FROM referents WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    getUserFullProfile(userId) {
        const user = this.getUser(userId);
        if (!user) return null;

        return {
            user,
            contacts: this.getContactsByUser(userId),
            institutions: this.getInstitutionsByUser(userId),
            parentEducation: this.getParentEducationByUser(userId),
            essentialServices: this.getEssentialServicesByUser(userId),
            medicalHistory: this.getMedicalHistoryByUser(userId),
            medicalFollowup: this.getMedicalFollowupByUser(userId),
            attendance: this.getAttendanceByUser(userId),
            referents: this.getReferentsByUser(userId, true)
        };
    }

    searchUsers(searchTerm) {
        const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE first_name LIKE ? OR last_name LIKE ? OR residence LIKE ?
      ORDER BY last_name, first_name
    `);
        const term = `%${searchTerm}%`;
        return stmt.all(term, term, term);
    }

    getAttendanceStats(userId, startDate, endDate) {
        const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Présent' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Absent justifié' THEN 1 ELSE 0 END) as absent_justified,
        SUM(CASE WHEN status = 'Absent non justifié' THEN 1 ELSE 0 END) as absent_unjustified,
        SUM(CASE WHEN status = 'Retard' THEN 1 ELSE 0 END) as late,
        SUM(duration_minutes) as total_minutes
      FROM attendance
      WHERE user_id = ? AND attendance_date BETWEEN ? AND ?
    `);

        return stmt.get(userId, startDate, endDate);
    }

    getUsersByHousingType(housingType) {
        const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE housing_type = ? AND is_active = 1
      ORDER BY last_name, first_name
    `);
        return stmt.all(housingType);
    }

    getUsersNeedingMedicalCheckup(monthsThreshold = 6) {
        const stmt = this.db.prepare(`
      SELECT u.*
      FROM users u
      LEFT JOIN medical_followup mf ON u.id = mf.user_id
      WHERE u.is_active = 1
      GROUP BY u.id
      HAVING MAX(mf.followup_date) < date('now', '-${monthsThreshold} months') 
         OR MAX(mf.followup_date) IS NULL
      ORDER BY u.last_name, u.first_name
    `);
        return stmt.all();
    }

    getMonthlyAttendanceReport(year, month) {
        const stmt = this.db.prepare(`
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as full_name,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'Présent' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status LIKE 'Absent%' THEN 1 ELSE 0 END) as absent_days,
        ROUND(SUM(CASE WHEN a.status = 'Présent' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id), 2) as attendance_rate
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id 
        AND strftime('%Y', a.attendance_date) = ?
        AND strftime('%m', a.attendance_date) = ?
      WHERE u.is_active = 1
      GROUP BY u.id
      ORDER BY attendance_rate DESC
    `);

        return stmt.all(year.toString(), month.toString().padStart(2, '0'));
    }

    close() {
        this.db.close();
    }
}

export default AppDatabase;