import pool from '../db.js'; 

export const getAllDepartments = async () => {
    try {
        const res = await pool.query('SELECT * FROM departments');
        return res.rows;
    } catch (err) {
        console.error('❌ Error retrieving departments:', err.message);
        throw err;
    }
};

export const getAllRoles = async () => {
    try {
        const res = await pool.query(
            `SELECT roles.id, roles.title, roles.salary, departments.name AS department
             FROM roles 
             JOIN departments ON roles.department_id = departments.id`
        );
        return res.rows;
    } catch (err) {
        console.error('❌ Error retrieving roles:', err.message);
        throw err;
    }
};

export const getAllEmployees = async () => {
    try {
        const res = await pool.query(
            `SELECT employees.id, employees.first_name, employees.last_name, roles.title, 
                    departments.name AS department, roles.salary, 
                    CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
             FROM employees 
             JOIN roles ON employees.role_id = roles.id 
             JOIN departments ON roles.department_id = departments.id 
             LEFT JOIN employees AS manager ON employees.manager_id = manager.id`
        );
        return res.rows;
    } catch (err) {
        console.error('❌ Error retrieving employees:', err.message);
        throw err;
    }
};
