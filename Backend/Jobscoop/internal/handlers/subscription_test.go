package handlers

import (
	"JobScoop/internal/db"
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"math"
	"time"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

// Mock implementations of helper functions
func mockGetUserIDByEmail(email string) (int, error) {
	if email == "test@example.com" {
		return 1, nil
	}
	return 0, errors.New("user not found")
}

func mockGetOrCreateCompanyID(companyName string) (int, error) {
	return 1, nil
}

func mockGetOrCreateCareerSiteID(url string, companyID int) (int, error) {
	return 1, nil
}

func mockGetOrCreateRoleID(roleName string) (int, error) {
	return 1, nil
}

func mockGetCompanyIDIfExists(companyName string) (int, error) {
	if companyName == "TestCompany" {
		return 1, nil
	}
	return 0, errors.New("company not found")
}

func mockGetCompanyNameByID(companyID int) (string, error) {
	if companyID == 1 {
		return "Mock Company", nil
	}
	return "", errors.New("company not found")
}

func mockGetCareerSiteLinkByID(careerSiteID int) (string, error) {
	return "https://mock-career.com", nil
}

func mockGetRoleNameByID(roleID int) (string, error) {
	return "Mock Role", nil
}

func TestSaveSubscriptionsHandler(t *testing.T) {
	// Mock the database
	mockDB, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer mockDB.Close()

	// Replace the actual DB with the mock
	db.DB = mockDB

	// Override function pointers with mock functions
	getUserIDByEmailFunc = mockGetUserIDByEmail
	getOrCreateCompanyIDFunc = mockGetOrCreateCompanyID
	getOrCreateCareerSiteIDFunc = mockGetOrCreateCareerSiteID
	getOrCreateRoleIDFunc = mockGetOrCreateRoleID

	// Construct request payload
	reqBody := map[string]interface{}{
		"email": "test@example.com",
		"subscriptions": []map[string]interface{}{
			{
				"companyName": "Test Company",
				"careerLinks": []string{"https://test.com/careers"},
				"roleNames":   []string{"Software Engineer"},
			},
		},
	}
	jsonData, _ := json.Marshal(reqBody)

	// Expect query to check for existing subscription
	mock.ExpectQuery("SELECT career_site_ids, role_ids FROM subscriptions").
		WithArgs(1, 1).
		WillReturnError(sql.ErrNoRows)

	// Expect query to insert new subscription
	mock.ExpectExec("INSERT INTO subscriptions").
		WithArgs(1, 1, pq.Array([]int64{1}), pq.Array([]int64{1}), sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Create a request
	r := httptest.NewRequest("POST", "/save-subscription", bytes.NewBuffer(jsonData))
	r.Header.Set("Content-Type", "application/json")

	// Create a ResponseRecorder to capture the response
	w := httptest.NewRecorder()

	// Call the handler
	SaveSubscriptionsHandler(w, r)

	// Validate response
	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "Subscription processed successfully", resp["message"])
	assert.Equal(t, "success", resp["status"])

	// Ensure all expectations were met
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestFetchUserSubscriptionsHandler(t *testing.T) {
	// Initialize mock database
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("error initializing mock db: %v", err)
	}
	defer mockDB.Close()

	// Replace the db instance with mock
	db.DB = mockDB

	// Set mock function variables
	getCompanyNameByIDFunc = mockGetCompanyNameByID
	getCareerSiteLinkByIDFunc = mockGetCareerSiteLinkByID
	getRoleNameByIDFunc = mockGetRoleNameByID
	getUserIDByEmailFunc = mockGetUserIDByEmail

	// Mock SQL query for subscriptions
	rows := sqlmock.NewRows([]string{"id", "company_id", "career_site_ids", "role_ids", "active"}).
		AddRow(1, 1, "{1,2}", "{1,2}", true)

	mock.ExpectQuery(`SELECT id, company_id, career_site_ids, role_ids, active FROM subscriptions WHERE user_id=\$1`).
		WithArgs(1).
		WillReturnRows(rows)

	// Prepare test request
	reqBody, _ := json.Marshal(map[string]string{"email": "test@example.com"})
	req := httptest.NewRequest(http.MethodPost, "/subscriptions", bytes.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")

	// Capture response
	respRecorder := httptest.NewRecorder()
	FetchUserSubscriptionsHandler(respRecorder, req)

	// Validate response
	if status := respRecorder.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var response map[string]interface{}
	err = json.Unmarshal(respRecorder.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("error decoding response JSON: %v", err)
	}

	if response["status"] != "success" {
		t.Errorf("unexpected response status: got %v want %v", response["status"], "success")
	}

	if _, exists := response["subscriptions"]; !exists {
		t.Errorf("Response missing subscriptions field")
		t.Logf("Actual Response: %s", respRecorder.Body.String())
	}

}

func TestUpdateSubscriptionsHandler(t *testing.T) {
	// Create a mock DB
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("error initializing mock db: %v", err)
	}
	defer mockDB.Close()
	db.DB = mockDB

	getUserIDByEmailFunc = mockGetUserIDByEmail
	getCompanyIDIfExistsFunc = mockGetCompanyIDIfExists
	getOrCreateCareerSiteIDFunc = mockGetOrCreateCareerSiteID
	getOrCreateRoleIDFunc = mockGetOrCreateRoleID

	// Define request payload
	reqBody := UpdateSubscriptionsRequest{
		Email: "test@example.com",
		Subscriptions: []struct {
			CompanyName string   `json:"companyName"`
			CareerLinks []string `json:"careerLinks,omitempty"`
			RoleNames   []string `json:"roleNames,omitempty"`
			Active      *bool    `json:"active,omitempty"`
		}{
			{
				CompanyName: "TestCompany",
				CareerLinks: []string{"https://example.com/careers"},
				RoleNames:   []string{"Software Engineer"},
			},
		},
	}
	body, _ := json.Marshal(reqBody)

	mock.ExpectQuery("SELECT id FROM subscriptions WHERE user_id=\\$1 AND company_id=\\$2").
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

	mock.ExpectExec("UPDATE subscriptions").
		WithArgs(pq.Array([]int64{1}), pq.Array([]int64{1}), sqlmock.AnyArg(), 1, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Create request
	req := httptest.NewRequest(http.MethodPost, "/update-subscriptions", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	// Call handler
	UpdateSubscriptionsHandler(w, req)

	// Validate response
	res := w.Result()
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		t.Errorf("expected status OK; got %v", res.StatusCode)
	}

	var respBody map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&respBody); err != nil {
		t.Fatalf("error decoding response: %v", err)
	}

	if respBody["status"] != "success" {
		t.Errorf("expected success status; got %v", respBody["status"])
	}

	// Ensure expectations were met
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
		t.Logf("Actual Response: %v", respBody)
	}
}

func TestDeleteSubscriptionsHandler(t *testing.T) {
	// Create a mock database
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock database: %v", err)
	}
	defer mockDB.Close()

	db.DB = mockDB // Assign mockDB to the actual DB variable
	getUserIDByEmailFunc = mockGetUserIDByEmail
	getCompanyIDIfExistsFunc = mockGetCompanyIDIfExists
	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectDBCalls  bool
		mockDBResponse func()
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "Valid request - subscription deleted",
			requestBody: map[string]interface{}{
				"email":         "test@example.com",
				"subscriptions": []string{"TestCompany"},
			},
			expectDBCalls: true,
			mockDBResponse: func() {
				mock.ExpectExec("DELETE FROM subscriptions").
					WithArgs(1, 1).
					WillReturnResult(sqlmock.NewResult(0, 1)) // 1 row affected
			},
			expectedStatus: http.StatusOK,
			expectedBody:   `{"message":"Deleted subscription(s) successfully","status":"success"}`,
		},
		{
			name: "Invalid request - missing email",
			requestBody: map[string]interface{}{
				"subscriptions": []string{"TestCompany"},
			},
			expectDBCalls:  false,
			mockDBResponse: nil,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"message": "Email is required"}`,
		},
		{
			name: "Invalid request - user not found",
			requestBody: map[string]interface{}{
				"email":         "unknown@example.com",
				"subscriptions": []string{"TestCompany"},
			},
			expectDBCalls:  false,
			mockDBResponse: nil,
			expectedStatus: http.StatusNotFound,
			expectedBody:   `{"message": "User not found"}`,
		},
		{
			name: "Invalid request - no subscriptions provided",
			requestBody: map[string]interface{}{
				"email":         "test@example.com",
				"subscriptions": []string{},
			},
			expectDBCalls:  false,
			mockDBResponse: nil,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `{"message": "No subscriptions provided to delete"}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.expectDBCalls && tt.mockDBResponse != nil {
				tt.mockDBResponse()
			}

			reqBody, _ := json.Marshal(tt.requestBody)
			req := httptest.NewRequest("POST", "/delete-subscriptions", bytes.NewBuffer(reqBody))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			DeleteSubscriptionsHandler(w, req)

			res := w.Result()
			defer res.Body.Close()

			if res.StatusCode != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, res.StatusCode)
			}

			actualBody := strings.TrimSpace(w.Body.String())
			if actualBody != tt.expectedBody {
				t.Errorf("Expected response body %s, got %s", tt.expectedBody, actualBody)
			}
		})
	}
}

func TestFetchAllSubscriptionsHandler(t *testing.T) {
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock database: %v", err)
	}
	defer mockDB.Close()

	db.DB = mockDB // Assign mockDB to the actual DB variable

	// Mock companies query
	mock.ExpectQuery("SELECT id, name FROM companies").
		WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).
			AddRow(1, "Company A").
			AddRow(2, "Company B"))

	// Mock career_sites query
	mock.ExpectQuery("SELECT link FROM career_sites WHERE company_id = \\$1").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"link"}).
			AddRow("https://companyA.com/careers"))

	mock.ExpectQuery("SELECT link FROM career_sites WHERE company_id = \\$1").
		WithArgs(2).
		WillReturnRows(sqlmock.NewRows([]string{"link"}).
			AddRow("https://companyB.com/careers"))

	// Mock roles query
	mock.ExpectQuery("SELECT name FROM roles").
		WillReturnRows(sqlmock.NewRows([]string{"name"}).
			AddRow("Software Engineer").
			AddRow("Data Scientist"))

	r := httptest.NewRequest("GET", "/subscriptions", nil)
	w := httptest.NewRecorder()

	FetchAllSubscriptionsHandler(w, r) // Call handler

	// Assert response
	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	var response FetchAllSubscriptionsResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	// Validate response content
	expectedCompanies := map[string][]string{
		"Company A": {"https://companyA.com/careers"},
		"Company B": {"https://companyB.com/careers"},
	}
	if len(response.Companies) != len(expectedCompanies) {
		t.Errorf("expected %d companies, got %d", len(expectedCompanies), len(response.Companies))
	}

	expectedRoles := []string{"Software Engineer", "Data Scientist"}
	if len(response.Roles) != len(expectedRoles) {
		t.Errorf("expected %d roles, got %d", len(expectedRoles), len(response.Roles))
	}

	// Ensure all expectations were met
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestFetchSubscriptionFrequenciesHandler(t *testing.T) {
	// 1. Set up mock DB and replace global db.DB
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("error initializing mock db: %v", err)
	}
	defer mockDB.Close()
	db.DB = mockDB

	// 2. Mock: DISTINCT company_id
	mock.ExpectQuery(`SELECT DISTINCT company_id FROM subscriptions`).
		WillReturnRows(sqlmock.NewRows([]string{"company_id"}).AddRow(100))

	// 3. Mock: company name lookup
	mock.ExpectQuery(`SELECT name FROM companies WHERE id = \$1`).
		WithArgs(100).
		WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Adobe"))

	// 4. Mock: total subscriptions count
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM subscriptions WHERE company_id = \$1`).
		WithArgs(100).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(10))

	// 5. Mock: per-role counts via unnest
	mock.ExpectQuery(`unnest\(role_ids\)`).
		WithArgs(100).
		WillReturnRows(sqlmock.NewRows([]string{"roleid", "cnt"}).
			AddRow(5, 7).
			AddRow(6, 3),
		)

	// 6. Mock: role name lookups
	mock.ExpectQuery(`SELECT name FROM roles WHERE id = \$1`).
		WithArgs(5).
		WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Engineer"))
	mock.ExpectQuery(`SELECT name FROM roles WHERE id = \$1`).
		WithArgs(6).
		WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Analyst"))

	// 7. Perform the request
	req := httptest.NewRequest(http.MethodGet, "/subscriptions/frequencies", nil)
	w := httptest.NewRecorder()
	FetchSubscriptionFrequenciesHandler(w, req)

	// 8. Verify HTTP response
	res := w.Result()
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.StatusCode)
	}

	// 9. Decode JSON
	var stats []SubscriptionStat
	if err := json.NewDecoder(res.Body).Decode(&stats); err != nil {
		t.Fatalf("error decoding response: %v", err)
	}

	// 10. Assertions
	if len(stats) != 2 {
		t.Fatalf("expected 2 subscription stats, got %d", len(stats))
	}

	// Because SQL GROUP BY has no guaranteed ordering, find by role name
	var gotEng, gotAnl *SubscriptionStat
	for i := range stats {
		switch stats[i].Role {
		case "Engineer":
			gotEng = &stats[i]
		case "Analyst":
			gotAnl = &stats[i]
		}
	}

	if gotEng == nil {
		t.Error("missing Engineer record")
	} else {
		if gotEng.Company != "Adobe" {
			t.Errorf("Engineer: expected company Adobe, got %s", gotEng.Company)
		}
		if gotEng.Count != 7 {
			t.Errorf("Engineer: expected count 7, got %d", gotEng.Count)
		}
		if gotEng.Total != 10 {
			t.Errorf("Engineer: expected total 10, got %d", gotEng.Total)
		}
		if math.Abs(gotEng.Frequency-0.7) > 1e-6 {
			t.Errorf("Engineer: expected frequency 0.7, got %f", gotEng.Frequency)
		}
	}

	if gotAnl == nil {
		t.Error("missing Analyst record")
	} else {
		if gotAnl.Company != "Adobe" {
			t.Errorf("Analyst: expected company Adobe, got %s", gotAnl.Company)
		}
		if gotAnl.Count != 3 {
			t.Errorf("Analyst: expected count 3, got %d", gotAnl.Count)
		}
		if gotAnl.Total != 10 {
			t.Errorf("Analyst: expected total 10, got %d", gotAnl.Total)
		}
		if math.Abs(gotAnl.Frequency-0.3) > 1e-6 {
			t.Errorf("Analyst: expected frequency 0.3, got %f", gotAnl.Frequency)
		}
	}

	// 11. Ensure all expectations were met
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet sqlmock expectations: %v", err)
	}
}


func TestFetchAllUserSubscriptionsHandler(t *testing.T) {
    // 1. Initialize sqlmock and swap in mock DB
    mockDB, mock, err := sqlmock.New()
    if err != nil {
        t.Fatalf("error initializing mock db: %v", err)
    }
    defer mockDB.Close()
    db.DB = mockDB

    // 2. Prepare test timestamps
    t1 := time.Date(2025, 4, 18, 14, 30, 0, 0, time.UTC)
    t2 := time.Date(2025, 4, 19, 9, 15, 0, 0, time.UTC)

    // 3. Expect the query and return two rows
    mock.ExpectQuery(`SELECT\s+u\.name\s+AS user_name,`).
        WillReturnRows(sqlmock.NewRows([]string{
            "user_name", "company_name", "date", "role_names",
        }).
            // Note: Postgres array literal syntax for the role_names column
            AddRow("Abhinav", "Google", t1, "{software engineer,data engineer}").
            AddRow("Abhinav", "Tesla", t2, "{AI engineer}"),
        )

    // 4. Perform the HTTP request
    req := httptest.NewRequest(http.MethodGet, "/api/user-subscriptions", nil)
    w := httptest.NewRecorder()
    FetchAllUserSubscriptionsHandler(w, req)

    // 5. Assert HTTP status
    res := w.Result()
    defer res.Body.Close()
    if res.StatusCode != http.StatusOK {
        t.Fatalf("expected status 200, got %d", res.StatusCode)
    }

    // 6. Decode response
    var got []UserCompanySubscription
    if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
        t.Fatalf("error decoding response JSON: %v", err)
    }

    // 7. Expect two records
    if len(got) != 2 {
        t.Fatalf("expected 2 records, got %d", len(got))
    }

    // 8. Locate entries by company
    var g1, g2 *UserCompanySubscription
    for i := range got {
        switch got[i].Company {
        case "Google":
            g1 = &got[i]
        case "Tesla":
            g2 = &got[i]
        }
    }

    // 9. Assertions for Google entry
    if g1 == nil {
        t.Error("missing entry for company Google")
    } else {
        if g1.User != "Abhinav" {
            t.Errorf("Google: expected user 'Abhinav', got %q", g1.User)
        }
        if !g1.Date.Equal(t1) {
            t.Errorf("Google: expected date %v, got %v", t1, g1.Date)
        }
        // roleNames order isn't guaranteed by SQL; compare as a map
        wantRoles1 := map[string]bool{
            "software engineer": true,
            "data engineer":     true,
        }
        if len(g1.RoleNames) != len(wantRoles1) {
            t.Errorf("Google: expected %d roles, got %v", len(wantRoles1), g1.RoleNames)
        }
        for _, r := range g1.RoleNames {
            if !wantRoles1[r] {
                t.Errorf("Google: unexpected role %q", r)
            }
        }
    }

    // 10. Assertions for Tesla entry
    if g2 == nil {
        t.Error("missing entry for company Tesla")
    } else {
        if g2.User != "Abhinav" {
            t.Errorf("Tesla: expected user 'Abhinav', got %q", g2.User)
        }
        if !g2.Date.Equal(t2) {
            t.Errorf("Tesla: expected date %v, got %v", t2, g2.Date)
        }
        if len(g2.RoleNames) != 1 || g2.RoleNames[0] != "AI engineer" {
            t.Errorf("Tesla: expected [\"AI engineer\"], got %v", g2.RoleNames)
        }
    }

    // 11. Ensure all expectations were met
    if err := mock.ExpectationsWereMet(); err != nil {
        t.Errorf("unmet sqlmock expectations: %v", err)
    }
}