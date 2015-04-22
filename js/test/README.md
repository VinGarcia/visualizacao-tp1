
To execute the tests on this folder follow this steps:

First install the needed packages:

```bash
$ sudo apt-get install nodejs
$ sudo npm install -g mocha
$ npm install chai
```

> npm stands for _NodeJS Package Manager_ and its installed with nodejs package.

Then run the tests using mocha:

```bash
$ mocha js/test/analyzer.js
```

Or to run all tests at once:

```bash
$ cd js
$ mocha
```

> The mocha call with no parameters will execute all tests 
> in 'test' folder, don't change the folder name, or it will not work.

