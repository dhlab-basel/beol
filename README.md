# BEOL

Bernoulli-Euler OnLine


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.14 and node version 16.13.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:6400/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Structure

* app module 
    * app component

* contact: contact page

* correspondence: customised page for correspondences

* error: customised error page

* introduction: customised page for LEOO introductions

* landing-page: home page with a presentation of BEOL, LEOO introductions and correspondences, BEBB correspondences, technical background

* properties: Knora constants properties

* resource: customised page for all resources other than letter and person types
    * letter: customised page for letter type
    * person: customised page for person type

* search-results: result list of the simple or advanced searches (the search bar comes from @knora/search)

* services: specific services of BEOL (the other services come from @knora/core)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
