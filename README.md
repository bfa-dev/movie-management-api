# Movie Management API

## Description

The Movie Management API is a backend application developed with NestJS, purpose-built to manage movies, sessions, and ticketing operations. This project highlights key principles of Domain-Driven Design (DDD), transaction management, and RESTful API design. It leverages PostgreSQL as the database, ensuring robust data handling and integrity across various operations.

## Features
- **User Management**: Secure user authentication and role-based access control.
- **Movie Management**: Create, update, delete, bulk-add, bulk-delete and retrieve movies with session details.
- **Session Management**: Manage movie sessions, including adding and deleting sessions.
- **Ticketing System**: Allow users to buy and use tickets for movie sessions.

## Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v21.7.3)
- PostgreSQL
- Docker (optional for Docker-based setup)

# Sample Application Showcase

- #### `App Initilizer` Flow
    App Initilizer runs when the application starts. It registers an admin manager user using environment variables to the database.
    Its because only manager can create managers and some of the endpoints are protected from customers.
    It also registers a customer just for easy test purposes.

    ```bash
    INITIAL_MANAGER_EMAIL=manager@example.com
    INITIAL_MANAGER_PASSWORD=SecurePassword123!
    INITIAL_MANAGER_USERNAME=manager
    INITIAL_USER_EMAIL=user@example.com
    INITIAL_USER_PASSWORD=SecurePassword123!
    INITIAL_USER_USERNAME=user
    ```

- #### `Swagger Documentation`
    - Swagger Documentation provides example requests and responses of the Movie Management API.

    ![Swagger](./assets/SwaggerUI.jpeg)

- #### `Health` Request/Response Sample:
    - This screenshot demonstrates the application's response to a health probe, indicating that the application is currently running and able to handle requests.

    ![Health](./assets/health.jpeg)

- #### `User Login`
	- Security:
	- •	This endpoint is decorated with the @Public() decorator, meaning no prior authentication is required.
	- •	Uses JWT for securing subsequent requests.
	- •	The @CurrentUser() decorator is used to access the authenticated user’s details in other protected endpoints.
	- Note:
	- •	Use the returned JWT in the Authorization header for future requests.

    ![Check Outdated Dependencies](./assets/login-as-initial-manager.jpeg)

- #### `User Registration`
	- Security:
  - • This endpoint is for customer registeration. Manager registeration is being made from the create-manager endpoint.	
	- •	This endpoint is decorated with the `@Public()` decorator, meaning no prior authentication is required.
	- •	Uses JWT for securing subsequent requests after registration.
	- •	The `@CurrentUser()` decorator is used to access the authenticated user’s details in other protected endpoints.
	- Note:
	- •	Use the returned JWT in the `Authorization` header for future requests.

    ![Register New User](./assets/register-user.jpeg)
    ![Manager Can't Register From the Customer Registration Endpoint](./assets/manager-cant-register.jpeg)

- #### `Create Manager`
	- •	The manager sends a request with the details of the new manager to be created.
	- •	The endpoint checks if a user with the provided email already exists. If not, the new manager is created with the `MANAGER` role.
	- •	A JWT is generated for the newly created manager, and a success message is returned.
	- •	If the email is already in use, an error message is returned, indicating that the user already exists.

    ![Create Manager](./assets/create-manager.jpeg)

- #### `User Profile`
	- •	The user sends a request to retrieve their profile information.
	- •	The endpoint fetches the user's details from the database and returns them.
	- •	A success message is returned along with the user's profile information, including username, email, age, and role.

    ![User Profile](./assets/user-profile.jpeg)

- #### `Bulk Add Movies`
  - @Transactional
	- The Bulk Add Movies endpoint allows authenticated managers to add multiple movies at once in a single transaction. This ensures that all movie additions either succeed together or fail together, maintaining data integrity. 
  - The manager sends a request with the movie details, secured with a JWT in the Authorization header. The endpoint is protected by the @Roles(Role.MANAGER) decorator, ensuring only users with the manager role can perform this action. 
  - The @CurrentUser() decorator verifies the user’s role before the transaction begins. If any part of the bulk operation fails, the entire transaction is rolled back.

    ![Bulk Add Movies](./assets/bulk-add.jpeg)
    ![Bulk Add Movies Conflict](./assets/bulk-add-conflict.jpeg)

- #### `List All Movies`
	- •	The endpoint allows everyone to retrieve a list of all active movies. Optional query parameters can be provided to filter and sort the results based on criteria like movie name, age restriction, or sorting order.
	- •	The request does not require any authentication, making it accessible to anyone.
	- •	The response returns a list of movies that match the provided filters.

    ![List All Movies Sorted By ASC Order](./assets/sort-asc.jpeg)
    ![List All Movies Sorted By DESC Order](./assets/sort-desc.jpeg)

- #### `Get Movie`
	- •	The user sends a request to retrieve details of a specific movie by its ID.
	- •	The endpoint fetches the movie along with its associated sessions from the database.
	- •	If the movie is found, it returns the movie details along with a success message.
	- •	If the movie does not exist, an error message is returned.
	- Note:
	- •	Use this endpoint to fetch detailed information about a movie, including its scheduled sessions.

    ![Get Movie](./assets/get-movie.jpeg)

- #### `Create Movie`
    - @Transactional
	- •	The manager sends a request with the movie details, including any associated sessions.
	- •	The movie and its sessions are created within a single transaction to prevent conflicts, such as overlapping sessions in the same room. If a conflict or error occurs, the entire transaction is rolled back to ensure data consistency.
	- •	Upon successful creation, a success message with the movie details is returned.

    ![Create Movie](./assets/create-movie.jpeg)

- #### `Update Movie`
	- •	The manager sends a request with updated movie details, including any changes to associated sessions.
	- •	Before applying the updates, the endpoint checks if the new session details (date and time for room number) are available to avoid conflicts.
	- •	If the updates are valid, the movie and its sessions are updated accordingly. If there’s a conflict, the update is rejected to maintain data integrity.

    ![Update Movie](./assets/update-movie.jpeg)

- #### `Delete Movie`
	- •	The manager sends a request to delete a movie by its ID.
	- •	The endpoint marks the movie as inactive (soft delete) and also deletes all associated sessions.

    ![Delete Movie](./assets/delete-movie.jpeg)

- #### `Add New Session to a Movie`
	- •	The manager sends a request to add a new session to a specific movie by providing session details like date, time slot, and room number.
	- •	Before adding the session, the endpoint checks if the room is available for the specified date and time slot to avoid conflicts.
	- •	If the session details are valid and no conflicts are found, the session is added to the movie, and a success message is returned.
	- •	If there is a conflict (e.g., the room is already booked), the request is rejected with an error message.

    ![Add New Session](./assets/add-sessions.jpeg)
    ![Add New Session Conflict](./assets/add-sessions-conflict.jpeg)

- #### `Delete Session`
	- •	The manager sends a request to delete a specific session by its ID.
	- •	The endpoint deletes the session if it exists, ensuring that it is no longer available for bookings or ticket purchases.
	- •	A success message is returned upon successful deletion of the session.
	- •	If the session does not exist, an error message is returned.

    ![Delete Session](./assets/delete-session.jpeg)

- #### `Delete All Sessions`
	- •	The manager sends a request to delete all sessions associated with a specific movie by its ID.
	- •	The endpoint deletes all sessions of the movie, ensuring that no future sessions remain scheduled.
	- •	A success message is returned upon successful deletion of all sessions.
	- •	If no sessions are found for the movie, an error message is returned.

    ![Delete All Sessions](./assets/delete-all-sessions.jpeg)

- #### `Buy Ticket`
	- •	The user sends a request to purchase a ticket for a specific movie session by providing the session ID.
	- •	The endpoint checks if the session exists, if the user meets the age restriction, and if the session has not already passed.
	- •	If all conditions are met, the ticket is created and returned to the user.
	- •	A success message is returned along with the ticket details.
	- •	If any condition fails (e.g., session not found, user too young), an error message is returned.

    ![Buy Ticket](./assets/buy-ticket.jpeg)
    ![When User Is Not Old Enough For the Movie](./assets/user-not-old-enough.jpeg)

- #### `Watch Movie`
	- •	The user sends a request to watch a movie using a purchased ticket by providing the ticket ID.
	- •	The endpoint checks if the ticket is valid, belongs to the user, and if the session has not already passed.
	- •	If all checks pass, the ticket is marked as used, and a success message is returned.
	- •	If the ticket is invalid, already used, or does not belong to the user, an error message is returned.

    ![Watch Movie](./assets/watch-movie.jpeg)

- #### `Watch History`
	- •	The user sends a request to retrieve their watch history, which includes all the movies they have watched using their tickets.
	- •	The endpoint fetches the user's used tickets and returns the list of movies they have watched.
	- •	A success message is returned along with the watch history.

    ![Watch History](./assets/watch-history.jpeg)


# Running The Application

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- NodeJS (v21.7.3)
- PostgreSQL

## Installation Steps

Before you begin, ensure that you have `Docker` and `NodeJS (v21.7.3)` installed on your machine. 

- If Docker is not installed, please refer to the official Docker documentation for installation instructions: [Install Docker Desktop on Mac](https://docs.docker.com/desktop/mac/install/) 

- If NodeJS is not installed, please refer to the official NodeJS documentation for installation instructions: [Install NodeJS on Mac](https://nodejs.org/en/download/package-manager) 


```bash
node -v
docker -v
```

### 1. Installing PostgreSQL with Docker

Before you begin, ensure you have the following installed on your system:
- `Docker`
- `Docker Compose`

Redis is an open-source, in-memory data structure store that is used as a database, cache, and message broker. To install Redis using Docker, follow these steps:

```bash
docker compose up db -d              
```

This command will download the PostgreSQL:13 image from Docker Hub and run it in a Docker container named `movie-management-case`

### 2. Verification
To verify that the installations were successful, you can use Docker commands to check the status of the containers:


```bash 
docker ps
```
This command will list all running Docker containers. You should see containers named `movie-management-case` with the image `postgres` in the list.

### 3. Installing Dependencies

To install the project dependencies, navigate to the project directory and run the following command:

```bash
nvm use
```

```bash
npm install
```

### 4. Setting up Environment Variables

To create the `.env` file in the project root directory, you can use the `touch` command:

or use can use

```bash
cp .env.example .env
```

Or you can enter the file and add the following environment variables using a text editor

```plaintext
NODE_ENV=dev
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
TEST_DB_PORT=5433
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=movie-management

DEV_DATABASE_URL=postgresql://user:password@localhost:5432/movie-management
DATABASE_URL=postgresql://user:password@postgres:5432/movie-management
TEST_DATABASE_URL=postgresql://user:password@localhost:5433/movie-management

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION_TIME=1h

INITIAL_MANAGER_EMAIL=manager@example.com
INITIAL_MANAGER_PASSWORD=SecurePassword123!
INITIAL_MANAGER_USERNAME=manager
INITIAL_USER_EMAIL=user@example.com
INITIAL_USER_PASSWORD=SecurePassword123!
INITIAL_USER_USERNAME=user
```

Make sure to replace the values with your own configuration.

### 5. Running the Application

To start the application, run the following command:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

#### - If you are done with here, you can move to [Accessing The Application](#accessing-the-application) section.

# Accessing the Application
Once the containers are up and running, you can access the application at `http://localhost:8080`.

#### Swagger Documentation URL is [http:localhost:8080/api](http:localhost:8080/api)

![Swagger Documentation Interface](./assets/SwaggerUI.jpeg)

## 1. Infrastructure Discovery

- ### 2.1 Inspecting PostgreSQL

  Sample DB content like that:

  ![Movies Content](./assets/db.content.movie.png)

  ![Sessions Content](./assets/db.content.session.png)

  ![Tickets Content](./assets/db.content.ticket.png)

# Running the Tests

```bash
# unit tests
$ npm run test:unit
```

```bash
# unit tests coverage
$ npm run test:cov:unit
````

- ## Unit Tests Coverage:
  ![Unit Test Coverage Content](./assets/unit.test.cov.png)

# The e2e tests are configured to automatically spin up a Dockerized PostgreSQL database specifically for testing purposes. This isolated test environment ensures that your tests run against a clean and consistent database instance, avoiding any interference with your development or production databases.

```bash
# e2e tests
$ npm run test:e2e
```

# End-to-End Test Automation Commands

The following commands are executed automatically when running the E2E tests. After the tests have completed, please ensure that the `test-db` stops before proceeding with any other tasks:

```json
"pretest:e2e": "docker compose up -d test-db",
"test:e2e": "NODE_ENV=test jest --config ./test/jest-e2e.json; npm run posttest:e2e",
"posttest:e2e": "docker compose stop test-db && sleep 5 && docker compose rm -f test-db"
```


- ## E2E Tests Coverage:

```bash
# e2e tests coverage
$ npm run test:cov:e2e
```

![Unit Test](./assets/e2e.test.cov.png)

![Unit Test2](./assets/e2e.test.cov2.png)


### Future Work

1. Advanced Search and Filtering
	•	Enhance Movie and Session Queries (e.g.,ratings, reviews).
	•	Pagination and Sorting (e.g., sessions, ratings, reviews).

2. Improved Security Measures
	•	Rate Limiting

3. Scalability and Performance
	•	Database Optimization and Indexes
	•	Caching: Implement caching strategies (e.g., fecthing all movies, customer tokens)

4. Event-Driven Architecture
	•	Implement Event Sourcing: Introduce an event-driven architecture to handle complex business logic, such as ticketing or session scheduling, which could benefit from asynchronous processing and better decoupling.

### Other possible adjustments for future:
1. Email the users when they buy tickets
2. Email the users after they watched a movie to get their inputs (e.g.,ratings, reviews).
3. Language support

### Challenges
	1. This project marked my first experience using a SQL database at this scale, especially with such intricate relationships. The decision to use a relational database was driven by the natural fit between the entities involved—users, tickets, movies, and sessions—all of which have strong interdependencies. Despite the learning curve, this choice proved crucial for maintaining data integrity and enabling robust query capabilities across these related entities.
  2.	Deployment on Google Cloud Services has been unsuccessful because my billing account was suspended due to some suspicious activity. I haven’t had the time to explore other platforms yet, but I plan to resume deployment on Google Cloud once the billing issue is resolved.