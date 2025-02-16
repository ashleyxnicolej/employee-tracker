import inquirer from 'inquirer';
import pool from './db.js';
import * as fs from 'fs';        
import path from 'path';    
import dotenv from 'dotenv';
dotenv.config();         

// Global error handlers
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:', error);
    mainMenu();
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    mainMenu();
});

// Error handling wrapper
const withErrorHandling = async (operation, callback) => {
    try {
        await callback();
    } catch (error) {
        console.error(`❌ Error during ${operation}:`, error.message);
        return mainMenu();
    }
};

// Main menu function with async/await
async function mainMenu() {
    try {
        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: [
                    'View all Departments',
                    'View Department Budget',
                    'View all Roles',
                    'View all Employees',
                    'View Employees by Department',
                    'View Employees by Manager',
                    'Add a Department',
                    'Add a Role',
                    'Add an Employee',
                    'Update an Employee Role',
                    'Update an Employee Manager',
                    'Delete a Department',
                    'Delete a Role',
                    'Delete an Employee',
                    'Exit'
                ]
            }
        ]);

        await withErrorHandling(answer.choice, async () => {
            switch (answer.choice) {
                case 'View all Departments':
                    await viewDepartments();
                    break;
                case 'View all Roles':
                    await viewRoles();
                    break;
                case 'View all Employees':
                    await viewEmployees();
                    break;
                case 'Add a Department':
                    await addDepartment();
                    break;
                case 'Add a Role':
                    await addRole();
                    break;
                case 'Add an Employee':
                    await addEmployee();
                    break;
                case 'Update an Employee Role':
                    await updateEmployeeRole();
                    break;
                case 'Update an Employee Manager':
                    await updateEmployeeManager();
                    break;
                case 'View Employees by Manager':
                    await viewEmployeesByManager();
                    break;
                case 'View Employees by Department':
                    await viewEmployeesByDepartment();
                    break;
                case 'Delete a Department':
                    await deleteDepartment();
                    break;
                case 'Delete a Role':
                    await deleteRole();
                    break;
                case 'Delete an Employee':
                    await deleteEmployee();
                    break;
                case 'View Department Budget':
                    await viewDepartmentBudget();
                    break;
                case 'Exit':
                    await gracefulExit();
                    break;
            }
        });
    } catch (error) {
        console.error('❌ Error in main menu:', error.message);
        await mainMenu();
    }
}

// View Functions
async function viewDepartments() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM departments', (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            console.table(res.rows);
            resolve();
            mainMenu();
        });
    });
}

async function viewDepartmentBudget() {
    try {
        const departments = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM departments', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select a department to view its total budget:',
                choices: departments.rows.map(dept => ({
                    name: dept.name,
                    value: dept.id
                }))
            }
        ]);

        const budget = await new Promise((resolve, reject) => {
            pool.query(
                'SELECT SUM(roles.salary) AS total_budget ' +
                'FROM employees ' +
                'JOIN roles ON employees.role_id = roles.id ' +
                'WHERE roles.department_id = $1',
                [answer.departmentId],
                (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                }
            );
        });

        console.log(`💰 Total Utilized Budget: $${budget.rows[0].total_budget || 0}`);
        return mainMenu();
    } catch (error) {
        console.error('❌ Error calculating budget:', error.message);
        return mainMenu();
    }
}

async function viewRoles() {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT roles.id, roles.title, roles.salary, departments.name AS department ' +
            'FROM roles ' +
            'JOIN departments ON roles.department_id = departments.id',
            (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.table(res.rows);
                resolve();
                mainMenu();
            }
        );
    });
}

async function viewEmployees() {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT employees.id, employees.first_name, employees.last_name, roles.title, ' +
            'departments.name AS department, roles.salary, ' +
            'CONCAT(manager.first_name, \' \', manager.last_name) AS manager ' +
            'FROM employees ' +
            'JOIN roles ON employees.role_id = roles.id ' +
            'JOIN departments ON roles.department_id = departments.id ' +
            'LEFT JOIN employees AS manager ON employees.manager_id = manager.id',
            (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.table(res.rows);
                resolve();
                mainMenu();
            }
        );
    });
}

async function viewEmployeesByDepartment() {
    try {
        const departments = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM departments', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select a department to view its employees:',
                choices: departments.rows.map(dept => ({
                    name: dept.name,
                    value: dept.id
                }))
            }
        ]);

        const employees = await new Promise((resolve, reject) => {
            pool.query(
                'SELECT employees.first_name, employees.last_name ' +
                'FROM employees ' +
                'JOIN roles ON employees.role_id = roles.id ' +
                'WHERE roles.department_id = $1',
                [answer.departmentId],
                (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                }
            );
        });

        if (employees.rows.length === 0) {
            console.log('⚠️ No employees found in this department.');
        } else {
            console.table(employees.rows);
        }
        return mainMenu();
    } catch (error) {
        console.error('❌ Error viewing employees by department:', error.message);
        return mainMenu();
    }
}

async function viewEmployeesByManager() {
    try {
        const managers = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM employees WHERE manager_id IS NOT NULL', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'managerId',
                message: 'Select a manager to view their employees:',
                choices: managers.rows.map(emp => ({
                    name: `${emp.first_name} ${emp.last_name}`,
                    value: emp.id
                }))
            }
        ]);

        const employees = await new Promise((resolve, reject) => {
            pool.query(
                'SELECT first_name, last_name FROM employees WHERE manager_id = $1',
                [answer.managerId],
                (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                }
            );
        });

        if (employees.rows.length === 0) {
            console.log('⚠️ No employees found under this manager.');
        } else {
            console.table(employees.rows);
        }
        return mainMenu();
    } catch (error) {
        console.error('❌ Error viewing employees by manager:', error.message);
        return mainMenu();
    }
}


// Add Functions
async function addEmployee() {
    try {
        const rolesRes = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM roles', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const employeesRes = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM employees', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "Enter the employee's first name:"
            },
            {
                type: 'input',
                name: 'lastName',
                message: "Enter the employee's last name:"
            },
            {
                type: 'list',
                name: 'roleId',
                message: "Select the employee's role:",
                choices: rolesRes.rows.map(role => ({
                    name: role.title,
                    value: role.id
                }))
            },
            {
                type: 'list',
                name: 'managerId',
                message: "Select the employee's manager (or choose 'None'):",
                choices: [{ name: 'None', value: null }].concat(
                    employeesRes.rows.map(employee => ({
                        name: `${employee.first_name} ${employee.last_name}`,
                        value: employee.id
                    }))
                )
            }
        ]);

        await new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                [answer.firstName, answer.lastName, answer.roleId, answer.managerId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('✅ Employee added successfully!');
        return mainMenu();
    } catch (error) {
        console.error('❌ Error adding employee:', error.message);
        return mainMenu();
    }
}

async function addDepartment() {
    try {
        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'departmentName',
                message: 'Enter the name of the new department:'
            }
        ]);

        await new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO departments (name) VALUES ($1)',
                [answer.departmentName],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('✅ Department added successfully!');
        return mainMenu();
    } catch (error) {
        console.error('❌ Error adding department:', error.message);
        return mainMenu();
    }
}

async function addRole() {
    try {
        const departments = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM departments', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'roleTitle',
                message: 'Enter the title of the new role:'
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: 'Enter the salary for this role:'
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department for this role:',
                choices: departments.rows.map(department => ({
                    name: department.name,
                    value: department.id
                }))
            }
        ]);

        await new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)',
                [answer.roleTitle, answer.roleSalary, answer.departmentId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('✅ Role added successfully!');
        return mainMenu();
    } catch (error) {
        console.error('❌ Error adding role:', error.message);
        return mainMenu();
    }
}

// Update Functions
async function updateEmployeeRole() {
    try {
        const employeesRes = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM employees', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const rolesRes = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM roles', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: "Select the employee whose role you want to update:",
                choices: employeesRes.rows.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }))
            },
            {
                type: 'list',
                name: 'newRoleId',
                message: "Select the new role for this employee:",
                choices: rolesRes.rows.map(role => ({
                    name: role.title,
                    value: role.id
                }))
            }
        ]);

        await new Promise((resolve, reject) => {
            pool.query(
                'UPDATE employees SET role_id = $1 WHERE id = $2',
                [answer.newRoleId, answer.employeeId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('✅ Employee role updated successfully!');
        return mainMenu();
    } catch (error) {
        console.error('❌ Error updating employee role:', error.message);
        return mainMenu();
    }
}

async function updateEmployeeManager() {
    try {
        const employees = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM employees', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const employeeChoices = employees.rows.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
        }));

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to update:',
                choices: employeeChoices
            },
            {
                type: 'list',
                name: 'managerId',
                message: 'Select the new manager:',
                choices: [
                    { name: 'None', value: null },
                    ...employeeChoices
                ]
            }
        ]);

        await new Promise((resolve, reject) => {
            pool.query(
                'UPDATE employees SET manager_id = $1 WHERE id = $2',
                [answer.managerId, answer.employeeId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('✅ Employee manager updated successfully!');
        return mainMenu();
    } catch (error) {
        console.error('❌ Error updating employee manager:', error.message);
        return mainMenu();
    }
}


// Delete Functions
async function deleteEmployee() {
    try {
        const employees = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM employees', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to delete:',
                choices: employees.rows.map(employee => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                }))
            }
        ]);

        await new Promise((resolve, reject) => {
            pool.query(
                'DELETE FROM employees WHERE id = $1',
                [answer.employeeId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('✅ Employee deleted successfully!');
        return mainMenu();
    } catch (error) {
        console.error('❌ Error deleting employee:', error.message);
        return mainMenu();
    }
}

async function deleteDepartment() {
    try {
        const departments = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM departments', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department to delete:',
                choices: departments.rows.map(dept => ({
                    name: dept.name,
                    value: dept.id
                }))
            }
        ]);

        await new Promise((resolve, reject) => {
            pool.query(
                'DELETE FROM departments WHERE id = $1',
                [answer.departmentId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('✅ Department deleted successfully!');
        return mainMenu();
    } catch (error) {
        console.error('❌ Error deleting department:', error.message);
        return mainMenu();
    }
}

async function deleteRole() {
    try {
        const roles = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM roles', (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the role to delete:',
                choices: roles.rows.map(role => ({
                    name: role.title,
                    value: role.id
                }))
            }
        ]);

        await new Promise((resolve, reject) => {
            pool.query(
                'DELETE FROM roles WHERE id = $1',
                [answer.roleId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        console.log('✅ Role deleted successfully!');
        return mainMenu();
    } catch (error) {
        console.error('❌ Error deleting role:', error.message);
        return mainMenu();
    }
}

// Graceful Exit Function
async function gracefulExit() {
    console.log('\n✨ Thank you for using the Employee Tracker. Closing the database connection...\n');
    try {
        await new Promise((resolve, reject) => {
            pool.end(err => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('✅ Database connection closed successfully. Goodbye! 👋');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error closing the database connection:', error.message);
        process.exit(1);
    }
}

// Application Initialization
(async () => {
    try {
        console.log('\n🚀 Welcome to the Employee Management System!\n');
        await mainMenu();
    } catch (error) {
        console.error('❌ Fatal application error:', error.message);
        await gracefulExit();
    }
})();

// Export for potential testing
export {
    mainMenu,
    viewDepartments,
    viewRoles,
    viewEmployees,
    addDepartment,
    addRole,
    addEmployee,
    updateEmployeeRole,
    updateEmployeeManager,
    deleteEmployee,
    deleteDepartment,
    deleteRole,
    viewEmployeesByManager,
    viewEmployeesByDepartment,
    viewDepartmentBudget
};
