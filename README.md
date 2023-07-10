# # https://handee.com

# https://handee.com

###### Documention-Installation ######
## initial (first time) ##

1. npm install node
2. Create src>js>main.js and src>scss>main.scss files
3. npm init
4. npm install laravel-mix --save-dev
5. cp node_modules/laravel-mix/setup/webpack.mix.js ./
6. Add this code to webpack.mix.js
    ###########
    const mix = require("laravel-mix");
    mix
    .js("./src/js/main.js", "assets")
    .sass("./src/scss/main.scss", "assets")
    .setPublicPath("assets");
    #############
7. npm install cross-env --save-dev
8. add script in package.json

    #############
    "scripts": {
    "dev": "npm run development",
    "development": "cross-env NODE_ENV=development node_modules/webpack/bin/webpack.js --progress --config=node_modules/laravel-mix/setup/webpack.config.js",
    "watch": "npm run development -- --watch",
    "hot": "cross-env NODE_ENV=development node_modules/webpack-dev-server/bin/webpack-dev-server.js --inline --hot --config=node_modules/laravel-mix/setup/webpack.config.js",
    "prod": "npm run production",
    "production": "cross-env NODE_ENV=production node_modules/webpack/bin/webpack.js --no-progress --config=node_modules/laravel-mix/setup/webpack.config.js"
    },
    #############
    
9. npm run watch

##### every time #####
# Before you start implementing your Tickets, please upload this files from the APP: #

1. theme download
3. commit change from live "update content from live".
4. theme watch --allow-live