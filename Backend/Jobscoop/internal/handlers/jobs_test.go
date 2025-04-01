package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
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