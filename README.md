# NRL Analytics Platform

This project is an analytics platform for NRL (National Rugby League) data. It consists of a backend API built with Express.js and a frontend dashboard built with Next.js and React.

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Scripts](#scripts)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Usage](#usage)
- [Learn More](#learn-more)
- [License](#license)

## Project Structure

```
NRL-analytics-platform/
├── .env
├── .gitignore
├── backend/
│   ├── app.js
│   ├── package.json
├── config/
├── frontend/
│   ├── nrl-dashboard/
│   │   ├── .gitignore
│   │   ├── .next/
│   │   ├── jsconfig.json
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── public/
│   │   ├── src/
│   │   ├── tailwind.config.mjs
├── frontend-old/
│   ├── dashboard.html
├── LICENSE
├── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- MySQL

### Backend Setup

1. Navigate to the backend directory:

```sh
cd NRL-analytics-platform/backend
```

2. Install the dependencies:

```sh
npm install
```

3. Create a .env file in the root directory with the following content:

```sh
DB_HOST=<DB_HOST>
DB_USER=<DB_USER>
DB_PASSWORD=<DB_PASSWORD>
DB_NAME=<DB_NAME>
```

4. Start the backend server:

```sh
node app.js
```

### Frontend Setup

1. Navigate to the frontend directory:

```sh
cd NRL-analytics-platform/frontend/nrl-dashboard
```

2. Install the dependencies:

```sh
npm install
```

3. Start the development server:

```sh
npm run dev
```

4. Open http://localhost:3001 with your browser to see the result.


## Scripts

### Backend

-   node app.js: Starts the backend server.

### Frontend

-   npm run dev: Starts the development server.
-   npm run build: Builds the application for production.
-   npm run start: Starts the production server.
-   npm run lint: Runs the linter.

## Usage

After setting up the backend and frontend, you can use the application to view NRL team performance trends. The dashboard provides insights into the best and worst performing teams based on various metrics.

## Learn More

To learn more about the technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is licensed under the MIT License. See the LICENSE file for details.

This README provides an overview of the project, setup instructions, and links to relevant documentation.
