# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.








# Important!

Branch Setup:
-------------
```
main
-- development
 -- feature/*
 -- feature/* 
```

-------------

* main        - stable, fully functioning and completed code
* development - latest, integrated dev work from merging feature branches
* feature/*   - are for working on individual tasks/features:
  - Create new feature branch for every feature (feature/feature-name or feature/screen-name etc)
  - set source to development (NOT MAIN)
  - once features are complete - merge them into development branch
  - once everything works together well in development branch - merge dev branch into main


** So basically all work is done in features and development branches and then merged to main once completed



---------------

Before Starting Work:
---------------------
Ensure your local repository is up to date:

```bash
git checkout development
git pull origin development
```

Create a Feature Branch:
------------------------

```bash
git checkout -b feature/feature-name
```

Examples:

```bash
git checkout -b feature/screen-map
git checkout -b feature/ui-login
```



Commit Your Changes:
--------------------
Make commits regularly with clear commit messages.

```bash
git add .
git commit -m "Adding authentication to Login"
```



Push Branch to GitHub:
----------------------
```bash
git push -u origin feature/feature-name
```



Examples of good commit messages:

```bash
"Add in login HUD"
"Fixed issue-description"
"Modified screen-name with modification-description"
"Added feature-name to component-name"
```



Merge features into development:
--------------------------------
```bash
#switch to dev
git checkout development

#get latest changes
git pull origin development

#merge feature branch
git merge feature/my-feature



#if no merge conflicts - push to dev
git push origin development
```



Keep Your Branch Up to Date:
----------------------------
Before opening a Pull Request, update your branch with the latest changes from develop:

```bash
git checkout development
git pull origin development

git checkout feature/feature-name
git merge development
```

Resolve any conflicts if necessary.


Open a Pull Request:
--------------------
When work is complete:
1. Push all changes to GitHub
2. Open a Pull Request
3. Set the target branch to develop
4. Request a review if required

```
feature/feature-name -> development
```


Important Rules:
----------------
* Never commit directly to main
* Never commit directly to development
* Always create new feature branch from development
* Keep Pull Requests focused on a single feature or task
* Use descriptive branch names and commit messages
* Delete feature branches after they have been merged


Example Workflow:
-----------------
```bash
git checkout development			(switching to development branch)
git pull origin development			(updating your local development branch with the one on GitHub)

git checkout -b feature/feature-name 		(creating your own branch to work on whatever)

# After Making Changes

git add .
git commit -m "modified home screen"		(adding and saving/committing changes)

git push -u origin feature/feature-name		(pushing everything you did to the remote branch on GitHub)
```

Then create a Pull Request/ Merge feature branch with merge:
```
Pull Request:
feature/feature-name -> development		Once approved and merged, feature branch can be deleted

Merge instructions:
git checkout development			(switching to development branch)
git pull origin development			(updating development branch)

git merge feature/screen-name			(merging your feature branch with the development branch)
```