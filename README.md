# Openproject Client
This is a home-grown [Openproject](https://www.openproject.org) client.

![Screenshots](/images/timesheets.png)

It suits my personal needs and offers some functionality not available in the [legacy application](https://github.com/opf/openproject). Because of this, there is some hard-coded stuff in the sources, which I currently do not intend to generalize.

I started development using the [angular-electron-boilerplate](https://github.com/frederiksen/angular-electron-boilerplate). A template providing a starting point of a modern and secure Electron app.

## Getting started (just in case you'd like to play around with it)

```bash
$ git clone https://github.com/jbouduin/openproject.electron
$ cd openproject.electron
$ npm install
$ cp src/main/@core/client-settings.template.ts src/main/@core/client-settings.ts
# edit src/main/@core/client-settings.ts with the editor of your choice
$ npm run build:dev:all
$ npm start
```

(It is possible that you'll have to do some more stuff, but I can't remember)

## Packaging into an app (this comes from the original README)

This is where all the magic happens.

```bash
$ npm run release
```

Then your app will be put into the */release-builds* folder. Can build an app for Windows, macOS and Linux.
