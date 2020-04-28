# Cloud Developer Capstone Project
The purpose of the cloud developer capstone project is to give you a chance to combine what you've learned throughout the program. This project will be an important part of your portfolio that will help you achieve your Cloud-related career goals.

In this project, you will build a cloud-based application, and follow the principles of either the Microservices course (course 3) or the Serverless course (course 4). This will help you demonstrate to potential employers and colleagues that you can independently create and deploy applications using these principles.

## New Features:
 - Attached image visibile in to do list for each user

## How to run the application
### Backend
To deploy an application run the following commands:
```
cd backend
npm install
sls deploy -v
```
### Frontend
To run a client application first edit the client/src/config.ts file to set correct parameters. And then run the following commands
```
cd client
npm install
npm run start
```
This should start a development server with the React application that will interact with the serverless TODO application.
