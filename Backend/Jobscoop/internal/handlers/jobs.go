package handlers

import (
	"JobScoop/internal/db"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/lib/pq"
)

var (
	fetchJobsFunc = fetchJobs
)

func GetAllJobs(w http.ResponseWriter, r *http.Request) {
	// Decode request to get email
	var req GetSubscriptionsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"message": "Invalid request payload"}`, http.StatusBadRequest)
		return
	}
	if req.Email == "" {
		http.Error(w, `{"message": "Email is required"}`, http.StatusBadRequest)
		return
	}

	// Get user ID from email
	userID, err := getUserIDByEmailFunc(req.Email)
	if err != nil {
		http.Error(w, `{"message": "User not found"}`, http.StatusNotFound)
		return
	}

	// Query subscriptions for the user
	rows, err := db.DB.Query(`
		SELECT id, company_id, career_site_ids, role_ids 
		FROM subscriptions 
		WHERE user_id=$1 AND active=$2`, userID, true)
	if err != nil {
		http.Error(w, `{"message": "Database error fetching subscriptions"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Array to hold subscription responses
	var subscriptions []SubscriptionResponse

	// Loop through each subscription row
	for rows.Next() {
		var id int
		var companyID int
		var careerSiteIDs []int64
		var roleIDs []int64

		if err := rows.Scan(&id, &companyID, pq.Array(&careerSiteIDs), pq.Array(&roleIDs)); err != nil {
			http.Error(w, `{"message": "Error scanning subscription row"}`, http.StatusInternalServerError)
			return
		}

		// Get the company name
		companyName, err := getCompanyNameByIDFunc(companyID)
		if err != nil {
			http.Error(w, `{"message": "Error fetching company name"}`, http.StatusInternalServerError)
			return
		}

		// Fetch role names
		var roleNames []string
		for _, rid := range roleIDs {
			roleName, err := getRoleNameByIDFunc(int(rid))
			if err != nil {
				http.Error(w, `{"message": "Error fetching role name"}`, http.StatusInternalServerError)
				return
			}
			roleNames = append(roleNames, roleName)
		}

		// Create a subscription response object
		subResp := SubscriptionResponse{
			CompanyName: companyName,
			RoleNames:   roleNames,
		}
		subscriptions = append(subscriptions, subResp)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, `{"message": "Error iterating subscription rows"}`, http.StatusInternalServerError)
		return
	}
	fmt.Println(subscriptions)

	// New functionality: Fetch jobs for each role within each subscription
	var allJobs []map[string]interface{}
	for _, sub := range subscriptions {
		for _, roleName := range sub.RoleNames {
			fmt.Println("I am here going to call fetchjobs")
			jobs, err := fetchJobsFunc(sub.CompanyName, roleName, w) // Assuming fetchJobs takes company name and role name
			if err != nil {
				http.Error(w, `{"message": "Error fetching jobs"}`, http.StatusInternalServerError)
				return
			}
			allJobs = append(allJobs, jobs...)
		}
	}

	// Construct final response
	response := map[string]interface{}{
		"jobs": allJobs,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}

const (
	ScrapingDogLinkedInAPI = "http://api.scrapingdog.com/linkedinjobs"
	// ScrapingDogIndeedAPI   = "http://api.scrapingdog.com/indeed"
)

func fetchLinkedInJobs(apiKey, field, geoid, page, sort_by string) ([]map[string]interface{}, error) {
	params := url.Values{}
	params.Add("api_key", apiKey)
	params.Add("field", field)
	params.Add("geoid", geoid)
	params.Add("page", page)
	params.Add("sort_by", sort_by)
	// params.Add("filter_by_company", filter_by_company)
	url := ScrapingDogLinkedInAPI + "?" + params.Encode()
	fmt.Println(url)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// LinkedIn returns an array, so we parse into a slice of maps
	var apiResponse []map[string]interface{}
	err = json.Unmarshal(body, &apiResponse)
	if err != nil {
		return nil, err
	}
	// fmt.Println("I am here in fetchlinkedin jobs and this below is the output.")
	// fmt.Println(apiResponse)
	return apiResponse, nil
}

// Placeholder for fetchIndeedJobs function
func fetchIndeedJobs(apiKey string, company, jobRole string) ([]map[string]interface{}, error) {
	// Generate Indeed URL for the search
	indeedURL := generateIndeedURL(jobRole, company)

	// URL encode the Indeed URL
	encodedURL := url.QueryEscape(indeedURL)

	// Construct the API URL
	apiURL := fmt.Sprintf("https://api.scrapingdog.com/indeed?api_key=%s&url=%s", apiKey, encodedURL)
	fmt.Println("Indeed API URL:", apiURL)

	// Send GET request to the API
	resp, err := http.Get(apiURL)
	if err != nil {
		return nil, fmt.Errorf("failed to send request to Indeed API: %v", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read Indeed API response body: %v", err)
	}

	// Check if status is OK
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get valid response from Indeed API, status code: %d", resp.StatusCode)
	}

	// Parse the JSON response - try first as array of Jobs/Metadata
	var result []json.RawMessage
	err = json.Unmarshal(body, &result)
	if err != nil {
		// If that fails, try as a direct array of jobs
		var jobs []Job
		err = json.Unmarshal(body, &jobs)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal Indeed API JSON response: %v", err)
		}

		// Convert Jobs to map[string]interface{} for consistency with other job sources
		return convertJobsToMaps(jobs), nil
	}

	// Process the mixed array of Job and Metadata objects
	var jobs []Job
	for _, obj := range result {
		// Try unmarshalling the object as a Job
		var job Job
		if err := json.Unmarshal(obj, &job); err == nil {
			jobs = append(jobs, job)
		}
		// We can ignore the metadata for now since we're just collecting jobs
	}

	// Convert Jobs to map[string]interface{} for consistency with other job sources
	return convertJobsToMaps(jobs), nil
}

func fetchJobs(company string, jobRole string, w http.ResponseWriter) ([]map[string]interface{}, error) {
	apiKey := os.Getenv("SCRAPING_DOG_API_KEY")

	// Fetch LinkedIn jobs
	jobRole_linkedin := jobRole + " AND " + company
	geoid := "103644278" // Example geoid for location
	sort_by := "week"
	page := "1"
	linkedinJobs, err := fetchLinkedInJobs(apiKey, jobRole_linkedin, geoid, page, sort_by)
	if err != nil {
		http.Error(w, `{"message": "Error fetching LinkedIn jobs"}`, http.StatusInternalServerError)
		return nil, err
	}

	// Fetch Google jobs
	googleQuery := fmt.Sprintf("%s AND %s", company, jobRole)
	googleJobs, err := fetchGoogleJobs(apiKey, googleQuery)
	if err != nil {
		// Log the error but continue with LinkedIn jobs
		fmt.Printf("Error fetching Google jobs: %v\n", err)
	}

	// Fetch Indeed jobs
	indeedJobs, err := fetchIndeedJobs(apiKey, company, jobRole)
	if err != nil {
		// Log the error but continue with other results
		fmt.Printf("Error fetching Indeed jobs: %v\n", err)
	}

	// Combine jobs from all sources
	var allJobs []map[string]interface{}
	allJobs = append(allJobs, linkedinJobs...)

	// Add Google jobs if available
	if googleJobs != nil && len(googleJobs) > 0 {
		allJobs = append(allJobs, googleJobs...)
	}

	// Add Indeed jobs if available
	if indeedJobs != nil && len(indeedJobs) > 0 {
		allJobs = append(allJobs, indeedJobs...)
	}

	// Filter jobs to include only those matching both company name and role
	var filteredJobs []map[string]interface{}
	for _, job := range allJobs {
		// Get company name from job data
		companyName, ok := job["company_name"].(string)
		if !ok {
			// Skip if company_name is not a string or doesn't exist
			continue
		}

		// Get job position from job data - try different field names
		var jobPosition string
		if pos, ok := job["job_position"].(string); ok {
			jobPosition = pos
		} else if title, ok := job["title"].(string); ok {
			jobPosition = title
		} else {
			// Skip if we can't find a job title/position
			continue
		}

		// Check if company matches
		companyMatches := strings.EqualFold(companyName, company) ||
			strings.Contains(strings.ToLower(companyName), strings.ToLower(company)) ||
			strings.Contains(strings.ToLower(company), strings.ToLower(companyName))

		// Check if job role matches
		// Split role into words and check if all words appear in the job position
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

// Helper function to identify common words that shouldn't be used for matching
func isCommonWord(word string) bool {
	commonWords := map[string]bool{
		"and": true,
		"or":  true,
		"the": true,
		"for": true,
		"in":  true,
		"at":  true,
		"of":  true,
		"to":  true,
		"a":   true,
		"an":  true,
	}

	return commonWords[word]
}
