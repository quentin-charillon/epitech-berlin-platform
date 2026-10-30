# Epitech Berlin | Student Platform

**A full-stack web platform designed to help students discover Epitech Berlin, explore campus life, and access practical information through a customizable content management system.**

Developed as a collaborative student project at Epitech.

## Overview

The Epitech Berlin Student Platform aims to centralize useful information for current and future students, including accommodation, transportation, campus activities, and everyday life in Berlin.

Beyond a traditional informational website, the project includes a custom content management system (CMS), allowing administrators to manage pages and customize website content through a dedicated interface.

## Key Features

### Student Website
- Information about Epitech Berlin and campus life
- Practical guides for accommodation and transportation
- Dynamic pages powered by a CMS
- Responsive frontend interface

### Custom Content Management System
- Create and manage website pages
- Visual page editor with customizable content blocks
- Text and image editing tools
- Customizable headers and footers
- Page settings and content organization

### Administration
- Administrator authentication
- Protected administration routes
- User management interface
- Administration dashboard

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | CSS, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Testing | Vitest, React Testing Library |
| Development | Docker, Docker Compose |
| API Documentation | Swagger |

## Project Structure

```text
epitech-berlin-platform/
├── front/               # React frontend and CMS interface
├── back/                # Express API and database models
├── docker-compose.yml   # Docker development configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database (local or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/quentin-charillon/epitech-berlin-platform.git
cd epitech-berlin-platform
```

### 2. Configure the backend

```bash
cd back
npm install
```

Copy `.env.example` to `.env` and configure the required environment variables, including `MONGO_URI` and `JWT_SECRET`.

### 3. Start the backend

```bash
npm run dev
```

### 4. Start the frontend

In a separate terminal:

```bash
cd front
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Screenshots

*Screenshots of the student website, administration dashboard, and visual CMS editor will be added here.*

## Collaboration

This platform was developed as a collaborative Epitech student project.

The repository showcases the application architecture, frontend and backend development, and custom content management functionality.

## Project Status

Academic team project. The repository contains the source code and local development configuration.

## Author

**Quentin Charillon**

Epitech student | Software Development

[GitHub Profile](https://github.com/quentin-charillon)