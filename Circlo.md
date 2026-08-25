# Product Requirements Document (PRD)

# Reddit-Inspired Social Discussion Platform

## 1. Product Overview

### Product Name

Reddit-Inspired Social Discussion Platform

### Product Type

Community-driven social discussion platform

### Objective

Build a full-stack MERN application inspired by Reddit where users can create and join communities, publish posts, participate in discussions, vote on content, save posts, and discover content through personalized feeds.

The project is intended as a portfolio-grade application and as a practical exercise in designing and implementing a complete MERN backend and frontend without following a step-by-step tutorial.

### Target Stack

- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT with access and refresh tokens
- Password hashing: bcrypt
- Media storage: Cloudinary or equivalent
- API style: REST
- Deployment: To be decided
- Real-time communication: Not required for V1

---

# 2. Product Goals

## Primary Goals

1. Allow users to create accounts and securely authenticate.
2. Allow users to create and participate in communities.
3. Allow users to create, edit, delete, and discover posts.
4. Allow users to comment and reply to comments.
5. Implement upvotes/downvotes for posts and comments.
6. Provide feeds for discovering relevant content.
7. Provide search functionality.
8. Implement user profiles and karma.
9. Implement community moderation and permissions.
10. Build a clean, responsive interface suitable for a portfolio project.

## Learning Goals

The project should provide practical experience with:

- REST API design
- Authentication and authorization
- MongoDB schema design
- Mongoose relationships and population
- MongoDB aggregation pipelines
- Pagination
- Search and filtering
- File uploads
- Role-based permissions
- Complex business logic
- Frontend state management
- Error handling
- API validation
- Deployment

---

# 3. Scope

## V1 — Core Product

The first version should include:

- Authentication
- User profiles
- Communities
- Community membership
- Community moderators
- Posts
- Comments
- Nested comments
- Voting
- Saved posts
- Home feed
- Community feed
- Search
- Karma
- Basic moderation

## V2 — Future Features

These should NOT block V1:

- Notifications
- Real-time messaging
- Real-time notifications
- Awards
- Advanced recommendation algorithm
- Video processing
- Live chat
- Direct messages
- Advanced moderation automation
- Mobile application

---

# 4. User Roles

## 4.1 Guest

A guest can:

- View public communities
- View public posts
- Search public content
- View user profiles
- Register
- Login

A guest cannot:

- Create posts
- Comment
- Vote
- Save posts
- Join communities
- Create communities

---

## 4.2 Registered User

A registered user can:

- Manage their profile
- Join communities
- Leave communities
- Create posts
- Edit their own posts
- Delete their own posts
- Comment
- Reply to comments
- Edit their own comments
- Delete their own comments
- Upvote/downvote posts
- Upvote/downvote comments
- Save/unsave posts
- View their saved posts
- Create communities
- Report content
- View their karma

---

## 4.3 Community Moderator

A moderator can:

- Remove posts
- Remove comments
- Ban/unban users from a community
- Edit community rules
- Manage community information
- Pin important posts
- View moderation-related information

Moderators cannot:

- Modify users outside their community
- Modify platform-wide settings
- Access another community's moderation controls

---

## 4.4 Platform Admin

The admin can:

- Manage users
- Manage communities
- Remove inappropriate content
- Manage reports
- Suspend users
- Delete communities
- View platform statistics

---

# 5. Core Features

# 5.1 Authentication

## Registration

Users should be able to register using:

- Username
- Email
- Password

Requirements:

- Username must be unique.
- Email must be unique.
- Password must satisfy minimum security requirements.
- Password must be hashed before storage.
- Validation errors must be returned clearly.

## Login

Users can log in using:

- Email/username
- Password

Successful login should provide:

- Access token
- Refresh token

## Logout

Logout should invalidate/remove the active authentication session according to the chosen token strategy.

## Token Refresh

The application should support access-token renewal using the refresh token.

## Password Management

Users should be able to:

- Change password while authenticated.
- Request password reset.
- Reset password using a secure reset mechanism.

---

# 5.2 User Profiles

Each user should have:

- Username
- Display name
- Email
- Avatar
- Bio
- Karma
- Account creation date
- Post count
- Comment count

Profile pages should display:

- User information
- User posts
- User comments
- Karma

Users can edit:

- Display name
- Bio
- Avatar

Username should not be freely changeable unless explicitly supported by the implementation.

---

# 5.3 Communities

Communities are topic-based spaces where users can discuss a specific subject.

Example:

- Programming
- Gaming
- Movies
- Technology
- College
- Finance

## Create Community

A registered user can create a community.

Required:

- Community name
- Description

Optional:

- Community icon/banner
- Rules

Community name must be unique.

## Community Page

The community page should show:

- Community name
- Description
- Members count
- Moderator information
- Rules
- Posts
- Join/leave button

## Membership

Users can:

- Join a community
- Leave a community

The system should prevent duplicate memberships.

---

# 5.4 Community Moderation

Every community must have at least one owner/moderator.

Moderators can:

- Remove posts
- Remove comments
- Ban users
- Unban users
- Pin posts
- Update rules
- Update community information

A banned user should not be able to create posts or comments in that community.

---

# 5.5 Posts

Users can create posts inside communities.

## Post Types

V1 should support:

1. Text post
2. Image post
3. Link post

## Post Fields

A post should contain conceptually:

- Author
- Community
- Title
- Body/content
- Post type
- Media URL when applicable
- Link URL when applicable
- Upvote count
- Downvote count
- Comment count
- Created timestamp
- Updated timestamp
- Deleted/removed status

## Create Post

Users must:

- Be authenticated.
- Be a member of the community.
- Not be banned from the community.

## Edit Post

Only:

- The author
- An authorized moderator

can modify a post.

## Delete Post

Authors can delete their own posts.

Moderators/admins can remove posts according to permissions.

Deleted content should be handled consistently rather than causing broken references.

---

# 5.6 Voting System

Users can vote on:

- Posts
- Comments

Supported actions:

- Upvote
- Downvote
- Remove vote

Rules:

- A user can have at most one active vote per target.
- A user cannot simultaneously upvote and downvote the same target.
- Voting again should change or remove the existing vote according to the chosen UI behavior.
- Vote counts must remain consistent.

Example:

User currently upvotes a post.

If the user clicks downvote:

Previous state:
UPVOTE

New state:
DOWNVOTE

The system should update the vote rather than creating a duplicate vote.

---

# 5.7 Karma

Users should have a karma score.

Karma should be influenced by community interaction such as:

- Upvotes received on posts
- Upvotes received on comments
- Downvotes received

The exact karma calculation can initially be simple.

Example:

- Post upvote: +1
- Post downvote: -1
- Comment upvote: +1
- Comment downvote: -1

The calculation should be centralized so it can be changed later.

---

# 5.8 Comments

Users can comment on posts.

Each comment should contain:

- Author
- Post
- Parent comment
- Content
- Vote information
- Created timestamp
- Updated timestamp

## Nested Comments

Users can reply to comments.

Example:

Post

- Comment A
  - Reply A1
  - Reply A2
    - Reply A2.1
- Comment B

The implementation should support nested replies without requiring a separate post for each level.

## Comment Actions

Users can:

- Create comments
- Reply to comments
- Edit their comments
- Delete their comments
- Vote on comments

Moderators can remove comments within their community.

---

# 5.9 Saved Posts

Users can save posts for later.

Users should be able to:

- Save a post
- Unsave a post
- View saved posts

A user should not have duplicate saved records for the same post.

---

# 5.10 Home Feed

The home feed should show posts from communities the user has joined.

The feed should support:

- New
- Top
- Hot/Trending

## New

Sorted primarily by creation time.

## Top

Sorted based on engagement/upvotes over a selected period.

## Hot/Trending

Can initially use a simple scoring system involving:

- Upvotes
- Comments
- Recency

The ranking algorithm can be improved later.

---

# 5.11 Community Feed

Each community should have its own feed.

Users should be able to sort by:

- New
- Top
- Hot

---

# 5.12 Search

Search should support:

- Posts
- Communities
- Users

Possible search filters:

- Community
- Post type
- Date
- Sort order

The first implementation can use MongoDB text search or another appropriate search strategy.

---

# 5.13 Reports

Users should be able to report:

- Posts
- Comments
- Users

A report should contain:

- Reporter
- Target
- Reason
- Optional description
- Status
- Created timestamp

Possible statuses:

- Pending
- Reviewed
- Resolved
- Rejected

Moderators should be able to review reports related to their communities.

Admins should be able to review platform-wide reports.

---

# 5.14 Notifications

Notifications are planned for V2.

Potential notifications:

- Someone replied to your comment.
- Someone commented on your post.
- Someone mentioned you.
- Someone followed/joined your community.
- Your post was removed.
- You were banned from a community.

V1 does not require real-time notifications.

---

# 6. Suggested Data Model

The exact schema design should be decided during implementation. The following entities are recommended.

## User

Potential fields:

- _id
- username
- email
- password
- displayName
- avatar
- bio
- karma
- role
- createdAt
- updatedAt

---

## Community

Potential fields:

- _id
- name
- description
- icon
- banner
- owner
- memberCount
- rules
- createdAt
- updatedAt

---

## CommunityMember

Potential fields:

- _id
- user
- community
- role
- joinedAt
- bannedAt

Possible roles:

- OWNER
- MODERATOR
- MEMBER

A compound uniqueness constraint should prevent duplicate membership.

---

## Post

Potential fields:

- _id
- author
- community
- title
- content
- type
- mediaUrl
- linkUrl
- score
- commentCount
- isRemoved
- createdAt
- updatedAt

---

## Comment

Potential fields:

- _id
- author
- post
- parentComment
- content
- score
- isRemoved
- createdAt
- updatedAt

---

## Vote

Potential fields:

- _id
- user
- targetType
- targetId
- value
- createdAt
- updatedAt

Possible values:

- 1 = upvote
- -1 = downvote

A compound uniqueness constraint should prevent duplicate votes.

---

## SavedPost

Potential fields:

- _id
- user
- post
- createdAt

A compound uniqueness constraint should prevent duplicate saves.

---

## Report

Potential fields:

- _id
- reporter
- targetType
- targetId
- reason
- description
- status
- reviewedBy
- createdAt
- updatedAt

---

# 7. API Requirements

The backend should expose RESTful APIs.

Exact endpoint naming can be decided during implementation.

Suggested structure:

## Authentication

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/change-password
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

## Users

```text
GET    /api/v1/users/:username
PATCH  /api/v1/users/me
GET    /api/v1/users/me/posts
GET    /api/v1/users/me/comments
GET    /api/v1/users/me/saved
```

## Communities

```text
POST   /api/v1/communities
GET    /api/v1/communities
GET    /api/v1/communities/:communityName
PATCH  /api/v1/communities/:communityId
DELETE /api/v1/communities/:communityId

POST   /api/v1/communities/:communityId/join
DELETE /api/v1/communities/:communityId/join
```

## Posts

```text
POST   /api/v1/posts
GET    /api/v1/posts/:postId
PATCH  /api/v1/posts/:postId
DELETE /api/v1/posts/:postId

GET    /api/v1/communities/:communityId/posts
GET    /api/v1/feed
```

## Comments

```text
POST   /api/v1/posts/:postId/comments
GET    /api/v1/posts/:postId/comments

PATCH  /api/v1/comments/:commentId
DELETE /api/v1/comments/:commentId
```

## Votes

```text
POST   /api/v1/posts/:postId/vote
DELETE /api/v1/posts/:postId/vote

POST   /api/v1/comments/:commentId/vote
DELETE /api/v1/comments/:commentId/vote
```

## Saved Posts

```text
POST   /api/v1/posts/:postId/save
DELETE /api/v1/posts/:postId/save
GET    /api/v1/users/me/saved
```

## Search

```text
GET /api/v1/search
```

---

# 8. Authorization Rules

Authorization must be enforced on the backend.

Examples:

### Post

A user can edit a post if:

```text
User == Post.author
OR
User is authorized moderator/admin
```

### Comment

A user can edit a comment if:

```text
User == Comment.author
```

### Community

A user can modify community settings if:

```text
User == Community.owner
OR
User is a community moderator
```

### Create Post

A user can create a post if:

```text
Authenticated
AND
Member of community
AND
Not banned
```

The frontend must not be trusted to enforce these rules.

---

# 9. Pagination

Large collections must not be returned entirely in one request.

Pagination should be implemented for:

- Posts
- Comments
- Communities
- Search results
- User posts

Initial implementation can use page/limit pagination.

Cursor-based pagination can be considered later.

---

# 10. Validation

The API must validate:

- Required fields
- String lengths
- Email format
- Username format
- Password requirements
- Community names
- Post titles
- URLs
- ObjectIds
- Vote values

Validation errors should return consistent API error responses.

---

# 11. Error Handling

The backend should use centralized error handling.

Errors should have a consistent structure.

Example:

```json
{
  "success": false,
  "message": "Post not found",
  "statusCode": 404
}
```

Common cases:

- Invalid request
- Unauthorized
- Forbidden
- Resource not found
- Duplicate resource
- Validation error
- Server error

---

# 12. Frontend Requirements

The frontend should include:

## Public Pages

- Landing/home page
- Login
- Register
- Community page
- Post page
- User profile
- Search results

## Authenticated Pages

- Home feed
- Create post
- Saved posts
- User profile
- Joined communities

## Community Pages

- Community feed
- Community information
- Rules
- Members
- Moderation controls for moderators

---

# 13. UI Requirements

The UI should be:

- Responsive
- Clean
- Consistent
- Desktop-first but mobile-friendly
- Easy to navigate

The application should be inspired by the usability patterns of Reddit but should not attempt to reproduce Reddit's branding exactly.

Use original:

- Name
- Logo
- Color palette
- Icons where appropriate
- UI styling

---

# 14. Security Requirements

The application must:

- Hash passwords.
- Never return passwords in API responses.
- Protect authenticated routes.
- Validate user input.
- Validate ObjectIds.
- Prevent unauthorized resource modification.
- Use secure token handling.
- Avoid exposing sensitive server errors.
- Apply appropriate CORS configuration.
- Apply rate limiting where appropriate.
- Sanitize or safely render user-generated content.

---

# 15. Performance Requirements

The application should:

- Use database indexes for frequently queried fields.
- Paginate large datasets.
- Avoid unnecessary database queries.
- Avoid returning unnecessary fields.
- Use aggregation where appropriate.
- Optimize image sizes/storage.
- Use lean queries where appropriate in Mongoose.

Potential indexes:

- User username
- User email
- Community name
- Post community + createdAt
- Post author + createdAt
- Comment post + createdAt
- Vote user + target
- CommunityMember user + community
- SavedPost user + post

---

# 16. Analytics / Dashboard

A basic admin dashboard can display:

- Total users
- Total communities
- Total posts
- Total comments
- Total votes
- Most active communities
- Most active users
- Posts created per day
- New users per day

These statistics should be generated using MongoDB aggregation where appropriate.

---

# 17. Development Phases

## Phase 1 — Project Setup

- Initialize frontend
- Initialize backend
- Configure MongoDB
- Configure environment variables
- Configure Express
- Configure error handling
- Configure API structure

## Phase 2 — Authentication

- User schema
- Register
- Login
- Logout
- JWT
- Refresh token
- Protected middleware

## Phase 3 — User Profiles

- Profile API
- Update profile
- Avatar upload
- User profile page

## Phase 4 — Communities

- Community schema
- Create community
- Join/leave
- Community page
- Membership system
- Roles

## Phase 5 — Posts

- Post schema
- Create post
- Edit/delete
- Post details
- Feed
- Pagination

## Phase 6 — Comments

- Comment schema
- Comments
- Nested replies
- Edit/delete
- Pagination

## Phase 7 — Voting

- Vote schema
- Post voting
- Comment voting
- Score calculation
- Karma

## Phase 8 — Saved Posts

- Save
- Unsave
- Saved posts page

## Phase 9 — Search

- Search users
- Search communities
- Search posts
- Filters

## Phase 10 — Moderation

- Moderator roles
- Remove posts
- Remove comments
- Ban users
- Reports

## Phase 11 — Frontend Polish

- Responsive UI
- Loading states
- Error states
- Empty states
- Optimistic interactions where appropriate

## Phase 12 — Deployment

- Deploy frontend
- Deploy backend
- Configure production database
- Configure environment variables
- Configure CORS
- Test production APIs

---

# 18. MVP Definition

The MVP is complete when a user can:

1. Register.
2. Login.
3. Create a community.
4. Join another community.
5. Create a post.
6. View posts.
7. Comment on posts.
8. Reply to comments.
9. Upvote/downvote.
10. Save posts.
11. View their profile.
12. Search content.
13. View personalized/community feeds.
14. Perform actions according to their permissions.
15. Log out securely.

---

# 19. Out of Scope for MVP

Do not implement these until the core product works:

- Real-time chat
- WebSockets
- Direct messaging
- Video calls
- Live streaming
- AI recommendations
- Complex recommendation models
- Mobile app
- Microservices
- Advanced distributed caching
- Cryptocurrency/rewards
- Payment systems

---

# 20. Resume-Level Differentiators

After completing the MVP, choose 2–4 advanced features rather than adding dozens of shallow features.

Recommended differentiators:

### 1. Hot/Trending Algorithm

Build a ranking algorithm using:

- Score
- Comments
- Recency

### 2. Advanced Search

Implement:

- Full-text search
- Filters
- Sorting
- Pagination

### 3. Moderation System

Implement:

- Reports
- Moderator actions
- Bans
- Removal reasons
- Audit/activity history

### 4. Analytics Dashboard

Use MongoDB aggregation to calculate:

- Growth
- Engagement
- Top communities
- Top users
- Post statistics

### 5. Media Upload Pipeline

Support:

- Image upload
- Image compression
- Cloud storage
- File validation

---

# 21. Success Criteria

The project will be considered successful if:

- Core user flows work end-to-end.
- Authentication is secure.
- Authorization rules are enforced server-side.
- Database relationships are correctly modeled.
- APIs are validated and documented.
- Pagination works on large collections.
- Voting does not create duplicate records.
- Nested comments work correctly.
- Community moderation works.
- Search and feeds work reliably.
- The UI is responsive.
- The application is deployed and usable.
- The codebase is organized and maintainable.

---

# 22. Final Product Vision

The final application should feel like a real community platform rather than a collection of CRUD pages.

A typical user journey should look like:

```text
Register
   ↓
Create Profile
   ↓
Discover Communities
   ↓
Join Communities
   ↓
Browse Feed
   ↓
Create Post
   ↓
Receive Votes/Comments
   ↓
Participate in Discussions
   ↓
Build Karma
   ↓
Discover More Content
```

The project should prioritize **correct backend architecture, business logic, database design, authorization, and user experience** over simply maximizing the number of features.
