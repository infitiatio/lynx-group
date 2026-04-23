Feature: Authorization

Scenario: Unauthenticated request to protected endpoint returns 401
    When I request the protected health endpoint without authentication
    Then the response status code should be 401 Unauthorized