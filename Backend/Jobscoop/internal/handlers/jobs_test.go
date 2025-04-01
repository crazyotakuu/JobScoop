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
