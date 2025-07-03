# Dashboard Access Control Requirements

## User Role Permissions

### Admin Role
**Full Access - Can perform all CRUD operations:**
- Dashboard (main) 
- Rooms management (create, read, update, delete)
- Tables management (create, read, update, delete)
- Reservations management (create, read, update, delete)
- Employee management (create, read, update, delete)
- Users management (create, read, update, delete)
- Orders (create, read, update, delete)
- Menu access (create, read, update, delete)
- Order details (create, read, update, delete)

### Waiter Role
**Limited Access:**
- Menu (read-only)
- Orders (create new orders, read existing orders)
- Can update order status to "served"

### Kitchen Role
**Order Management Focus:**
- Orders (read-only)
- Order details (read-only) 
- Can update order status to "in_process" or "served"

## Access Control Rules
- Redirect non-admin users away from restricted pages
- Show only accessible pages in navigation based on user role
- Implement proper authentication checks on each page

## Settings Page Requirement
Create a settings page where admins can configure page access permissions for each user role. Display it in this format:

```
ADMIN
├── Dashboard
├── Rooms
├── Tables
├── Reservations
├── Employees
├── Users
├── Orders
├── Menu
└── Order Details

WAITER  
├── Menu
├── Orders
└── Order Details

KITCHEN
├── Orders
└── Order Details
```

The settings page should allow admins to grant/revoke access to specific pages for each role dynamically.