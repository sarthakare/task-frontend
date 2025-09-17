# Notifications System

## Overview
The notifications system provides real-time and persistent notifications for task management activities. Users receive both immediate toast notifications and persistent database notifications that can be managed through the notification bell and dedicated notifications page.

## Features

### 🔔 Real-time Notifications
- **WebSocket Integration**: Instant toast notifications when tasks are assigned, updated, or status changes
- **Auto-refresh**: Notification bell automatically updates when new notifications arrive
- **Priority-based styling**: Different colors and icons for urgent, high, medium, and low priority notifications

### 📱 Notification Bell Component
- **Unread count badge**: Shows number of unread notifications
- **Quick preview**: View recent notifications in a popover
- **Quick actions**: Mark as read, delete, or view all notifications
- **Real-time updates**: Automatically refreshes when new notifications arrive

### 📄 Notifications Page
- **Comprehensive view**: See all notifications with full details
- **Advanced filtering**: Filter by type, priority, and read status
- **Search functionality**: Search through notification titles and messages
- **Bulk actions**: Select multiple notifications for batch operations
- **Statistics dashboard**: View total, unread, read, and archived counts

## Notification Types

### Task-related Notifications
- **Task Assigned**: When a task is assigned to a user
- **Task Updated**: When task details are modified
- **Task Status Changed**: When task status is updated
- **Task Due Soon**: When a task is approaching its due date
- **Task Overdue**: When a task has passed its due date

### Team-related Notifications
- **Team Member Added**: When a new member joins a team
- **Team Member Removed**: When a member is removed from a team

### Project-related Notifications
- **Project Created**: When a new project is created
- **Project Updated**: When project details are modified

### System Notifications
- **Reminder**: General reminder notifications
- **System**: System-wide announcements
- **Message**: Direct messages between users

## Priority Levels

- **Urgent** 🔴: Critical notifications requiring immediate attention
- **High** 🟠: Important notifications that should be addressed soon
- **Medium** 🔵: Standard notifications for regular updates
- **Low** 🟢: Informational notifications with low urgency

## Usage

### For Users
1. **View notifications**: Click the notification bell in the sidebar
2. **Manage notifications**: Use the notifications page for detailed management
3. **Filter notifications**: Use filters to find specific notifications
4. **Bulk actions**: Select multiple notifications for batch operations

### For Developers
1. **Create notifications**: Use the notification utility functions in `app/utils/notifications.py`
2. **Send real-time notifications**: WebSocket notifications are automatically sent
3. **Customize notification types**: Add new notification types in the enum definitions

## API Endpoints

### Get Notifications
```
GET /notifications
Query Parameters:
- limit: Number of notifications to return (default: 20)
- offset: Number of notifications to skip (default: 0)
- type: Filter by notification type
- priority: Filter by priority level
- is_read: Filter by read status
```

### Get Notification Stats
```
GET /notifications/stats
Returns: total_count, unread_count, read_count, archived_count
```

### Mark as Read
```
PUT /notifications/{id}/read
```

### Delete Notification
```
DELETE /notifications/{id}
```

### Bulk Operations
```
PUT /notifications/bulk/update
DELETE /notifications/bulk/delete
PUT /notifications/mark-all-read
```

## Database Schema

### Notifications Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `title`: Notification title
- `message`: Notification message
- `notification_type`: Type of notification (enum)
- `priority`: Priority level (enum)
- `is_read`: Read status
- `is_archived`: Archived status
- `related_entity_type`: Type of related entity (e.g., 'task', 'project')
- `related_entity_id`: ID of related entity
- `created_at`: Creation timestamp
- `read_at`: Read timestamp
- `expires_at`: Expiration timestamp (optional)
- `extra_data`: Additional JSON data

## Integration Points

### Task Management
- Notifications are automatically created when:
  - Tasks are assigned to users
  - Task details are updated
  - Task status changes
  - Tasks are reassigned

### WebSocket Integration
- Real-time notifications are sent via WebSocket
- Notification bell automatically refreshes when new notifications arrive
- Toast notifications provide immediate feedback

### User Experience
- **Hydration-safe**: Components handle server-side rendering properly
- **Responsive design**: Works on desktop and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Efficient loading and caching of notification data

## Future Enhancements

- **Email notifications**: Send email notifications for important events
- **Push notifications**: Browser push notifications for offline users
- **Notification preferences**: User-configurable notification settings
- **Notification templates**: Customizable notification templates
- **Analytics**: Notification engagement and response analytics
- **Scheduled notifications**: Time-based notification delivery
- **Notification channels**: Multiple delivery channels (in-app, email, SMS)
