# Reddit-Inspired Social Discussion Platform

A full-stack **MERN** social discussion platform inspired by Reddit, built as a portfolio-grade project and practical exercise in designing a complete application without relying on a step-by-step tutorial.

## 🚀 Overview

The platform allows users to:

- Create accounts and securely authenticate
- Create and join communities
- Create, edit, and delete posts
- Comment and reply to comments
- Upvote and downvote posts and comments
- Save posts
- Discover content through personalized feeds
- Search users, communities, and posts
- Build karma through community interaction
- Moderate communities through role-based permissions

The project focuses particularly on **backend architecture, business logic, database design, authorization, and user experience**.

## 🛠️ Tech Stack

| Layer                   | Technology                    |
| ----------------------- | ----------------------------- |
| Frontend                | React.js                      |
| Backend                 | Node.js + Express.js          |
| Database                | MongoDB + Mongoose            |
| Authentication          | JWT (Access + Refresh Tokens) |
| Password Hashing        | bcrypt                        |
| Media Storage           | Cloudinary or equivalent      |
| API                     | REST                          |
| Real-time Communication | Not required for V1           |

These technologies are defined as the target stack in the project requirements.

## ✨ Features

### Authentication

- Register and login
- JWT access and refresh tokens
- Logout
- Token refresh
- Change password
- Forgot/reset password
- Protected routes

### User Profiles

- Username
- Display name
- Email
- Avatar
- Bio
- Karma
- Post and comment counts
- Profile posts and comments

### Communities

- Create communities
- Join/leave communities
- Community descriptions and rules
- Community icons/banners
- Member management
- Owner/moderator/member roles

### Posts

Supports:

- Text posts
- Image posts
- Link posts

Users can:

- Create posts
- Edit their own posts
- Delete their own posts
- View post details
- Browse community feeds
- Browse personalized feeds

### Comments

- Comment on posts
- Reply to comments
- Nested comments
- Edit/delete own comments
- Moderator comment removal

### Voting

- Upvote
- Downvote
- Remove vote
- Vote switching
- One active vote per user per target

### Saved Posts

- Save posts
- Unsave posts
- View saved posts
- Prevent duplicate saves

### Feeds

Home and community feeds support:

- **New**
- **Top**
- **Hot/Trending**

The hot feed can use score, comments, and recency as initial ranking factors.

### Search

Search across:

- Users
- Communities
- Posts

Possible filters include community, post type, date, and sort order.

### Moderation

Community moderators can:

- Remove posts
- Remove comments
- Ban/unban users
- Pin posts
- Edit community rules
- Manage community information
- Review community-related reports

Platform administrators can additionally manage users, communities, reports, inappropriate content, and platform statistics.

## 🧠 Architecture & Learning Goals

This project is designed to provide practical experience with:

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

## 📦 Core Data Models

The planned database entities include:

- `User`
- `Community`
- `CommunityMember`
- `Post`
- `Comment`
- `Vote`
- `SavedPost`
- `Report`

The exact schema design will be finalized during implementation.

## 🔐 Authorization

Authorization is enforced **on the backend**.

For example, a user can create a post only when:

```text
Authenticated
    AND
Member of community
    AND
Not banned
```

A user can edit a post when they are either the author or an authorized moderator/admin.

The frontend must never be trusted as the only layer enforcing permissions.

## 📡 API

The backend follows a RESTful API structure.

Example endpoints:

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh

POST   /api/v1/communities
GET    /api/v1/communities
GET    /api/v1/communities/:communityName

POST   /api/v1/posts
GET    /api/v1/posts/:postId
PATCH  /api/v1/posts/:postId
DELETE /api/v1/posts/:postId

POST   /api/v1/posts/:postId/comments
GET    /api/v1/posts/:postId/comments

POST   /api/v1/posts/:postId/vote
DELETE /api/v1/posts/:postId/vote

POST   /api/v1/posts/:postId/save
DELETE /api/v1/posts/:postId/save

GET    /api/v1/search
```

The complete API structure is defined in the project requirements.

## 📄 Validation & Error Handling

The API validates:

- Required fields
- String lengths
- Email format
- Username format
- Password requirements
- Community names
- Post titles
- URLs
- MongoDB ObjectIds
- Vote values

Errors should follow a consistent structure:

```json
{
  "success": false,
  "message": "Post not found",
  "statusCode": 404
}
```

## ⚡ Performance

The application should:

- Use database indexes
- Paginate large collections
- Avoid unnecessary queries
- Return only required fields
- Use MongoDB aggregation where appropriate
- Optimize uploaded media
- Use Mongoose `.lean()` where appropriate

Pagination is required for posts, comments, communities, search results, and user posts.

## 🔒 Security

The application must:

- Hash passwords
- Never expose passwords in API responses
- Protect authenticated routes
- Validate user input
- Validate ObjectIds
- Enforce authorization server-side
- Securely handle authentication tokens
- Avoid exposing sensitive server errors
- Configure CORS appropriately
- Apply rate limiting where appropriate
- Safely handle user-generated content

## 🗺️ Development Roadmap

The project will be developed incrementally:

1. **Project Setup**
2. **Authentication**
3. **User Profiles**
4. **Communities**
5. **Posts**
6. **Comments**
7. **Voting & Karma**
8. **Saved Posts**
9. **Search**
10. **Moderation**
11. **Frontend Polish**
12. **Deployment**

This phased approach keeps the core product functional before advanced features are introduced.

## 🎯 MVP

The MVP is considered complete when a user can:

1. Register
2. Login
3. Create a community
4. Join a community
5. Create posts
6. View posts
7. Comment
8. Reply to comments
9. Upvote/downvote
10. Save posts
11. View their profile
12. Search content
13. View personalized/community feeds
14. Perform actions according to their permissions
15. Logout securely

## 🚫 Out of Scope for MVP

The following should be implemented only after the core application works:

- Real-time chat
- WebSockets
- Direct messaging
- Video calls
- Live streaming
- AI recommendations
- Mobile application
- Microservices
- Advanced distributed caching
- Cryptocurrency/rewards
- Payment systems

## 🏆 Future Resume-Level Features

After completing the MVP, 2–4 advanced features can be added:

- Hot/Trending ranking algorithm
- Advanced full-text search
- Advanced moderation and audit history
- Analytics dashboard using MongoDB aggregation
- Media upload and processing pipeline

## 📈 Success Criteria

The project should ultimately provide:

- End-to-end working user flows
- Secure authentication
- Server-side authorization
- Correct database relationships
- Validated and documented APIs
- Working pagination
- Consistent voting
- Nested comments
- Community moderation
- Reliable search and feeds
- Responsive UI
- Production deployment
- Organized and maintainable code

## 🔄 Typical User Journey

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

The goal is to build a genuine community platform rather than simply a collection of CRUD pages.

---

## 📌 Project Philosophy

> **Build for correctness, architecture, and understanding—not just feature count.**

The primary focus of this project is strong **backend architecture, business logic, database design, authorization, and user experience**.
