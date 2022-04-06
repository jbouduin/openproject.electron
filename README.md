# Openproject Client
This is a home-grown [Openproject](https://www.openproject.org) client and my personal _Angular + Electron_ playground. Due to the high number of experiments, parts of the application are _'over-engineered'_

![Screenshots](/images/timesheets.png)

It suits my personal needs and offers some functionality not available in the [legacy application](https://github.com/opf/openproject). Because of this, there is some hard-coded stuff in the sources, which I currently do not intend to generalize.

I started development using the [angular-electron-boilerplate](https://github.com/frederiksen/angular-electron-boilerplate). A template providing a starting point of a modern and secure Electron app.

## Getting started (just in case you'd like to play around with it)

__CAVEAT:__
The client relies on the use of customfields and non standard workpackage typesin openproject. Their names are currently hardcoded in [custom-field-map.ts](/src/main/@core/hal-models/custom-field-map.ts), respectively [work-package-type-map.ts](/src/common/types/work-package-type-map.ts). So it won't work for you without code and configuration changes.

```bash
$ git clone https://github.com/jbouduin/openproject.electron
$ cd openproject.electron
$ npm install
$ cp src/main/@core/client-settings.template.ts src/main/@core/client-settings.ts
# check custom-field-map.ts.
# check the work-package-type-map.
$ npm run build:dev:all
$ npm start
```

When starting for the first time, the program will ask your for the hostname, api-key and api-root.

