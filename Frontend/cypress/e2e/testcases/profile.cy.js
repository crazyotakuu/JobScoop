describe('Profile Page Tests', () => {
  beforeEach(() => {
    // Visit login page
    cy.visit('http://localhost:3000/login')
    cy.wait(500)
    
    // Set up intercept for login request BEFORE clicking the button
    cy.intercept('POST', '**/login').as('loginRequest')
    
    // Login with credentials
    cy.get("[name='username']").type("ultimategamervivek@gmail.com")
    cy.wait(500)
    cy.get("[name='password']").type("Vivek@123")
    cy.wait(500)
    cy.get("button[type='button']").should('not.be.disabled').click()
    
    // Wait for login to complete and navigation to home
    cy.wait('@loginRequest')
    cy.url({ timeout: 10000 }).should('include', '/home')
    
    // Navigate to profile page
    cy.visit('http://localhost:3000/profile')
    cy.wait(500)
    cy.url().should('include', '/profile')
  })

  it('should successfully navigate to profile page', () => {
    // Verify we're on the profile page
    cy.contains('USER PROFILE').should('be.visible')
  })

  it('should allow changing the user name', () => {
    // Wait for profile data to load
    cy.wait(500)
    
    // Click the edit button next to the name
    cy.get("button[id='edit-name-button']").should('be.visible').click()
    cy.wait(500)
    
    // Enter new name
    cy.get('input[type="text"]').clear().type('Vishnu Vivek Valeti')
    cy.wait(500)
    
    // Click save button
    cy.get('button').contains('Save').click()
    cy.wait(500)
    
    // Verify success message
    cy.contains('Name Change Succesfull').should('be.visible')
  })

  it('should display subscriptions', () => {
    // Wait for profile data to load
    cy.wait(500)
    
    // Check if subscriptions text is visible
    cy.contains('Subscriptions').should('be.visible')
  })

 
  it('should allow changing the password with valid requirements', () => {
    // Wait for profile data to load
    cy.wait(500)
    
    // Click the change password button
    cy.get('button').contains('Change Password').should('be.visible').click()
    cy.wait(500)
    
    // Enter new password following requirements:
    // - At least one uppercase (V)
    // - At least one lowercase (ivek)
    // - At least one number (1234)
    // - At least one special character (#)
    cy.get('input[type="password"]').first().type('Vivek#1234')
    cy.wait(500)
    cy.get('input[type="password"]').last().type('Vivek#1234')
    cy.wait(500)
    
    // Click confirm button
    cy.get('button').contains('Confirm').click()
    cy.wait(500)
    
    // Verify success message
    cy.contains('Password Change Succesful').should('be.visible')
  })
})
