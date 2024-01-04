### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:16-stretch as builder

LABEL maintainer="support@dasch.swiss"

# Sets the path where the app is going to be installed
ENV NODE_ROOT /usr/app/

# Creates the directory and all the parents (if they don’t exist)
RUN mkdir -p $NODE_ROOT

# Sets the /usr/app as the active directory
WORKDIR $NODE_ROOT

# Copies all the content
COPY . .

# Install all the packages
RUN npm install -g @angular/cli
RUN npm install

## Build the angular app in production mode and store the artifacts in dist folder
## should be: $(npm bin)/ng build --prod --env=prod --build-optimizer
RUN npm run build-prod

### STAGE 2: Setup ###

FROM daschswiss/nginx-server:v1.1.1

LABEL maintainer="support@dasch.swiss"

RUN rm -rf /public/*

COPY --from=builder /usr/app/dist/beol /public
