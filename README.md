
# NoteTaking App

A simple and secure web application that allows users to create, manage, and organize their notes. The application supports user registration, authentication, and provides functionalities to archive notes, change user passwords, and more.

This project was developed as part of a mid-term assignment for a DevOps course I'm taking through UBC External Studies. The development process heavily relied on ChatGPT as an assistant, including the creation of this README file. The course helped me learn how to ask the right questions and guide GPT toward achieving my goals.

The app is currently missing a few features, such as the ability to switch between light and dark themes. Although this was initially implemented, it was later abandoned due to time constraints. Additional features that would enhance the app include the ability to log in using Google, Facebook, etc., and the option to share your notes.

## Features

- **User Authentication:** Secure login and registration using JWT authentication.
- **Note Management:** Create, update, delete, and view notes.
- **Archiving:** Archive notes that are no longer actively needed but might be referenced later.
- **Profile Management:** Users can view their profile, including the total number of notes and change their password.
- **Responsive Design:** The app is designed to work well on both desktop and mobile devices.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed on your machine.
- **MongoDB**: A running instance of MongoDB is required.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/notetaking-app.git
   cd notetaking-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following environment variables:

   ```
   SECRET=your-secret-key
   MONGO_URI=mongodb://localhost:27017/note-taking-app
   EMAIL=your-email@example.com
   EMAIL_PASSWORD=your-email-password
   ```

4. **Run the application:**

   ```bash
   npm start
   ```

   The app should now be running on `http://localhost:3000`.

### Folder Structure

```
notetaking-app/
│
├── config/
│   └── db.js          # Database connection configuration
├── models/
│   ├── User.js        # User model schema
│   └── Note.js        # Note model schema
├── routes/
│   ├── users.js       # User routes (registration, login, profile, etc.)
│   └── notes.js       # Notes routes (create, update, delete, etc.)
├── views/
│   ├── partials/      # EJS partials (header, footer)
│   ├── notes/         # Notes-related views
│   ├── users/         # User-related views (login, register, profile)
│   └── layouts/       # Layouts for different pages
├── public/
│   ├── css/           # CSS files
│   └── js/            # JavaScript files
├── app.js             # Main application file
├── README.md          # This file
├── .env               # Environment variables
└── package.json       # Node.js dependencies and scripts
```

### API Documentation

The API is documented using Swagger. To view the API documentation:

1. Start the application.
2. Navigate to `http://localhost:3000/api-docs` to access the Swagger UI.

### Endpoints

Here is a summary of some of the main API endpoints:

- **User Registration:** `POST /users/register`
- **User Login:** `POST /users/login`
- **User Profile:** `GET /users/profile`
- **Change Password:** `POST /users/change-password`
- **Create Note:** `POST /notes/create`
- **Update Note:** `POST /notes/:id/update`
- **Delete Note:** `DELETE /notes/:id/delete`
- **Get Non-Archived Notes:** `GET /notes`
- **Get Archived Notes:** `GET /notes/archived`
- **Unarchive Note:** `POST /notes/:id/unarchive`
- **Archive Note:** `POST /notes/:id/archive`

### Security

- **JWT Authentication:** Securely authenticates users using JSON Web Tokens.
- **Password Hashing:** User passwords are securely hashed using bcrypt before storage.

### License

This project is licensed under the MIT License.

### Contributing

Contributions are welcome! Please fork this repository and submit a pull request.

### Contact

For any inquiries, please contact [Ali Yaghini](mailto:yaghini@ualberta.ca).
