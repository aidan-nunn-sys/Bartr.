# bartr

An easy to use barter-and-trade style market place for product and service exchanges in your local area.

## Firebase configuration

The backend can connect to Firebase Auth when you supply a service account and API key at runtime. Secrets are kept out of source control and must be provided locally:

1. In the Firebase console, generate a **service account** key for the project.  
2. Place the downloaded JSON at `src/main/resources/firebase/serviceAccount.json`. This path is ignored by Git (`.gitignore`) so the file stays local.  
3. Set the environment variable `FIREBASE_API_KEY` with your Firebase Web API key (the tests and local fallback work without it, but real Firebase sign-in/register calls require it).  
4. Flip `firebase.enabled=true` in `src/main/resources/application.properties` when you want the backend to use Firebase instead of the local fallback.

With those values in place the application will load credentials directly from the service account file in the project tree and keep sensitive data out of version control.
