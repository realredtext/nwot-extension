# Our World of Text Extended
OWOT Extended with extra features

##How to run
* Clone this repo
* Run 'npm i' after navigating to the cloned repo on your system
* Run 'node main.js' twice, first to set up the settings, second to create a superuser

###Why am I not a superuser?
+Make sure to log in as your superuser

###Why does Uvias not work?
+Uvias is not open-source software, unlike OWOT, the server may struggle to find all the resources it expects

###Why am I getting 'Cannot find module' errors?
+Run 'npm i' to install the required node modules to solve this error

###Why am I getting errors when running async functions?
+Top-level await is not supported in the console. Await only impacts the returning of values, not the execution of a function, which doesn't impact database commands

###I didn't create a superuser, how do I make one?
+Run db.run("INSERT INTO auth_user VALUES(null, ?, 1, 3, ?, ?)", ["usernameHere", encryptHash("passwordHere"), Date.now(), Date.now()])

###I want to add another answer to this?
+Submit an issue on my repo starting with "QNA: "and your question in the title
