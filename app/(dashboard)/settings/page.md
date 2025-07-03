# Dashboard Access Control Requirements

## User Roles and Permissions

- **Admin**: Full access to all pages and settings.
- **Waiter**: Access to Orders, Tables, and Menu pages. No access to Employees, Expenses, or Settings.
- **Kitchen**: Access to Orders and Menu pages only. No access to Employees, Expenses, Tables, or Settings.

## Access Control Rules

- Each user is assigned a role (Admin, Waiter, Kitchen).
- Access to pages is determined by the user's role.
- Unauthorized users attempting to access restricted pages are redirected to an error or login page.
- Admins can manage user roles and permissions from the Settings page.
- The Settings page allows admins to dynamically configure which roles have access to which pages.

## Implementation Notes

- Use middleware or higher-order components to enforce access control on each page.
- Store role and permission data in a secure and easily updatable format (e.g., database or config file).
- Provide a user-friendly interface for admins to update access control settings.