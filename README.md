# openui5-masterdetail-app-ts #

TypeScript port of [SAP OpenUI5's Master Detail App](https://github.com/SAP/openui5-masterdetail-app.git).

The purpose of this project is to serve as examples for my other 2 projects:
* [openui5-types](https://github.com/r-murphy/openui5-types)
* [babel-plugin-transform-modules-ui5](https://github.com/r-murphy/babel-plugin-transform-modules-ui5)

It's a straight-forward port of the original masterdetail app without architectural or design changes. Only a few new methods were added, and not new modules.

For the original `.js` only version, refer to SAP's [openui5-masterdetail-app](https://github.com/SAP/openui5-masterdetail-app)

## Getting started

* Install node.js (get it from [nodejs.org](http://nodejs.org/)).
  * If working behind a proxy, you need to configure it properly (HTTP_PROXY / HTTPS_PROXY / NO_PROXY environment variables)
* Install grunt-cli and bower globally

```sh
npm install grunt-cli bower -g
```

* Clone the repository and navigate into it

```sh
git clone https://github.com/r-murphy/openui5-masterdetail-app-ts.git
cd openui5-masterdetail-app-ts
```

* Install all npm dependencies

```sh
npm install
```

* Install all bower dependencies

```sh
bower install
```

* Run grunt to lint, build and run a local server (have a look into `Gruntfile.js` to see all the tasks).

```sh
grunt
```

* Open the app in your browser: [http://localhost:8080](http://localhost:8080)

## Limitations

* The grunt build does not watch and re-compile. I personally don't use grunt, and only configured it to work with tsc/babel since the original project uses grunt. It's a bit out of scope on what I wanted this project to illustrate, but if I have time I'll see if I can resolve it (Mrs also appreciated and welcome).
	* A non-grunt solution should be documented.
