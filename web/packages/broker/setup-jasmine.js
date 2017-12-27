const reporters = require('jasmine-reporters');
const reporter = new reporters.JUnitXmlReporter({
    consolidateAll: false,
    filePrefix: 'jest-junit-result-',
    savePath: __dirname + '/target/surefire-reports/',
});
jasmine.getEnv().addReporter(reporter);
