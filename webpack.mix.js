const mix = require("laravel-mix");
mix
    .js("./src/js/main.js", "assets")
    .sass("./src/scss/main.scss", "assets")
    .setPublicPath("");