# 📝 Family Wallet

## 📖 About the Project
**Family Wallet** is a comprehensive platform (Mobile Application + Backend API) designed to simplify the management of family or shared expenses. The application allows users to add bills, split them among members, and automatically extract data from images using Optical Character Recognition (OCR) technology.

## ✨ Key Features
- 🧾 **Bill Management:** Add bills, view them, and access an expense summary (`getBillsSummary`).
- ➗ **Bill Splitting:** Seamlessly split bills among different members (`splitBill`).
- 🤖 **Smart Scanning (OCR):** Upload a picture of a bill to automatically read and extract its value using `Tesseract.js` (`processBillOcr`).
- 🔒 **Authentication & Security:** Secure login system using `JWT` (JSON Web Tokens) and password hashing with `bcrypt`.

## 🏗️ Architecture & Technologies

The project is divided into two main components:

### 1. Frontend (Mobile App)
A modern mobile application built to provide a smooth user experience:
- **Framework:** React Native using **Expo** (with Expo Router for navigation).
- **Language:** TypeScript.
- **Key Libraries:**
  - `axios`: For backend API communication.
  - `expo-image-picker`: To capture and upload bill images.
  - `AsyncStorage`: For local session (Token) storage.

### 2. Backend (REST API)
A fast and robust backend interface:
- **Environment:** Node.js with **Express.js** framework.
- **Language:** TypeScript.
- **Database:** PostgreSQL (via the `pg` library).
- **Key Libraries:**
  - `multer`: For handling file uploads (saving bill images in the `uploads` folder).
  - `tesseract.js`: For image processing and text extraction (OCR).

---

## 🚀 Installation & Setup Guide

### 1️⃣ Database Setup
- Start your PostgreSQL server.
- Create the required database and run the scripts provided in the `Database/` folder to set up your tables.

### 2️⃣ Backend Setup
```bash
cd backend
# 1. Install dependencies
npm install

# 2. Environment Variables setup
# Copy the .env.example file to .env and update the database connection details
cp .env.example .env

# 3. Start the server (Development mode)
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd frontend
# 1. Install dependencies
npm install

# 2. Start the Expo application
npx expo start
```
> Scan the **QR Code** displayed in your terminal using the **Expo Go** app on your phone to test the app, or run it on an Android/iOS emulator.

---

## 📂 Project Structure

```text
Family-Wallet/
├── backend/            # Backend API directory
│   ├── src/
│   │   ├── modules/    # Independent modules (e.g., bills, users)
│   │   ├── middlewares/# Middlewares (e.g., auth.middleware.ts for token verification)
│   │   └── server.ts   # Main server entry point
│   ├── uploads/        # Directory for uploaded bills (auto-generated)
│   └── package.json
│
├── frontend/           # Mobile App directory (React Native / Expo)
│   ├── app/            # Screens and Navigation (Expo Router)
│   ├── components/     # Reusable UI components
│   ├── src/            # Services and other utilities
│   └── package.json
│
├── Database/           # Database scripts and schemas
└── Prototype/          # Initial designs and project prototypes
```

## 🛠️ Additional Details (OCR Module)
In the backend, bills are uploaded to the `uploads/bills` directory using `multer`. Afterwards, the image path is passed to `tesseract.js` which attempts to read the text and automatically extract the bill's total amount, making it easier for users to log their expenses.
