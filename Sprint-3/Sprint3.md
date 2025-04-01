# Sprint 3 Report

# User Stories  
## Jobs Fetching and Toggling
- **As a user,** I want to get all jobs web scraped from subscribed companies each with title, location and apply link.
- **As an admin,** I want to get a specific user existing in the database 
- **As an admin,** I want to update name of a user
- **As a user,** I want to change the status of my subscribed companies to interested/not interested.


## Planned Issues
1. Implement the **Get All Jobs API** on the backend.
2. Implement the **Get User API** on the backend.
3. Implement the **Update User API** on the backend.
4. Write unit test for **Get All Jobs API**.
5. Write unit test for **Get All User API**.
6. Write unit test for **Update User API**.
7. Implement **Toggling functionality** in Manage Subscription form.
8. Implement **USER PROFILE** page in frontend that allows user to update their details
9. Implement **Landing page** for the Application where we fetch all the Active Subscriptions and display all the Job Roles available.
10. Implement **Filtering Functionality** for Manage Subscriptions
11. Integrate the frontend with the backend APIs.


## Completed Issues
1. **Get All Jobs API** implemented on the backend. (Completed)
2. **Get User API** implemented on the backend. (Completed)
3. **Update User API** implemented on the backend. (Completed)
4. Implement toggling functionality on backend. (Completed)
5. Unit tests for API handlers written. (Completed)
6. Frontend successfully integrated with the backend APIs. (Completed)
7. Implement **Toggling functionality** in Manage Subscription form. (Completed)
8. Implement **USER PROFILE** page in frontend that allows user to update their details (Completed)
9. Implement **Landing page** for the Application where we fetch all the Active Subscriptions and display all the Job Roles available. (Completed)
10. Implement **Filtering Functionality** for Manage Subscriptions (Completed)


## Incomplete Issues
- None. All planned issues for this sprint were successfully completed.
Frontend Unit Tests
## Frontend Unit Tests

This section includes both the React component unit tests and the Cypress end-to-end tests written during Sprint 3.

### A. React Component Unit Tests

**Total Unit Test Cases: 43**

These tests were written to ensure robust behavior of individual components across user registration, authentication, profile, and subscription workflows.

- **Signup Component Tests (`signup.test.js`)**  
  - Validates rendering of all required input fields: Name, Email, Password, Confirm Password.  
  - Disables the Signup button until all inputs are valid.  
  - Ensures the Email field follows valid formatting and password meets security criteria.  
  - Detects password mismatch and clears fields on error.  
  - On successful API response, displays a success alert and navigates to the login page.

- **Login Component Tests (`login.test.js`)**  
  - Renders email and password fields with appropriate labels and input validation.  
  - Disables the Login button until both fields contain valid input.  
  - On valid credentials, stores the JWT token, and navigates to the home screen.  
  - Handles incorrect credentials by displaying error messages and resetting inputs.  
  - Tests navigation to Signup and Forgot Password pages via button clicks.

- **Password Reset Component Tests (`PasswordReset.test.js`)**  
  - Implements a 3-step password reset flow: Email input → Code verification → New password.  
  - Validates input fields for each step and handles transitions accordingly.  
  - Simulates both successful and failed backend interactions.  
  - Displays success alerts and error messages based on API response.  
  - Confirms successful reset redirects the user to the login page.

- **Profile Component Tests (`Profile.test.js`)**  
  - Ensures correct rendering of user profile information (email, name, and subscriptions).  
  - Fetches current subscriptions on component mount.  
  - Allows users to log out, clearing session data and redirecting appropriately.  
  - Includes UI-level checks such as headers, sections, and labels.  
  - Verifies navigation behavior across profile-related links.

- **Subscribe Component Tests (`Subscribe.test.js`)**  
  - Verifies rendering of subscription form fields for company name, role, and career links.  
  - Accepts valid inputs and submits them via an API call.  
  - Displays success and error alerts based on submission status.

- **Add Subscriptions Component Tests (`AddSubscriptions.test.js`)**  
  - Renders form fields for adding multiple companies, roles, and links.  
  - Dynamically adds and removes input sections for career links and role names.  
  - Validates and collects all input values before submitting.  
  - Ensures the handler is triggered with correctly structured data payload.
  
### B. Cypress End-to-End Tests

**Total Cypress Test Cases: 34**

These tests comprehensively validate real user workflows across login, signup, password reset, profile, and subscription management functionalities. Each test ensures the interface behaves correctly, validations are enforced, and backend interactions are handled accurately.


#### **Login Tests (`logintest.cy.js`)**

- **Login Page Test Suite**
  - Renders the email and password input fields correctly.
  - Renders a login button and ensures it is present on the page.
  - Successfully logs into the application using valid credentials and receives a mocked token response.
  - Displays error messages when invalid credentials are submitted.
  - Validates that required fields must be filled before login (checks for missing username or password).
  - Prevents multiple submissions when the login button is clicked rapidly.
  - Logs out the user successfully and ensures session data is cleared.


#### **Password Reset Tests (`passreset.cy.js`)**

- **Password Reset Test**
  - Renders the password reset form and input fields correctly.
  - Enables the "Next" button only when a valid email format is entered.
  - Displays appropriate error messages for invalid email formats.
  - Proceeds to the code verification step upon successful email submission.
  - Handles invalid verification codes by showing error alerts.
  - Proceeds to the final password reset step upon entering a valid verification code.
  - Displays an error when the new password and confirm password fields do not match.
  - Successfully resets the password and redirects the user to the login screen.
  - Enforces password complexity and validation requirements during reset.


#### **Signup Tests (`signuptest.cy.js`)**

- **Signup Test**
  - Renders the signup form with all necessary fields: Name, Email, Password, and Confirm Password.
  - Enables the signup button only when all required fields are filled with valid input.
  - Validates email format and shows error messages for invalid entries.
  - Enforces password rules (length, characters, etc.) before allowing submission.
  - Shows error messages when passwords do not match.
  - On successful account creation, redirects to the login screen.
  - Simulates API failures and displays appropriate error messages.
  - Disables the signup button when form fields are empty or invalid.
  - Displays a tooltip for password requirements on focus.


#### **Profile Tests (`profile.cy.js`)**

- **Profile Page Tests**
  - Navigates to the profile page after user login.
  - Allows the user to change their display name and validates the change.
  - Fetches and displays the list of active user subscriptions.
  - Allows the user to change their password while enforcing the required validations.

#### **Subscription Management Tests (`subscriptiontest.cy.js`)**

- **Subscription Test Suite**
  - Adds a new subscription with valid inputs and submits it successfully.
  - Modifies an existing subscription and ensures the update is reflected in the UI.
  - Deletes a subscription and verifies it is removed from the view.
  - Allows searching through the list of subscriptions by keyword.
  - Handles edge cases where the subscription list is empty and displays appropriate UI feedback.


## Backend Unit Tests

### User Unit Tests

- **TestGetUserHandler**: Tests the functionality of `GetUserHandler` to ensure get user works well.
- **TestUpdateUserHandler**: Tests the functionality of `UpdateUserHandler` to ensure username has been updated.


### Jobs Unit Tests

- **TestGetAllJobsHandler**: Tests the functionality of `GetAllJobsHandler` to ensure web scraping works fine.


## Backend API Documentation

# Signup API 

## Endpoint
- **URL:** `/signup`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
The payload should include the user's name, email, and password:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword"
}
```

## Functionality

- **Input Validation:**  
  - Ensures that `name`, `email`, and `password` are provided.
- **User Existence Check:**  
  - Checks if a user with the given email already exists.  
  - Returns a conflict error if the user exists.
- **Password Hashing:**  
  - Hashes the provided password using bcrypt.
- **User Creation:**  
  - Inserts the new user into the database with the hashed password.
- **JWT Generation:**  
  - Retrieves the newly created user's ID.  
  - Generates a JWT token with an expiration time (1 hour) and includes the user ID in the claims.
- **Response Construction:**  
  - Returns a 201 Created status with a JSON object containing a success message, the JWT token, and the user ID.

## Response

### Success Response
```
{
  "message": "User created successfully",
  "token": "generated_jwt_token_here",
  "userid": 123
}
```

### Error Responses

- **400 Bad Request:**  
  - When the payload is invalid or missing required fields.
- **409 Conflict:**  
  - When a user with the given email already exists.
- **500 Internal Server Error:**  
  - For database errors, password hashing failures, or JWT signing issues.

# Login API 

## Endpoint
- **URL:** `/login`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
The payload must include the user's email and password:
```json
{
  "email": "user@example.com",
  "password": "userPassword"
}
```

## Functionality

- **Input Validation:**  
  - Decodes the JSON payload and verifies that both `email` and `password` are provided.
- **User Authentication:**  
  - Looks up the user in the database by email.  
  - Returns a 404 error if the user does not exist.  
  - Retrieves the stored hashed password and compares it with the provided password.  
  - Returns an unauthorized error if the password does not match.
- **JWT Generation:**  
  - On successful authentication, generates a JWT token with an expiration time (1 hour) that includes the user ID in its claims.
- **Response Construction:**  
  - Returns a JSON response containing a success message, the generated JWT token, and the user ID.

## Response

### Success Response
```
{
  "message": "Login successful",
  "token": "generated_jwt_token_here",
  "userid": 123
}
```

### Error Responses

- **400 Bad Request:**  
  - Returned if the JSON payload is invalid or if email/password is missing.
- **404 Not Found:**  
  - Returned if the user does not exist.
- **401 Unauthorized:**  
  - Returned if the provided password is incorrect.
- **500 Internal Server Error:**  
  - Returned if there is a database error or an issue generating/signing the JWT token.

# ForgotPassword API 

## Endpoint
- **URL:** `/forgot-password`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
The JSON payload should contain the user's email:
```json
{
  "email": "user@example.com"
}
```

## Functionality

1. **Input Validation:**  
   - Decodes the request payload and checks that an email is provided.
2. **User Verification:**  
   - Checks if the provided email exists in the `users` table.  
   - If the email is not found, returns a 404 error prompting the user to sign up.
3. **Token Generation and Storage:**  
   - Generates a reset token and sets its expiration to 15 minutes from the current UTC time.  
   - Inserts or updates the reset token record in the `reset_tokens` table.
4. **Email Sending:**  
   - Sends a password reset email containing the token to the user.
5. **Response Construction:**  
   - Returns a success message if the email is sent successfully.

## Response

### Success Response

- **Status Code:** 200 OK  
- **Response Body:** Password reset email sent successfully!

### Error Responses

- **400 Bad Request:**  
  - Returned if the JSON payload is invalid.
- **404 Not Found:**  
  - Returned if the email does not exist in the users table.
- **500 Internal Server Error:**  
  - Returned if there is a database error, token generation/storage error, or if sending the email fails.

# VerifyCode API

## Endpoint
- **URL:** `/verify-code`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
The JSON payload must include the user's email and the reset token:
```json
{
  "email": "user@example.com",
  "token": "reset_token_here"
}
```

## Functionality

1. **Input Validation:**  
   - Decodes the request payload and ensures that both `email` and `token` are provided.
2. **Token Retrieval:**  
   - Fetches the stored token and its expiration time from the `reset_tokens` table for the given email.  
   - Returns a 404 error if no reset request is found.
3. **Token Verification:**  
   - Checks if the token has expired and returns an unauthorized error if it has.  
   - Compares the stored token with the provided token and returns an unauthorized error if they do not match.
4. **Response Construction:**  
   - On successful verification, returns a success message.

## Response

### Success Response

- **Status Code:** 200 OK  
- **Response Body:** Verification successful

### Error Responses

- **400 Bad Request:**  
  - When the payload is invalid or missing required fields.
- **404 Not Found:**  
  - When no reset request is found for the provided email.
- **401 Unauthorized:**  
  - When the token has expired or does not match.
- **500 Internal Server Error:**  
  - For any database-related errors.

# ResetPassword API 

## Endpoint
- **URL:** `/reset-password`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
The JSON payload must include the user's email and the new password:
```json
{
  "email": "user@example.com",
  "new_password": "newSecurePassword"
}
```

## Functionality

1. **Input Validation:**  
   - Decodes the request payload and checks that both `email` and `new_password` are provided.
2. **User Verification:**  
   - Queries the `users` table to ensure that a user with the given email exists.  
   - Returns a 404 error if the user is not found.
3. **Password Hashing:**  
   - Hashes the new password using bcrypt.
4. **Password Update:**  
   - Updates the user's password in the database with the hashed password.
5. **Response Construction:**  
   - Returns a success message upon successful password update.

## Response

### Success Response

- **Status Code:** 200 OK  
- **Response Body:** Password reset successfully

### Error Responses

- **400 Bad Request:**  
  - When the JSON payload is invalid or missing required fields.
- **404 Not Found:**  
  - When no user is found with the provided email.
- **500 Internal Server Error:**  
  - For database errors, password hashing failures, or issues updating the password.

# SaveSubscriptions API 

## Endpoint
- **URL:** `/save-subscriptions`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
```json
{
  "email": "user@example.com",
  "subscriptions": [
    {
      "companyName": "Adobe",
      "careerLinks": ["http://example.com/careers/adobe1", "http://example.com/careers/adobe2"],
      "roleNames": ["Software Engineer", "Data Scientist"]
    }
  ]
}
```

## Functionality

- **Input Validation:**  
  - Ensures `email` and each subscription’s `companyName` are provided.
- **User Lookup:**  
  - Fetches the user ID by email and returns a 404 error if the user is not found.
- **Subscription Processing:**  
  - For each subscription:  
    - Retrieves or creates the company record.  
    - Retrieves or creates career site IDs from `careerLinks` (using the company ID).  
    - Retrieves or creates role IDs from `roleNames`.  
    - Checks if a subscription (user ID + company ID) exists:  
      - **If not:** Inserts a new subscription record.  
      - **If yes:** Merges new career links and role IDs with the existing ones and updates the record.
- **Timestamps:**  
  - Sets the `interest_time` to the current UTC time.

## Response

### Success
```
{
  "message": "Subscription processed successfully",
  "status": "success"
}
```

### Errors

- **400 Bad Request:**  
  - Invalid JSON payload or missing required fields.
- **404 Not Found:**  
  - User not found.
- **500 Internal Server Error:**  
  - Database or processing errors.

# FetchUserSubscriptions API 

## Endpoint
- **URL:** `/fetch-user-subscriptions`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
```json
{
  "email": "user@example.com"
}
```

## Functionality

1. **Input Validation:**  
   - Decodes the JSON payload and checks that an email is provided.
2. **User Lookup:**  
   - Retrieves the user ID based on the provided email and returns a 404 error if the user is not found.
3. **Subscription Query:**  
   - Fetches all subscription rows for the user from the database.
4. **Data Aggregation:**  
   - For each subscription, retrieves the company name, associated career site links, and role names.
5. **Response Construction:**  
   - Returns a JSON object containing a list of subscriptions, each with `companyName`, `careerLinks`, and `roleNames`.

## Response

### Success Response
```
{
  "status": "success",
  "subscriptions": [
    {
      "companyName": "Adobe",
      "careerLinks": [
        "http://example.com/careers/adobe1",
        "http://example.com/careers/adobe2"
      ],
      "roleNames": [
        "Software Engineer",
        "Data Scientist"
      ]
    },
    {
      "companyName": "Amazon",
      "careerLinks": [
        "http://example.com/careers/amazon1"
      ],
      "roleNames": [
        "Backend Engineer"
      ]
    }
  ]
}
```

### Error Responses

- **400 Bad Request:**  
  - Returned if the JSON payload is invalid or if the `email` field is missing.
- **404 Not Found:**  
  - Returned if the user associated with the provided email is not found.
- **500 Internal Server Error:**  
  - Returned if there is an error fetching subscriptions or processing database records.

# UpdateSubscriptions API 

## Endpoint
- **URL:** `/update-subscriptions`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
```json
{
  "email": "user@example.com",
  "subscriptions": [
    {
      "companyName": "Adobe",
      "careerLinks": ["http://example.com/careers/adobe1", "http://example.com/careers/adobe2"],
      "roleNames": ["Software Engineer", "Data Scientist"]
    }
  ]
}
```

## Functionality

- **Input Validation:**  
  - Ensures an `email` is provided and each subscription contains a `companyName`.
- **User & Company Verification:**  
  - Retrieves the user ID by email and looks up the company ID for the given `companyName`, returning an error if not found.
- **Update Logic:**  
  - Determines which fields (careerLinks and/or roleNames) are provided and, if none, returns an error.  
  - For provided fields, retrieves or creates corresponding IDs and updates the subscription record (merging with existing data) while updating the `interest_time`.
  
## Response

### Success Response
```
{
  "message": "Subscription(s) updated successfully",
  "status": "success"
}
```

### Error Responses

- **400 Bad Request:**  
  - Returned if the payload is invalid, missing `email`, or missing `companyName` in any subscription, or if no update fields are provided.
- **404 Not Found:**  
  - Returned if the user is not found.
- **500 Internal Server Error:**  
  - Returned if there is a database error while fetching or updating the subscription.

# DeleteSubscriptions API 

## Endpoint
- **URL:** `/delete-subscriptions`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
```json
{
  "email": "user@example.com",
  "subscriptions": ["Amazon", "Meta"]
}
```

## Functionality

1. **Input Validation:**  
   - Verifies that an `email` is provided and that the `subscriptions` array is not empty.
2. **User Lookup:**  
   - Retrieves the user ID associated with the provided email, returning a 404 error if not found.
3. **Subscription Deletion:**  
   - Iterates over the company names in the `subscriptions` array, deleting each corresponding subscription record where the user ID and company ID match.
4. **Error Handling:**  
   - Returns an error if none of the provided subscriptions exist or if the user is not subscribed to any.
5. **Response Construction:**  
   - Returns a success message upon successful deletion.

## Response

### Success Response
```
{
  "message": "Deleted subscription(s) successfully",
  "status": "success"
}
```

### Error Responses

- **400 Bad Request:**  
  - When the payload is invalid, missing an email, or the subscriptions array is empty, or if no valid subscriptions are found.
- **404 Not Found:**  
  - When the user corresponding to the provided email is not found.
- **500 Internal Server Error:**  
  - In case of any database errors during deletion.

# FetchAllSubscriptions API 

## Endpoint
- **URL:** `/fetch-all-subscriptions`
- **Method:** `GET` 
- **Content-Type:** `application/json`

## Functionality

1. **Companies Query:**  
   - Fetches all company IDs and names from the `companies` table, building a map with each company name as a key and initializing an empty list for its career links.
2. **Career Sites Query:**  
   - For each company, queries the `career_sites` table to retrieve all associated career links and populates the map.
3. **Roles Query:**  
   - Fetches all role names from the `roles` table and compiles them into a list.
4. **Response Construction:**  
   - Constructs a JSON response containing a `companies` object (mapping company names to arrays of career links) and a `roles` array.

## Response

### Success Response
```json
{
  "companies": {
    "Adobe": ["http://example.com/careers/adobe1", "http://example.com/careers/adobe2"],
    "Amazon": ["http://example.com/careers/amazon1"]
  },
  "roles": ["Software Engineer", "Data Scientist"]
}
```

### Error Responses

- **500 Internal Server Error:**  
  - Returned if there is an error fetching or scanning companies, career sites, or roles.


# Updated Backend API Documentation

# GetAllJobs API

## Endpoint
- **URL:** `/get-all-jobs`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
```json
{
  "email": "user@example.com"
}
```

## Functionality

1.  **Input Validation:**
    
    -   The handler decodes the request payload and checks that an `email` is provided.
        
2.  **User Lookup:**
    
    -   It retrieves the user ID associated with the given email. If the user isn’t found, a 404 error is returned.
        
3.  **Active Subscriptions Query:**
    
    -   The handler queries the subscriptions table for records matching the user ID with `active` set to `true`.
        
    -   For each subscription, it retrieves the company ID, career site IDs, and role IDs.
        
4.  **Building Subscription Response:**
    
    -   For each subscription, the company name is fetched from the database.
        
    -   Role IDs are converted to role names to build a simplified subscription response.
        
5.  **Job Fetching:**
    
    -   For each subscription and for each role in that subscription, the handler calls a helper function (e.g., `fetchJobsFunc`) to retrieve job listings for that company and role.
        
    -   All job listings are aggregated into a single list.
        
6.  **Response Construction:**
    
    -   Finally, the handler returns a JSON response containing all the job postings.

## Response

### Success Response

```
{
  "jobs": [
    {
      "jobTitle": "Research Scientist",
      "location": "USA",
      "applyLink": "https://..."
    },
    {
      "jobTitle": "Data Analyst",
      "location": "Canada",
      "applyLink": "https://..."
    }
    // ... more job objects
  ]
}

```

### Error Responses

-   **400 Bad Request:**
    
    -   Returned if the request payload is invalid or if the `email` field is missing.
        
-   **404 Not Found:**
    
    -   Returned if the user corresponding to the provided email is not found.
        
-   **500 Internal Server Error:**
    
    -   Returned in case of database errors during subscription query, iteration, or while fetching jobs.


# UpdateUser API

## Endpoint
- **URL:** `/update-user`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
```json
{
  "email": "user@example.com",
  "name": "New Name"
}
```
## Functionality

1.  **Input Validation:**
    
    -   The API decodes the incoming JSON payload and checks that both `email` and `name` are provided.
        
2.  **Database Update:**
    
    -   It executes an SQL `UPDATE` query to change the user's name where the provided email matches.
        
3.  **Response Construction:**
    
    -   On success, it returns a JSON response with a message indicating the user was updated successfully.
        
4.  **Error Handling:**
    
    -   Returns a 400 error if required fields are missing or if the payload is invalid.
        
    -   Returns a 500 error if a database error occurs during the update.
        

## Response

### Success Response

```
{
  "message": "User updated successfully",
  "status": "success"
}

```
### Error Responses

-   **400 Bad Request:**
    
    -   When the request payload is invalid or if `email` and `name` are not provided.
        
-   **500 Internal Server Error:**
    
    -   If there is an error updating the user in the database.


# GetUser API

## Endpoint
- **URL:** `/get-user`
- **Method:** `POST`
- **Content-Type:** `application/json`

## Request Body
```json
{
  "email": "user@example.com"
}
```
## Functionality

1.  **Input Validation:**
    
    -   The API decodes the incoming JSON payload into a `GetUserRequest` and verifies that the `email` field is provided.
        
2.  **User Lookup:**
    
    -   It queries the database for a user with the given email, retrieving the user's name, email, and creation date.
        
3.  **Error Handling:**
    
    -   If the request payload is invalid or missing the email, a 400 Bad Request error is returned.
        
    -   If no user is found, a 404 Not Found error is returned.
        
    -   If a database error occurs, a 500 Internal Server Error is returned.
        
4.  **Response Construction:**
    
    -   Upon successful retrieval, the API returns a JSON response containing the user's name, email, and created_at timestamp.
        

## Response

### Success Response
```
{
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-03-28T00:00:00Z"
}

```
### Error Responses

-   **400 Bad Request:**
    
    -   When the JSON payload is invalid or the `email` field is missing.
        
-   **404 Not Found:**
    
    -   When no user is found for the provided email.
        
-   **500 Internal Server Error:**
    
    -   If there is an error retrieving user data from the database.
