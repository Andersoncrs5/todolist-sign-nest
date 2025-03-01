# Task Management API

This project is a task management API built with NestJS, utilizing TypeORM for database interaction and PostgreSQL version 17.2 as the relational database. The API provides endpoints for creating, updating, deleting, and retrieving tasks. Additionally, it includes features such as user authentication with password encryption, protection against XSS attacks, and data validation.

## Features

Task Management: CRUD operations for tasks.

User Authentication: Password encryption for secure login and registration.

XSS Protection: Protection against cross-site scripting attacks using sanitize-html.

Data Validation: Input validation with class-validator and transformation with class-transformer.

API Documentation: Interactive API documentation generated with Swagger.

Fastify: Fast and low-overhead HTTP platform for better performance.

## Technologies Used

NestJS: A progressive Node.js framework for building efficient and scalable server-side applications.

TypeORM: An ORM for Node.js and TypeScript, used to interact with the PostgreSQL database.

PostgreSQL 17.2: A powerful, open-source relational database system used to store task data and user information.

Swagger: Automatically generated and interactive API documentation for easy testing and usage.

Fastify: A high-performance HTTP framework that serves as the platform for the API.

Password Encryption: Passwords are encrypted using modern hashing algorithms for enhanced security.

sanitize-html: Used to protect the application from XSS (Cross-Site Scripting) attacks by sanitizing user inputs.

class-validator: A library for class-based validation of data objects.

class-transformer: A library used in combination with class-validator for transforming and validating input data.


## How to Run the Project

Step 1: Clone the repository

    git clone https://github.com/Andersoncrs5/todolist-sign-nest.git
    cd task-management-api

Step 2: Install dependencies

    npm install

Step 3: Configure the Database

Ensure you have a PostgreSQL database set up. Configure the connection in the ormconfig.json or in the environment variables.

Step 4: Run the application

    npm run start:dev
    
Your API will be available at http://localhost:3000.

API Documentation
The API is documented using Swagger, and you can access the interactive documentation at:

  http://localhost:3000/api
