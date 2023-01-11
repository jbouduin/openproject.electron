## how to test hal-rest-client from source:

1. check-out the branch to be tested in ../../../hal-rest-client.test

2. in package.json:<br>
remove dependencies @jbouduin/halrest-client (not really required, as paths takes precedence)

3. add following paths in tsconfig.ts:<br>
"@jbouduin/hal-rest-client": ["../../../hal-rest-client.test/src"],<br>
"@jbouduin/hal-rest-client/*": ["../../../hal-rest-client.test/src"],

4. in main.ts:<br>
import 'reflect-metadata'