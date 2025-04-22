# Sprint 4 Report

## User Stories
- **As a user,** I want to fetch all jobs from Indeed and Google Jobs so I can see the latest opportunities.  
- **As a user,** I want to retrieve all of my subscriptions so I can view and manage them.  
- **As a user,** I want to see the frequency of roles across my subscriptions to understand which positions are most common.
- **As a user,** I want to see the Latest Trending roles most users are targetting.
- **As a user,** I want to see the most popular companies subscribed by the user in a given time frame.
- **As a user,** I want to see the most popular Job roles subscribed by the user in a given time frame.
- **As a user,** I want to see the popular company-role combination subscribed by the users.  

## Planned Issues
1. Implement **Fetch All Jobs from Indeed and Google Jobs** API (Backend – SP4)  
2. Implement **Fetch All User Subscriptions** API (Backend – SP4)  
3. Implement **Fetch Role Frequencies** API (Backend – SP4)  
4. Write unit tests for **Fetch All User Subscriptions** API (Backend – SP4)  
5. Write unit tests for **Fetch Role Frequencies** API (Backend – SP4)
6. Implement **Trends page for User Analytics** (Frontend - SP4)
7. Implement **Charts, Trends, Corelation table in Trends page** (Frontend - SP4)

## Completed Issues
1. **Fetch All Jobs from Indeed and Google Jobs** API implemented.  
2. **Fetch All User Subscriptions** API implemented.  
3. **Fetch Role Frequencies** API implemented.  
4. Unit tests for **Fetch All User Subscriptions** API written.  
5. Unit tests for **Fetch Role Frequencies** API written.
6. **Trends page for User Analytics** implemented
7. **Charts, Trends, Corelation table in Trends page** implemented
8. Unit tests for **Trends UI page** written.
9. Cypress tests for **Trends UI page** written.

## Incomplete Issues
- None. All planned issues for this sprint were successfully completed.

## Frontend Unit Tests
This section includes both the React component unit tests and the Cypress end-to-end tests written during Sprint 4.

### A. React Component Unit Tests

**Total Unit Test Cases: 13**

These tests comprehensively validate the data fetching, rendering, interaction, filtering, and error handling workflows of the Trends dashboard. Each test ensures the component responds correctly to user actions, displays dynamic content appropriately, and manages various UI states (loading, error, data-driven rendering).

#### **Trends Component Tests (`Trends.test.js`)**
## 🧪 Unit Test Coverage

### ✅ Trends Dashboard Test Suite

This test suite verifies the functionality, data loading, and user interactions within the `Trends` component using Jest and React Testing Library.

- **Displays loading state initially**  
  Renders a loading message before API data is available.
- **Fetches data on mount**  
  Calls mocked API endpoints to fetch subscription and correlation data when the component mounts.
- **Renders dashboard title after data load**  
  Verifies the presence of "Subscription Trends Dashboard" once the data is loaded.
- **Displays company and role charts**  
  Renders bar charts (mocked) for most popular companies and roles after data is processed.
- **Shows correlation table**  
  Displays a company-role frequency table populated with mocked data.
- **Supports manual date range filtering**  
  Allows users to enter a custom date range using input fields and apply filters.
- **Provides quick filter buttons**  
  Includes filters for "Last 7 days", "Last 30 days", "This month", and "Last month" to quickly update the data.
- **Handles refresh button logic**  
  Clicking "Refresh Data" triggers new API calls and updates the dashboard content.
- **Displays error state on API failure**  
  Shows a user-friendly error message and "Retry" button when data fetching fails.
- **Supports retry logic**  
  Clicking the retry button re-fetches data and restores the dashboard after an error.
- **Renders dashboard statistics**  
  Displays total subscriptions, unique companies, and unique job roles after data is loaded.
- **Handles empty filter results gracefully**  
  Shows a "No data available for the selected date range" message when the filtered dataset is empty.

  
### B. Cypress End-to-End Tests

**Total Cypress Test Cases: 10**

These tests comprehensively validate real user workflows across login, signup, password reset, profile, and subscription management functionalities. Each test ensures the interface behaves correctly, validations are enforced, and backend interactions are handled accurately.


## Backend Unit Tests

### Subscription Unit Tests

- **FetchSubscriptionFrequenciesHandler**: Tests the functionality of `FetchSubscriptionFrequenciesHandler` to get frequencies of each role of interest.
- **FetchAllUserSubscriptionsHandler**: Tests the functionality of `FetchAllUserSubscriptionsHandler` to fetch all individual user subscriptions.


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

    -   Fetches the jobs for the given company and role from three sources - Linkedin, Indeed and Google Jobs
        
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


# Subscription Frequencies API

## Endpoint

-   **URL:** `fetch-subscription-frequencies`
    
-   **Method:** `GET`
    
-   **Content-Type:** `application/json`
    

## Request Parameters

This endpoint does not accept any URL parameters or request body.

## Functionality

1.  **Fetch Distinct Companies**  
    Queries the `subscriptions` table for all distinct `company_id` values.
    
2.  **Company Lookup**  
    For each `company_id`, retrieves the human‑readable company name from the `companies` table.
    
3.  **Total Subscriptions Count**  
    Counts how many subscription rows exist for that company (`COUNT(*)`).
    
4.  **Per‑Role Subscription Count**
    
    -   Expands each subscription’s `role_ids` array via `unnest(role_ids)`.
        
    -   Groups by each `roleid` to compute the number of subscriptions per role.
        
5.  **Role Lookup**  
    Maps each `roleid` to its name in the `roles` table.
    
6.  **Frequency Calculation**  
    Computes
    
    `frequency = (subscriptions for this role) / (total subscriptions for the company)` 
    
7.  **Response Assembly**  
    Builds a JSON array where each element contains:
    
    -   `company` (string): company name
        
    -   `role` (string): role name
        
    -   `count` (integer): number of subscriptions for that role
        
    -   `total` (integer): total subscription rows for the company
        
    -   `frequency` (float): `count / total`
        

## Success Response

-   **Status:** `200 OK`
    
-   **Body Example:**
```
[
  {
    "company": "Apple",
    "role": "Software Engineer",
    "count": 12,
    "total": 50,
    "frequency": 0.24
  },
  {
    "company": "Apple",
    "role": "Data Scientist",
    "count": 8,
    "total": 50,
    "frequency": 0.16
  },
  {
    "company": "Google",
    "role": "Backend Engineer",
    "count": 15,
    "total": 30,
    "frequency": 0.50
  }
]

```

# Fetch All User Subscriptions API

## Endpoint

-   **URL:** `fetch-all-user-subscriptions`
    
-   **Method:** `GET`
    
-   **Content-Type:** `application/json`
    

## Request

This endpoint does not accept any URL parameters or request body.

## Functionality

1.  **Query Subscriptions**
    
    -   Executes a single SQL statement that:
        
        -   Joins `subscriptions` (`s`) with `users` (`u`) to retrieve `u.name`.
            
        -   Joins with `companies` (`c`) to retrieve `c.name`.
            
        -   Unnests the integer array `s.role_ids` via a `CROSS JOIN LATERAL`, producing one row per `(subscription, roleid)`.
            
        -   Joins the unnested `roleid` with `roles` (`r`) to retrieve `r.name`.
            
        -   Groups the results by user name, company name, and `s.interest_time`, aggregating the role names into an array.
            
        -   Orders the output first by user name (ascending) and then by `interest_time` (descending).
            
2.  **Row Scanning**
    
    -   Iterates over the returned rows, scanning into a `UserCompanySubscription` struct:
```
type UserCompanySubscription struct {
  User      string    `json:"user"`
  Company   string    `json:"company"`
  Date      time.Time `json:"date"`
  RoleNames []string  `json:"roleNames"`
}

```
3.  **Error Handling**
    
    -   If the initial query fails, returns a **500 Internal Server Error** with the detailed error.
        
    -   If scanning a row or iterating rows fails, likewise returns **500** with the error message.
        
4.  **Response Construction**
    
    -   On success, returns **200 OK** and the full slice of `UserCompanySubscription` structs, serialized as JSON.
        

## Success Response

-   **Status:** `200 OK`
    
-   **Body Example:**

```
[
  {
    "user": "Abhinav",
    "company": "Google",
    "date": "2025-04-18T14:30:00Z",
    "roleNames": [
      "software engineer",
      "data engineer"
    ]
  },
  {
    "user": "Abhinav",
    "company": "Tesla",
    "date": "2025-04-19T09:15:00Z",
    "roleNames": [
      "AI engineer"
    ]
  },
  {
    "user": "Uday",
    "company": "Acme Corp",
    "date": "2025-04-17T11:00:00Z",
    "roleNames": [
      "backend developer",
      "devops engineer"
    ]
  }
]

```
