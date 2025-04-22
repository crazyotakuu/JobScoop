
# JobScoop — Job Alert & Trends Dashboard

JobScoop is an one-click job fetching application designed to streamline your job search. Users can sign up, log in, and manage their preferred companies, which the application uses to scrape career websites for job postings. With filters like Software Engineer, and New Grad 2025, users can view tailored results, navigate directly to job postings, and stay organized.



## Members

- Vijay Abhinav Telukunta (Back-End)
- Uday Srinivas Medisetty (Back-End)
- Vishnu Vivek Valeti (Front-End)
- Venkata Satya Dinesh Chandra Gupta Kolipakula Dhatri (Front-End)

## Table of Contents  
1. [Key Features](#key-features)  
2. [Tech Stack](#tech-stack)  
3. [Project Structure](#project-structure)  
4. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Installation](#installation)  
   - [Running Locally](#running-locally)  
5. [Testing](#testing)  
   - [Unit Tests](#unit-tests)  
   - [End‑to‑End Tests](#end-to-end-tests)  
6. [API Endpoints](#api-endpoints)  
7. [Future Enhancements](#future-enhancements)  
8. [Contributing](#contributing)  
9. [License](#license)  

## Key Features  
- **Secure Authentication**  
  - Signup, login, and password‑reset flows  
  - Protected routes via React Context
 
    
- **Home**
  - View all the active job openings available
  - Minimal Job cards design with important information
  - colour themed job cards for easy user identification.
  - varius dropdown filterings for user experience

- **Subscription Management**  
  - Add or remove job‑alert subscriptions by company & role  
  - View and edit your current subscriptions
  - Toggle Activate or deactivate already existing subscriptions
  - can add multiple carrer sites or career roles for a specific comapny 

- **Trends Dashboard**  
  - **Company Trends**: Bar chart of top subscribed companies  
  - **Role Trends**: Bar chart of top subscribed job roles  
  - **Correlation Table**: Frequency heatmap of company–role pairs
  - **Trending Roles**: Top 5 most subscribed roles in the past 7 days
 
    
  - **Profile**
  - Check user details such as subscriptions, name , email.
  - Change the user password
  - Edit user name 

- **Flexible Date Filters**  
  - Quick filters: Last 7 days, Last 30 days, This month, Last month  
  - Custom “From”/“To” pickers (native `<input type="date">`)  

- **Refresh & Retry Logic**  
  - “Refresh Data” button to fetch the latest trends  
  - Graceful retry on API errors with user‑friendly messages  

- **Responsive Design**  
  - Mobile‑first layout, works on phones, tablets, and desktops  

- **Comprehensive Testing**  
  - Unit tests with Jest & React Testing Library  
  - End‑to‑end tests with Cypress  

## Tech Stack  
- **Framework**: React.js (v18)  
- **Routing**: React Router v6  
- **State Management**: Context API  
- **Charts**: Chart.js via react-chartjs-2  
- **Styling**: CSS Modules  
- **Testing**:  
  - **Unit**: Jest + React Testing Library  
  - **E2E**: Cypress  

## Getting Started

### Prerequisites  
- Node.js ≥ v14  
- npm ≥ v6  

### Installation

Clone the Jobscoop repositry into your local using the command `git clone https://github.com/crazyotakuu/JobScoop.git`

#### FRONTEND 
- Navigate to the Frontend directory in the Jobscoop application (`cd jobscoop/Frontend`)
- Install dependencies using the command `npm install`
- Start the Front end application using the command `npm start`
#### FRONTEND TESTING (UNIT TESTCASES)
- Navigate to the Frontend directory in the Jobscoop application (`cd jobscoop/Frontend`)
- To execute tests run `npm test` command to initiate unit testcases
#### FRONTEND TESTING (CYPRESS TESTCASES)
- Install cypress module using the command `npm install cypress --save-dev`
- to execute cypress testcases use the command `npx cypress open`
- choose e2e testing and hit run for the testcases
    
  

# Backend Setup & Usage

This section walks you through the detailed steps required to get the JobScoop backend up and running on your local machine.

---

## 1. Prerequisites

Make sure you have the following installed:

- **Go** (latest stable version ≥ 1.18):  
  https://golang.org/dl/

- **PostgreSQL** (≥ 12.x):  
  https://www.postgresql.org/download/

- **Postman** (or any REST client) for testing your APIs:  
  https://www.postman.com/downloads/

---

## 2. Clone & Directory Structure

```bash
git clone https://github.com/crazyotakuu/JobScoop.git
cd JobScoop/Backend
```
Your `Backend/` folder should contain:
```
Backend/
├── config/           # .env example, other config loaders
├── internal/         # business logic, handlers
├── migrations/       # SQL migration scripts
├── pkg/              # shared packages (DB, models, utils)
├── routes/           # HTTP route definitions
├── scripts/          # helper scripts (e.g. seed data)
└── main.go           # application entrypoint
```
## 3. Environment Variables

Create a `.env` file in `Backend/config/` (or at the project root if that’s where your loader expects it).  
You can start from `.env.example` and fill in your own values:
```
# --- Database Connection ---
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<YourPostgresPassword>
DB_NAME=jobscoop

# --- HTTP Server ---
SERVER_PORT=8080

# --- JWT Authentication ---
JWT_TOKEN=<YourJWTSigningSecret>

# --- Email (Forgot Password) ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-smtp-password>

# --- ScrapingDog API ---
SCRAPING_DOG_API_KEY=<YourScrapingDogApiKey>
```

## 4. Database Initialization

1.  **Start PostgreSQL** (ensure it’s running on `DB_HOST:DB_PORT`).
    
2.  **Create the database**: Create database in pgadmin4

## 5. Installing Dependencies

Inside the `Backend/` directory:
```
go mod tidy      # download & verify all module dependencies
```
## 6. Running the Server

With your `.env` in place and database ready, start the backend:

```
cd Backend/JobScoop
go run main.go
```
You should see output like:

```
Server running on http://localhost:8080

```

## 7. Testing the APIs

You can now exercise the endpoints with Postman or via the Frontend client.

### Example with Postman

-   **Base URL:** `http://localhost:8080/api`

You’re all set! Enjoy building and testing your JobScoop backend.