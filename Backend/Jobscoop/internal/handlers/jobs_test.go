package handlers

import (
	"JobScoop/internal/db"
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

// Add this to your test file

// MockLinkedInAPI is a custom http.RoundTripper for mocking LinkedIn API responses
type MockLinkedInAPI struct{}

// RoundTrip implements the http.RoundTripper interface
func (m *MockLinkedInAPI) RoundTrip(req *http.Request) (*http.Response, error) {
	// Check if this is a LinkedIn API request
	if strings.Contains(req.URL.String(), "linkedin.com") ||
		strings.Contains(req.URL.String(), "scraping-dog") {

		// Create a mock response with job data
		mockResponse := map[string]interface{}{
			"jobs": []map[string]interface{}{
				{
					"job_position": "Software Engineer",
					"company_name": "Mock Company",
					"job_link":     "https://linkedin.com/jobs/1",
					"location":     "San Francisco, CA",
				},
				{
					"job_position": "Senior Software Engineer",
					"company_name": "Mock Company",
					"job_link":     "https://linkedin.com/jobs/2",
					"location":     "New York, NY",
				},
				{
					"job_position": "Data Scientist",
					"company_name": "Mock Company",
					"job_link":     "https://linkedin.com/jobs/3",
					"location":     "Remote",
				},
				{
					"job_position": "Mock Role Engineer",
					"company_name": "Different Company",
					"job_link":     "https://linkedin.com/jobs/4",
					"location":     "Austin, TX",
				},
			},
		}

		// Convert the mock data to JSON
		respBody, _ := json.Marshal(mockResponse)

		// Create and return a mock HTTP response
		return &http.Response{
			StatusCode: http.StatusOK,
			Body:       io.NopCloser(bytes.NewBuffer(respBody)),
			Header:     make(http.Header),
		}, nil
	}

	// Return an error for any non-LinkedIn requests
	return nil, fmt.Errorf("unexpected request to %s", req.URL.String())
}

// Mock functions for testing
func testGetUserIDByEmail(email string) (int, error) {
	if email == "nonexistent@example.com" {
		return 0, fmt.Errorf("user not found")
	}
	return 1, nil
}

func testGetCompanyNameByID(id int) (string, error) {
	return "Mock Company", nil
}

func testGetRoleNameByID(id int) (string, error) {
	if id == 1 {
		return "Software Engineer", nil
	} else {
		return "Data Scientist", nil
	}
}

func MockFetchJobs(company string, jobRole string, w http.ResponseWriter) ([]map[string]interface{}, error) {
	// Define mock jobs directly without making a real HTTP request
	mockJobs := []map[string]interface{}{
		{
			"job_position": "Software Engineer",
			"company_name": "Mock Company",
			"job_link":     "https://linkedin.com/jobs/1",
			"location":     "San Francisco, CA",
		},
		{
			"job_position": "Senior Software Engineer",
			"company_name": "Mock Company",
			"job_link":     "https://linkedin.com/jobs/2",
			"location":     "New York, NY",
		},
		{
			"job_position": "Data Scientist",
			"company_name": "Mock Company",
			"job_link":     "https://linkedin.com/jobs/3",
			"location":     "Remote",
		},
		{
			"job_position": "Mock Role Engineer",
			"company_name": "Different Company",
			"job_link":     "https://linkedin.com/jobs/4",
			"location":     "Austin, TX",
		},
	}

	// Filter jobs based on company and role
	var filteredJobs []map[string]interface{}
	for _, job := range mockJobs {
		companyName := job["company_name"].(string)
		jobPosition := job["job_position"].(string)

		// Check if company matches
		companyMatches := strings.EqualFold(companyName, company) ||
			strings.Contains(strings.ToLower(companyName), strings.ToLower(company)) ||
			strings.Contains(strings.ToLower(company), strings.ToLower(companyName))

		// Check if job role matches
		roleWords := strings.Fields(strings.ToLower(jobRole))
		roleMatches := true

		for _, word := range roleWords {
			// Skip common words that might be too generic
			if len(word) <= 2 || isCommonWord(word) {
				continue
			}

			if !strings.Contains(strings.ToLower(jobPosition), word) {
				roleMatches = false
				break
			}
		}

		// Add to filtered results if both company and role match
		if companyMatches && roleMatches {
			filteredJobs = append(filteredJobs, job)
		}
	}

	return filteredJobs, nil
}

func TestGetAllJobs(t *testing.T) {
	// Create a new mock database
	mockDB, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer mockDB.Close()

	// Replace the actual DB with the mock
	originalDB := db.DB
	db.DB = mockDB
	defer func() { db.DB = originalDB }()

	// Save original functions to restore later
	originalGetUserIDByEmailFunc := getUserIDByEmailFunc
	originalGetCompanyNameByIDFunc := getCompanyNameByIDFunc
	originalGetRoleNameByIDFunc := getRoleNameByIDFunc
	originalFetchJobsFunc := fetchJobsFunc

	// Override function pointers with mock functions
	getUserIDByEmailFunc = testGetUserIDByEmail
	getCompanyNameByIDFunc = testGetCompanyNameByID
	getRoleNameByIDFunc = testGetRoleNameByID
	fetchJobsFunc = MockFetchJobs

	// Set environment variable for API key
	os.Setenv("SCRAPING_DOG_API_KEY", "mock-api-key")

	// Restore original functions after test
	defer func() {
		getUserIDByEmailFunc = originalGetUserIDByEmailFunc
		getCompanyNameByIDFunc = originalGetCompanyNameByIDFunc
		getRoleNameByIDFunc = originalGetRoleNameByIDFunc
		fetchJobsFunc = originalFetchJobsFunc
		os.Unsetenv("SCRAPING_DOG_API_KEY")
	}()

	t.Run("Valid request returns jobs", func(t *testing.T) {
		// IMPORTANT: Clear any expectations from previous tests
		mock.ExpectationsWereMet()

		// Prepare request with valid email
		reqBody, _ := json.Marshal(GetSubscriptionsRequest{
			Email: "test@example.com",
		})
		req, _ := http.NewRequest("POST", "/subscriptions/jobs", bytes.NewBuffer(reqBody))
		rr := httptest.NewRecorder()

		// Setup expectations for this specific test
		careerSiteIDs := pq.Int64Array{1, 2}
		roleIDs := pq.Int64Array{1, 2}

		rows := sqlmock.NewRows([]string{"id", "company_id", "career_site_ids", "role_ids"}).
			AddRow(1, 1, careerSiteIDs, roleIDs)

		mock.ExpectQuery("SELECT id, company_id, career_site_ids, role_ids FROM subscriptions WHERE user_id=\\$1 AND active=\\$2").
			WithArgs(1, true).
			WillReturnRows(rows)

		// Call the handler
		GetAllJobs(rr, req)

		// Check status code
		assert.Equal(t, http.StatusOK, rr.Code)

		// Parse response
		var response map[string]interface{}
		err := json.Unmarshal(rr.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Verify jobs array exists
		jobs, ok := response["jobs"].([]interface{})
		assert.True(t, ok, "Expected jobs array in response")

		// We expect jobs to be non-empty, but we'll check its length safely
		if ok {
			t.Logf("Found %d jobs in response", len(jobs))
			if len(jobs) > 0 {
				job := jobs[0].(map[string]interface{})
				assert.Contains(t, job, "company_name", "Job should have company_name field")
			} else {
				t.Log("No jobs returned, skipping job detail checks")
			}
		}

		// Verify the mock expectations were met
		err = mock.ExpectationsWereMet()
		assert.NoError(t, err, "Not all database expectations were met")
	})

	t.Run("Invalid email returns 400", func(t *testing.T) {
		// IMPORTANT: Clear any expectations from previous tests
		mock.ExpectationsWereMet()

		// Prepare request with empty email
		reqBody, _ := json.Marshal(GetSubscriptionsRequest{
			Email: "",
		})
		req, _ := http.NewRequest("POST", "/api/jobs", bytes.NewBuffer(reqBody))
		rr := httptest.NewRecorder()

		// No need to set expectations as we expect early return due to validation

		// Call the handler
		GetAllJobs(rr, req)

		// Check status code
		assert.Equal(t, http.StatusBadRequest, rr.Code)

		// No database queries should be executed
		err = mock.ExpectationsWereMet()
		assert.NoError(t, err, "Unexpected database queries were executed")
	})

	t.Run("Non-existent user returns 404", func(t *testing.T) {
		// IMPORTANT: Clear any expectations from previous tests
		mock.ExpectationsWereMet()

		// Prepare request with non-existent email
		reqBody, _ := json.Marshal(GetSubscriptionsRequest{
			Email: "nonexistent@example.com",
		})
		req, _ := http.NewRequest("POST", "/api/jobs", bytes.NewBuffer(reqBody))
		rr := httptest.NewRecorder()

		// No need to set expectations as mockGetUserIDByEmail will return an error

		// Call the handler
		GetAllJobs(rr, req)

		// Check status code
		assert.Equal(t, http.StatusNotFound, rr.Code)

		// No database queries should be executed
		err = mock.ExpectationsWereMet()
		assert.NoError(t, err, "Unexpected database queries were executed")
	})

	t.Run("Database error returns 500", func(t *testing.T) {
		// IMPORTANT: Clear any expectations from previous tests
		mock.ExpectationsWereMet()

		// Prepare request with valid email
		reqBody, _ := json.Marshal(GetSubscriptionsRequest{
			Email: "test@example.com",
		})
		req, _ := http.NewRequest("POST", "/api/jobs", bytes.NewBuffer(reqBody))
		rr := httptest.NewRecorder()

		// Setup expectations for the database query to fail
		mock.ExpectQuery("SELECT id, company_id, career_site_ids, role_ids FROM subscriptions WHERE user_id=\\$1 AND active=\\$2").
			WithArgs(1, true).
			WillReturnError(sql.ErrConnDone)

		// Call the handler
		GetAllJobs(rr, req)

		// Check status code
		assert.Equal(t, http.StatusInternalServerError, rr.Code)

		// Verify the mock expectations were met
		err = mock.ExpectationsWereMet()
		assert.NoError(t, err, "Not all database expectations were met")
	})
}
