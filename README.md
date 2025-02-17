# Employee Tracker

## Description
A command-line application to manage a company's employee database, using Node.js, Inquirer, and MySQL. This application allows business owners to view and manage departments, roles, and employees in their company to organize and plan their business.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## Installation
1. Clone the repository to your local machine
2. Navigate to the project directory
3. Install the required dependencies:
```bash
npm install
```
4. Set up your MySQL database:
  - Create a .env file in the root directory

  - Add your MySQL credentials:
```bash
DB_NAME='employee_db'
DB_USER='your_username'
DB_PASSWORD='your_password'
```
  - Run the schema and seeds files:
```bash
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seeds.sql
```

## Usage
1. To start the application, run:
```bash
node server.js
```
2. Use arrow keys to navigate through the prompts to:

- View all departments
  
- View all roles
  
- View all employees
  
- Add a department
  
- Add a role
  
- Add an employee
  
- Update an employee role

- Update an employee manager

- Delete an employee

- Delete a department

- Delete a role

- View employees by manager

- View employees by department

- View a department budget


## Features 
- View all departments, roles, and employees

- Add departments, roles, and employees

- Update employee roles

- User-friendly interface with easy-to-follow prompts

- Clean and organized data presentation in tables


## Demo
below is a link to a demo of the application:

https://www.loom.com/share/1620e902532747979bda06f416d29516?sid=f7debc8d-ad61-4730-b9d9-483ed17e712aLinks to an external site.


## Technologies Used 
- Node.js

- MySQL

- Inquirier

- Console.table

- dotenv

- JavaScript


## Database Schema
The database contains three tables:

- department

  - id: INT PRIMARY KEY
  
  - name: VARCHAR(30)
  
- role

  - id: INT PRIMARY KEY

  - title: VARCHAR(30)
  
  - salary: DECIMAL
  
  - department_id: INT
  
- employee

  - id: INT PRIMARY KEY
  
  - first_name: VARCHAR(30)
  
  - last_name: VARCHAR(30)
  
  - role_id: INT
  
  - manager_id: INT


## Contributing 
Contributions are welcome! Please feel free to submit a Pull Request.


## License
This project is licensed under the MIT License - see the LICENSE file for details.


## Questions 
For any additional questions, please reach out to me via:

  GitHub: ashleyxnicolej

  Email: ashleyjackson439@gmail.com
