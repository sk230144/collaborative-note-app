# CollabNote - A Real-Time Collaborative Note-Taking App

Welcome to CollabNote! This is a modern, real-time note-taking application built with Next.js and styled with Tailwind CSS. It's designed to be simple, intuitive, and fast.

## Features

- **Create, Read, Update, Delete (CRUD) Notes**: Effortlessly manage your notes.
- **Real-time Autosaving**: Your notes are automatically saved to your browser's local storage as you type.
- **Version History**: The application automatically saves previous versions of your notes when the content changes. You can view and restore any previous version.
- **Responsive Design**: A clean and functional UI that works seamlessly on both desktop and mobile devices.
- **Debounced Saving**: Edits are saved efficiently after you pause typing to prevent excessive writes.
- **Modern UI**: Built with ShadCN UI and Tailwind CSS for a sleek and modern aesthetic.

## Architecture Overview

This application is built on a modern, server-centric web stack, prioritizing performance and developer experience.

- **Framework**: **Next.js 15** with the App Router is used for its powerful server-side rendering capabilities, file-based routing, and performance optimizations.
- **Language**: **TypeScript** is used throughout the project for static typing, leading to more robust and maintainable code.
- **UI Components**: The UI is built with **React** and **ShadCN UI**, a collection of beautifully designed, accessible, and composable components built on top of Radix UI and Tailwind CSS.
- **Styling**: **Tailwind CSS** is used for all styling, providing a utility-first approach that allows for rapid UI development while maintaining a consistent design system.
- **State Management**: Client-side state is managed using **React Context API** (`NotesProvider`). This provides a simple yet effective way to manage the state of notes across the application without external libraries.
- **Data Storage**: Notes and their versions are currently persisted in the browser's **`localStorage`**. This makes the app work offline and without a backend, but note data is local to the user's browser.

## Project Setup

To get this project running on your local machine, follow these steps:

1.  **Install Dependencies**:
    Open your terminal and run the following command to install all the necessary packages.

    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    Once the dependencies are installed, you can start the development server.

    ```bash
    npm run dev
    ```

    This command starts the Next.js development server (using Turbopack for speed) on `http://localhost:9002` by default.

3.  **Open in Browser**:
    Open [http://localhost:9002](http://localhost:9002) in your web browser to see the application in action.

### Other Scripts

- **Build for Production**: `npm run build`
- **Start Production Server**: `npm start`
- **Lint Code**: `npm run lint`
