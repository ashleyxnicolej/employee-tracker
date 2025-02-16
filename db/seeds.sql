INSERT INTO departments (name) 
VALUES 
('Engineering'), 
('Finance'), 
('HR'), 
('Sales')
ON CONFLICT (name) DO NOTHING;


INSERT INTO roles (title, salary, department_id) 
VALUES 
('Software Engineer', 90000, (SELECT id FROM departments WHERE name = 'Engineering')), 
('Accountant', 75000, (SELECT id FROM departments WHERE name = 'Finance')), 
('HR Manager', 80000, (SELECT id FROM departments WHERE name = 'HR')), 
('Sales Representative', 60000, (SELECT id FROM departments WHERE name = 'Sales'))
ON CONFLICT (title) DO NOTHING;

INSERT INTO employees (first_name, last_name, email, salary, hire_date, role_id, manager_id, department_id) 
VALUES 
('Alice', 'Smith', 'alice.smith@email.com', 90000, '2025-02-08', (SELECT id FROM roles WHERE title = 'Software Engineer'), NULL, (SELECT id FROM departments WHERE name = 'Engineering')),
('Bob', 'Brown', 'bob.brown@email.com', 75000, '2025-02-08', (SELECT id FROM roles WHERE title = 'Accountant'), NULL, (SELECT id FROM departments WHERE name = 'Finance')),
('Charlie', 'Davis', 'charlie.davis@email.com', 80000, '2025-02-08', (SELECT id FROM roles WHERE title = 'HR Manager'), (SELECT id FROM employees WHERE first_name = 'Alice' AND last_name = 'Smith'), (SELECT id FROM departments WHERE name = 'HR')),
('Dana', 'Jones', 'dana.jones@email.com', 60000, '2025-02-08', (SELECT id FROM roles WHERE title = 'Sales Representative'), (SELECT id FROM employees WHERE first_name = 'Bob' AND last_name = 'Brown'), (SELECT id FROM departments WHERE name = 'Sales'))
ON CONFLICT (email) DO NOTHING;
