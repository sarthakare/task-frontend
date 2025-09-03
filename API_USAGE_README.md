# Comprehensive API Service Usage Guide

This document explains how to use the unified API service (`/lib/api-service.ts`) across all pages in the application. This service combines the functionality of the previous `api.ts` and `api-service.ts` files.

## Overview

The unified API service combines the functionality of the previous `api.ts` and `api-service.ts` files, eliminating the need to:
- Repeat API base URL in every component
- Write repetitive fetch logic
- Handle common error patterns manually
- Manage headers and request options separately
- Import from multiple API files

### What's Combined

- **Original `api.ts`**: Manual login/signup functions, `apiFetch` utility, URL building
- **Original `api-service.ts`**: Modular API endpoints, centralized error handling, utility functions
- **Result**: Single comprehensive service with all functionality and backward compatibility

## Basic Usage

### Import the API Service

```typescript
// Import the main API object
import { api } from "@/lib/api-service";

// Or import individual functions for backward compatibility
import { loginUser, signupUser, apiFetch } from "@/lib/api-service";
```

### Available API Modules

```typescript
// User Management
api.users.getAllUsers()
api.users.getUser(id)
api.users.createUser(userData)
api.users.updateUser(id, userData)
api.users.deleteUser(id)
api.users.getUserStats()

// Task Management
api.tasks.getAllTasks()
api.tasks.getTask(id)
api.tasks.createTask(taskData)
api.tasks.updateTask(id, taskData)
api.tasks.deleteTask(id)

// Project Management
api.projects.getAllProjects()
api.projects.getProject(id)
api.projects.createProject(projectData)
api.projects.updateProject(id, projectData)
api.projects.deleteProject(id)

// Team Management
api.teams.getAllTeams()
api.teams.getTeam(id)
api.teams.createTeam(teamData)
api.teams.addTeamMember(teamId, userId)
api.teams.removeTeamMember(teamId, userId)

// Authentication
api.auth.login(credentials)
api.auth.register(userData)
api.auth.loginUser(email, password)  // Manual login function
api.auth.signupUser(name, email, password, department, role)  // Manual signup function
api.auth.refreshToken(token)
api.auth.logout()

// Dashboard
api.dashboard.getOverview()
api.dashboard.getRecentActivities()
api.dashboard.getUpcomingDeadlines()
```

## Example Implementations

### Before (Old Way)
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    const data = await response.json();
    setUsers(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch users');
  }
};
```

### After (New Way)
```typescript
import { api } from "@/lib/api-service";

const fetchUsers = async () => {
  try {
    const data = await api.users.getAllUsers();
    setUsers(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch users', {
      description: api.utils.handleError(error)
    });
  }
};
```

## Error Handling

The API service provides consistent error handling:

```typescript
try {
  const data = await api.users.getAllUsers();
  // Handle success
} catch (error) {
  // Use the utility function for consistent error messages
  const errorMessage = api.utils.handleError(error);
  toast.error('Operation failed', { description: errorMessage });
}
```

## Utility Functions

```typescript
// Get API base URL
const baseURL = api.utils.getBaseURL();

// Create full URL for custom requests
const fullURL = api.utils.createURL('/custom/endpoint');

// Build URL with proper formatting (from original api.ts)
const buildUrl = api.utils.buildUrl('/custom/endpoint');

// Handle errors consistently
const errorMessage = api.utils.handleError(error);

// Check if response is successful
const isSuccess = api.utils.isSuccess(response);

// Parse error response
const errorDetail = await api.utils.parseError(response);

// Generic API fetch (from original api.ts)
const response = await apiFetch('/custom/endpoint', options);
```

## Benefits

1. **DRY Principle**: No more repeated API base URLs
2. **Consistent Error Handling**: All errors are handled the same way
3. **Type Safety**: Better TypeScript support with proper interfaces
4. **Maintainability**: Single place to update API endpoints
5. **Testing**: Easier to mock and test API calls
6. **Headers Management**: Automatic content-type and authorization headers
7. **Request/Response Logging**: Centralized logging for debugging

## Migration Guide

### Step 1: Remove Old Imports
```typescript
// Remove these lines
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
import { getToken } from "@/utils/auth";
import { apiFetch } from "@/lib/api";  // Now available from api-service.ts
```

### Step 2: Import API Service
```typescript
// Import the main API object
import { api } from "@/lib/api-service";

// Or import individual functions for backward compatibility
import { loginUser, signupUser, apiFetch } from "@/lib/api-service";
```

### Step 3: Replace Fetch Calls
```typescript
// Old
const response = await fetch(`${API_BASE_URL}/users/`);
const data = await response.json();

// New
const data = await api.users.getAllUsers();
```

### Step 4: Update Error Handling
```typescript
// Old
if (!response.ok) {
  throw new Error(`Failed to fetch: ${response.status}`);
}

// New
// Error handling is automatic in the API service
```

## Adding New Endpoints

To add new API endpoints, update the `api-service.ts` file:

```typescript
export const newModuleAPI = {
  getData: () => apiRequest<any[]>('/new-endpoint/'),
  createData: (data: any) => apiRequest<any>('/new-endpoint/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Add to main api object
export const api = {
  // ... existing modules
  newModule: newModuleAPI,
};
```

## Best Practices

1. **Always use the API service** instead of direct fetch calls
2. **Use the utility functions** for consistent error handling
3. **Handle errors gracefully** with try-catch blocks
4. **Use proper TypeScript interfaces** for request/response data
5. **Keep the API service updated** when backend endpoints change
6. **Use descriptive function names** that match the backend routes

## Troubleshooting

### Common Issues

1. **Type Errors**: Ensure proper TypeScript interfaces are defined
2. **Network Errors**: Check if the backend server is running
3. **CORS Issues**: Verify backend CORS configuration
4. **Authentication**: Ensure proper token handling in headers

### Debug Mode

Enable debug logging by setting:
```typescript
// In api-service.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('API Request:', { url, options });
  console.log('API Response:', response);
}
```

This centralized approach makes the codebase more maintainable, consistent, and easier to debug.
