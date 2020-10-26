# COM3504 The Intelligent Web Assignment

This repository is for a Progressive Web Application (PWA) for COM3504. It is written in HTML/CSS and Javascript. The application implements a social networking environment where users can post stories to their wall and view other users' posts. It features many different techniques taught in the module COM3504 such as AJAX, socket.io, web-workers, IndexedDB, MongoDB and the creation of a NodeJS server.

# Setup Instructions

It is essential before running the application that an npm install command is run to install all dependencies defined in the project's package. To do this, open the terminal on the operating system or IDE and navigate to the application's directory. From there type:

```javascript
npm install
```
...and press enter. This will install all the project's dependencies.

Once all dependencies are accounted for, navigate to the "www" file located in the bin folder of solution. Running this file will start the server and make the application accessible on a browser. 

Now to access the application, open a browser and enter:

```
localhost:3000
```
You should now be able to sign up to the application and then sign in.

# Signup page
The user can signup by redirecting to the '/signup' page. In order to signup, the user should enter a username, a password and confirm its password before submitting the form. If a username is taken, an appropriate message will be displayed. This corresponds to messages if the two password fields are not the same, or if for any reasons the signup process fails.


## Admin Login

To login as an Admin, for simplicity reasons, the username is "admin" and the password is "password". When an admin user logs in to the page, the user can upload a JSON file. The form for uploading a JSON file is only available to the user signed in as "admin". By pressing 'uploade file' and selecting the appropriate file and then pressing 'Upload' the data is being read and stored in the database. A message appears to notify the user and the page is reloaded once the data is stored. For the purposes of assessment, if the uploading functionality does not work, in the index.js file in the routes, there are comments that give instructions on how a JSON file can be uploaded to the application files and then stored in the database. A similar JSON file to the one provided is only supported. For the purposes of the user management system, a password in automatically generated for each user. This is the same as the username. (For user 'user_1' the password generated will be 'user_1')


## Login page
The user can login by entering the credentials needed. If any of the credentials are incorrect an appropriate message is displayed above the form. For the user uploaded with JSON, the password is the same as their username (see above).

# Homepage
Once a user is signed in, they are able to see on their wall all the stories made by other users. A recommendation algorith defines the order those stories appear. The user can choose to view the stories by date or my order of recommendation. A form allows the user to create a new story. The story can include text and up to 3 images. By completing the appropriate fields and pressing 'Publish' a new story is added to their wall, which every user can see and vote. The average of the votes is included in every story. A search facility has also been developed and allows the user to search for stories that include the text supplied.

# Profile page 
A user is able to see the stories they created by navigating to the 'Profile' page. The average votes left by other people can also be viewed in each story. 

