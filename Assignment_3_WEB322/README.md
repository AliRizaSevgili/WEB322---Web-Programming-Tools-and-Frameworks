# Assignment 3 - WEB322

This project is the third assignment for the WEB322 course at Seneca College. The objective of this assignment is to expand upon the foundation laid in Assignment 2 by adding new routes and functionality to handle item addition and data querying. The project utilizes **Node.js**, **Express**, and **Cloudinary** to manage and store data and images.

## Submission Information

- **Due Date**: See BlackBoard for the due date. Late submissions will result in a grade of ZERO.
- **Assessment Weight**: 9% of the final course grade.

## Project Overview

This project introduces:
- New routes for adding and querying items.
- Integration with Cloudinary for image storage.
- Middleware setup for handling file uploads.
- Dynamic item filtering and querying capabilities.

## Setup Instructions

To run the project locally, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone <GitHub_Repository_URL>

    Navigate to the Project Directory

    bash

cd WEB322---Web-Programming-Tools-and-Frameworks/Assignment_3_WEB322

Install Dependencies

bash

npm install

Cloudinary Account Setup

    Register for a Cloudinary account at Cloudinary and select "Programmable Media for image and video API."
    After registration, retrieve your Cloud Name, API Key, and API Secret from the Cloudinary dashboard.

Environment Variables

    Create a .env file in the root of the project with the following contents:

    env

    CLOUD_NAME=your_cloud_name
    API_KEY=your_api_key
    API_SECRET=your_api_secret

Run the Application

bash

    node server.js

    Access the Application
        Open a browser and go to http://localhost:8080 to view the app.

Features and Functionality
Part 1: Adding/Updating Static HTML & Directories

    Updating about.html
        Added a navigation link to /items/add for adding new items.

    Creating addItem.html
        Created a new HTML file in the views folder for item submission, based on about.html.
        Added a form (provided in the template) to facilitate item submission.

Part 2: Adding Routes and Middleware for Item Addition

    Cloudinary Integration
        Configured Cloudinary with environment variables to handle image uploads.

    Multer and Streamifier Setup
        Used multer for handling file uploads and streamifier to create readable streams for Cloudinary.

    POST /items/add Route
        Created a route to process item data and image uploads, which are then stored in Cloudinary.
        Added a function processItem to handle adding the new item.

Part 3: Adding New Routes to Query Items

    Enhanced /items Route
        Supported optional filters for category and minDate to query items based on category or a minimum date.

    New /item/:id Route
        Created a route to retrieve a specific item by its ID.

Part 4: Updating store-service.js

    Function addItem(itemData)
        Adds a new item to the items array with an automatically generated ID and handles published status.

    Function getItemsByCategory(category)
        Retrieves items by category, resolving with an array of items or rejecting if no results are found.

    Function getItemsByMinDate(minDateStr)
        Retrieves items based on a minimum date string, ensuring only items after the specified date are returned.

    Function getItemById(id)
        Retrieves a single item by ID, resolving with the item or rejecting if it doesn't exist.

Part 5: Deployment to GitHub and Cyclic

    Push to GitHub
        Commit and push the latest changes to your GitHub repository.

    Deploy to Cyclic
        Link the repository with Cyclic for live deployment. Ensure you have not exceeded the 3 free app limit on Cyclic.

Important Notes

    Ephemeral Storage: Items are not persisted between sessions. Only images are stored permanently on Cloudinary.
    Cloudinary Storage: Remember to delete test images from the Cloudinary dashboard to avoid unnecessary storage usage.

Dependencies

    Node.js - JavaScript runtime environment for backend development.
    Express - Web application framework for handling routing and middleware.
    Handlebars - Templating engine for dynamic HTML rendering.
    Cloudinary - Image hosting service for storing item images.
    Multer - Middleware for handling file uploads.
    Streamifier - Converts file buffers to readable streams for Cloudinary uploads.

License

This project is for educational purposes as part of the WEB322 course and is not intended for commercial use.
