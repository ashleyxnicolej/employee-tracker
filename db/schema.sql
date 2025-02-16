DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(50) UNIQUE,   -- Added email here to make sure it's inside the CREATE TABLE section
    salary DECIMAL NOT NULL,     -- Added salary column
    hire_date DATE NOT NULL,     -- Added hire_date column
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    manager_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE
);

-- Additional constraints
ALTER TABLE employees ADD CONSTRAINT positive_salary CHECK (salary > 0);
ALTER TABLE employees ADD CONSTRAINT valid_hire_date CHECK (hire_date <= CURRENT_DATE);

CREATE INDEX idx_email ON employees(email);
CREATE INDEX idx_department_id ON employees(department_id);