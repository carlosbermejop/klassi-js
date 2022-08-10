/**
 klassi-js
 Copyright © 2016 - Larry Goddard

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
const fs = require('fs-extra');
const path = require('path');
const reporter = require('multiple-cucumber-html-reporter');
const jUnit = require('cucumber-junit');
// const pactumJs = require('pactum');
// const getRemote = require('../getRemote');

// const remoteService = getRemote(global.settings.remoteService);
const browserName = global.settings.remoteConfig || global.BROWSER_NAME;
// let resp;
// let obj;

module.exports = {
  // ipAddr: async () => {
  //   const endPoint = 'http://ip-api.com/json';
  //   resp = await pactumJs.spec().get(endPoint).toss();
  //   return resp;
  // },

  async reporter() {
    const envName = env.envName.toLowerCase();
    // try {
    //   await this.ipAddr();
    //   obj = await resp.body;
    //   // console.log('this is in the reporter ', obj);
    // } catch (err) {
    //   obj = {};
    //   console.log('IpAddr func err: ', err.message);
    // }
    // const jsonDir = path.resolve(global.paths.reports, browserName, `${reportName}-${dateTime}.json`);
    // const jsonDir = path.resolve(global.paths.reports, `${browserName}/`);
    const jsonFile = path.resolve(global.paths.reports, browserName, envName, `${reportName}-${dateTime}.json`);

    const jsonDir = path.resolve(global.paths.reports, browserName, envName);

    const reportPath = path.resolve(
      global.paths.reports,
      browserName,
      envName,
      `${reportName}-${helpers.currentDate()}`
    );

    if (global.paths.reports && fs.existsSync(global.paths.reports)) {
      global.endDateTime = helpers.getEndDateTime();

      const reportOptions = {
        jsonDir,
        reportPath,
        reportSuiteAsScenarios: true,
        launchReport: !global.settings.disableReport,
        ignoreBadJsonFile: true,
        metadata: {
          browser: {
            name: 'chrome',
            version: '60',
          },
          device: 'Local test machine',
          platform: {
            name: 'ubuntu',
            version: '16.04',
          },
        },
        brandTitle: `${reportName} ${dateTime}`, // brandTitle: `${reportName} ${dateTime} ${env.envName}`,
        name: `${projectName} ${browserName}`,
      };
      // eslint-disable-next-line func-names,wdio/no-pause
      browser.pause(DELAY_3s).then(() => {
        reporter.generate(reportOptions);

        // grab the file data for xml creation
        const reportRaw = fs.readFileSync(jsonFile).toString().trim();
        const xmlReport = jUnit(reportRaw);
        const junitOutputPath = path.resolve(
          path.resolve(global.paths.reports, browserName, envName, `${reportName}-${dateTime}.xml`)
        );
        fs.writeFileSync(junitOutputPath, xmlReport);
      });
    }
  },
};
