# Role-Based Reports & Analytics System

## Overview

This system implements role-based reports and analytics that provide different levels of data access and insights based on user roles. Each user role has specific permissions and sees only the data relevant to their scope of responsibility.

## User Roles and Their Scopes

### 1. ADMIN
- **Scope**: Full system access
- **Access**: All users, projects, teams, and tasks across the entire organization
- **Reports Include**:
  - Total system users and active users
  - System-wide project metrics
  - Complete task analytics
  - Department performance across all departments
  - System health metrics
  - User activity trends
  - Administrative KPIs

### 2. CEO
- **Scope**: Organization-wide access
- **Access**: All users, projects, teams, and tasks in the organization (excluding admin users)
- **Reports Include**:
  - Organization performance metrics
  - Department-wise analytics
  - Project success rates
  - Team performance across all teams
  - User productivity metrics
  - Strategic KPIs
  - Executive dashboard with high-level insights

### 3. MANAGER
- **Scope**: Department scope
- **Access**: Self and all users in their department, including their tasks and projects
- **Reports Include**:
  - Department performance metrics
  - Team productivity within department
  - Project progress for department projects
  - Team member performance in department
  - Department task completion rates
  - Resource utilization within department
  - Department-specific KPIs

### 4. TEAM_LEAD
- **Scope**: Team scope
- **Access**: Self and team members, including team tasks and projects
- **Reports Include**:
  - Team performance metrics
  - Team member productivity
  - Team task completion rates
  - Project progress for team projects
  - Team efficiency metrics
  - Individual member performance within team
  - Team-specific KPIs

### 5. MEMBER
- **Scope**: Personal scope
- **Access**: Only own tasks and projects
- **Reports Include**:
  - Personal task completion metrics
  - Individual task performance
  - Personal productivity metrics
  - Task status overview for own tasks
  - Personal KPIs
  - Task history and trends
  - Performance tracking

## Implementation Details

### Frontend Components

#### 1. RoleBasedReports Component (`components/role-based-reports.tsx`)
- Main component that renders role-specific reports
- Displays role header with scope description
- Shows role-specific metrics and KPIs
- Renders appropriate sub-components based on user role

#### 2. Role-Specific Sub-Components
- `AdminReports`: System administration dashboard
- `CEOReports`: Executive dashboard
- `ManagerReports`: Department management dashboard
- `TeamLeadReports`: Team leadership dashboard
- `MemberReports`: Personal performance dashboard

#### 3. Analytics Service (`lib/analytics-service.ts`)
- Enhanced with role-based data filtering
- Caches data based on user role
- Provides role-specific scope descriptions
- Returns role-appropriate metrics

### Backend Implementation

#### 1. Role-Based Analytics Endpoint (`/reports/role-based/{user_role}`)
- Returns analytics data filtered by user role
- Uses hierarchy manager to determine data access scope
- Implements role-specific data aggregation

#### 2. Role-Specific Analytics Functions
- `get_admin_analytics()`: Full system metrics
- `get_ceo_analytics()`: Organization-wide metrics
- `get_manager_analytics()`: Department-scoped metrics
- `get_team_lead_analytics()`: Team-scoped metrics
- `get_member_analytics()`: Personal metrics

## Key Features

### 1. Data Security
- Users only see data they have permission to access
- Role-based data filtering at both frontend and backend
- Hierarchical access control using the existing hierarchy manager

### 2. Role-Specific Metrics
- Each role sees metrics relevant to their responsibilities
- KPIs tailored to role expectations
- Performance indicators appropriate for role level

### 3. Visual Indicators
- Role-specific icons and colors
- Clear scope descriptions
- Visual hierarchy in the interface

### 4. Responsive Design
- Works across different screen sizes
- Mobile-friendly role-based reports
- Adaptive layouts for different roles

## Usage

### For Developers

1. **Adding New Role-Specific Metrics**:
   ```typescript
   // In analytics-service.ts
   getRoleSpecificMetrics(userRole: string): string[] {
     const roleMetrics = {
       'NEW_ROLE': [
         'Custom Metric 1',
         'Custom Metric 2',
         // ... more metrics
       ]
     };
     return roleMetrics[userRole] || ['Default Metrics'];
   }
   ```

2. **Creating New Role Components**:
   ```typescript
   // In role-based-reports.tsx
   function NewRoleReports({ data, loading }: { data: any; loading: boolean }) {
     return (
       <div className="space-y-6">
         <Card>
           <CardHeader>
             <CardTitle>New Role Dashboard</CardTitle>
           </CardHeader>
           <CardContent>
             {/* Role-specific content */}
           </CardContent>
         </Card>
       </div>
     );
   }
   ```

3. **Adding Backend Analytics**:
   ```python
   # In reports.py
   async def get_new_role_analytics(db: Session, start_date: datetime, end_date: datetime, current_user: User):
       return {
           "role": "NEW_ROLE",
           "scope": "Custom scope description",
           "metrics": {
               # Custom metrics
           }
       }
   ```

### For Users

1. **Accessing Reports**:
   - Navigate to the Reports & Analytics page
   - The system automatically detects your role
   - Reports are filtered based on your permissions

2. **Understanding Your Scope**:
   - Each role has a clear scope description
   - Metrics are labeled with your role context
   - Data is automatically filtered to show only relevant information

3. **Exporting Reports**:
   - Export functionality respects role-based filtering
   - PDF and Excel exports contain only data you can access
   - Reports are labeled with your role and scope

## Testing

### Role-Based Test Component
Use the `RoleBasedTest` component to test different roles:

```typescript
import { RoleBasedTest } from "@/components/role-based-test";

// In your test page
<RoleBasedTest />
```

This component allows you to:
- Switch between different user roles
- Generate mock data for testing
- See how reports change based on role
- Verify role-specific metrics and KPIs

## Security Considerations

1. **Data Access Control**: Users can only access data within their role scope
2. **API Security**: Backend endpoints validate user permissions
3. **Frontend Filtering**: UI components respect role-based data access
4. **Export Security**: Exported reports contain only authorized data

## Future Enhancements

1. **Custom Dashboards**: Allow users to customize their dashboard layout
2. **Advanced Filtering**: Add more granular filtering options
3. **Real-time Updates**: Implement WebSocket updates for live data
4. **Mobile App**: Extend role-based reports to mobile applications
5. **Advanced Analytics**: Add machine learning insights based on role data

## Troubleshooting

### Common Issues

1. **Role Not Detected**: Ensure user is properly authenticated and role is set
2. **Missing Data**: Check if user has proper permissions for data access
3. **Performance Issues**: Role-based filtering may impact performance with large datasets
4. **Export Failures**: Ensure user has permission to export data in their scope

### Debug Mode

Enable debug mode to see role-based filtering in action:

```typescript
// In analytics-service.ts
private getUserRole(): string {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    console.log('User role detected:', user.role); // Debug log
    return user.role?.toUpperCase() || 'MEMBER';
  }
  return 'MEMBER';
}
```

This comprehensive role-based reports system ensures that each user sees only the data they need to perform their job effectively, while maintaining security and providing relevant insights for their role.
