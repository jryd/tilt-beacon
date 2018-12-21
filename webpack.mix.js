let mix = require('laravel-mix');

require('laravel-mix-tailwind');

mix.js('src/app.js', 'dist')
    .sass('src/app.scss', 'dist')
    .copy('src/images/*', 'dist/images')
    .copy('src/font-awesome/*', 'dist/font-awesome')
    .copy('src/font-awesome/webfonts/*', 'dist/font-awesome/webfonts')
    .setPublicPath('dist')
    .tailwind();