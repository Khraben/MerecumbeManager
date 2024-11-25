# Merecumbé Manager

![License](https://img.shields.io/badge/license-MIT-green.svg) ![Version](https://img.shields.io/badge/version-1.0-blue.svg)

## Description

**Merecumbé Manager** is an internal management platform for a dance academy in Costa Rica. It provides tools to efficiently manage students, groups, attendance tracking, and payments. The platform also offers advanced reporting capabilities and email integration for payment receipts. 

It features role-based permissions with three user types:
- **Owners**: Administrators with full access to all features.
- **Secretaries**: Users with access to administrative functions, excluding user management.
- **Instructors**: Users focused on group and attendance management.

This platform was tailored specifically for the organizational structure of Merecumbé in Costa Rica.

## Key Features

- **Authentication**: Secure login system.
- **Student and Group Management**: Add students, assign them to groups, and track group attendance.
- **Payment Module**: Generate and send receipts for monthly fees, workshops, private classes, or other reasons via email.
- **Reports**: Filterable reports for income, pending payments, attendance history, and payment history.
- **Role-Based Permissions**: Control access to features based on user type.
- **Owner Tools**: Manage other users (Secretaries and Instructors) and a list of scholarship students.

### Planned Features
- **WhatsApp API Integration**: Optionally send receipts and reminders for classes or payments via WhatsApp.

## Technologies Used

### Frontend
- **React**: UI library.
- **Next.js**: Framework for server-side rendering and static site generation.
- **Styled-Components**: Styling framework for creating reusable, modular styles.

### Backend
- **Firebase**: Used for database management and authentication.
- **Nodemailer**: For sending payment receipt emails.
- **html2canvas**: For generating PDFs.

### Deployment
- **Vercel**: Hosting platform for Next.js projects.

## Installation

Follow these steps to set up the project locally:

### Prerequisites
1. Install [Node.js](https://nodejs.org/).
2. Create a user via Firebase Authentication using Email Autentification and link it in the `owners` collection with the fields:
   - `email`
   - `name`
   - `username`
   - `phone`

This user will act as the administrator.

### Steps
```bash
# Clone the repository
git clone https://github.com/yourusername/merecumbe-manager.git

# Navigate to the project directory
cd merecumbe-manager

# Install dependencies
npm install
# or
yarn install

# Create a .env file and add the environment variables
cp .env.example .env

# Start the development server
npm run dev
```
###Environment Variables
Ensure the .env file includes the following:
#### Firebase Configuration
```plaintext
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

#### Gmail Configuration for Email Sending
```plaintext
NEXT_PUBLIC_EMAIL_USER=
NEXT_PUBLIC_EMAIL_PASS=
```
### Firebase Rules
Set the following rules in Firebase Firestore:
```javascript
rules_version = '1';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    match /secretaries/{document=**} {
      allow read, write: if true;
    }
    match /instructors/{document=**} {
      allow read, write: if true; 
    }
    match /owners/{document=**} {
      allow read: if true; 
    }
  }
}
```
#### Firebase Authentication
Set password reset emails to redirect to:
your-domain/SetPassword.

## Usage
### Main Routes
  - /: Home/Login page.
  - /GroupList: Manage groups and track attendance.
  - /StudentList: Manage the list of students.
  - /MakePayment: Generate and send payment receipts via email.
  - /Reports: Access and filter reports for the academy.
  - /AdminConf: Configure secretaries, instructors, and manage a list of scholarship students.

### Notes
The platform is highly intuitive; no additional training is required.

### Scripts
  - npm run dev: Start the development server.
  - npm run build: Build the project for production.
  - npm start: Start the production server.

## Contribution
Contributions are welcome! Follow these steps to contribute:

  - Fork the repository.
  - Create a new branch (git checkout -b feature/your-feature-name).
  - Commit your changes (git commit -m 'Add some feature').
  - Push the branch (git push origin feature/your-feature-name).
  - Open a Pull Request for review.

#### Current Needs
  - Improve existing features.
  - Implement WhatsApp API integration.

## License
MIT License

Copyright (c) [2024] [Kevin Jiménez, Leiner Alvarado, Walter Lazo, Justin Martinez]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## Contact
  - Email: [Kevin Jiménez](mailto:kvn.jimenez.t@gmail.com)
  - Email: [Leiner Alvarado](leineralvarador117@gmail.com)
  - Email: [Walter Lazo](walterlazo293@gmail.com)
  - Email: [Justin Martinez](justinalonsomm@gmail.com)

## Other Documents

### User Manual (Spanish)
  - [Link to User Manual](https://drive.google.com/file/d/1aPeyl7EL338DQH4ahBlAKF_HbeG7rJv4/view?usp=sharing)
  
### Article about the Project (Spanish)
  - [Link to Article](https://drive.google.com/file/d/1ddm1MIIXyPUrwKM0-gjiZ3DWh4mGDUys/view?usp=sharing)

### Generated PM Documents (Spanish)
  - [Link to Documentatión](https://drive.google.com/file/d/1nzI-8MtU8v_oCUOcJg2rAFXEuhydc8fw/view?usp=sharing)
