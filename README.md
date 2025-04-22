
# JobScoop — Job Alert & Trends Dashboard

JobScoop is an one-click job fetching application designed to streamline your job search. Users can sign up, log in, and manage their preferred companies, which the application uses to scrape career websites for job postings. With filters like Software Engineer, and New Grad 2025, users can view tailored results, navigate directly to job postings, and stay organized.



## Members

- Vijay Abhinav Telukunta (Back-End)
- Uday Srinivas Medisetty (Back-End)
- Vishnu Vivek Valeti (Front-End)
- Venkata Satya Dinesh Chandra Gupta Kolipakula Dhatri (Front-End)
---

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

---

## Key Features  
- **Secure Authentication**  
  - Signup, login, and password‑reset flows  
  - Protected routes via React Context  

- **Subscription Management**  
  - Add or remove job‑alert subscriptions by company & role  
  - View and edit your current subscriptions  

- **Interactive Dashboard**  
  - **Company Trends**: Bar chart of top subscribed companies  
  - **Role Trends**: Bar chart of top subscribed job roles  
  - **Correlation Table**: Frequency heatmap of company–role pairs  

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

---
## 🛠️ Tech Stack  
- **Framework**: React.js (v18)  
- **Routing**: React Router v6  
- **State Management**: Context API  
- **Charts**: Chart.js via react-chartjs-2  
- **Styling**: CSS Modules  
- **Testing**:  
  - **Unit**: Jest + React Testing Library  
  - **E2E**: Cypress  

---
## Getting Started

### Prerequisites  
- Node.js ≥ v14  
- npm ≥ v6  

### Installation

#### FRONTEND 
- Navigate to the Frontend directory in the Jobscoop application (cd jobscoop/Frontend)
- Install dependencies using the command npm install
- Start the Front end application using the command npm start
#### FRONTEND TESTING (UNIT TESTCASES)
- Navigate to the Frontend directory in the Jobscoop application (cd jobscoop/Frontend)
- To execute tests run npm test command to initiate unit testcases
  #### FRONTEND TESTING (CYPRESS TESTCASES)
  - 
    
  
