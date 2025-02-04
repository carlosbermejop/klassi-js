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
const path = require("path");
const fs = require("fs-extra");
const AWS = require("aws-sdk");
const program = require("commander");

// const s3Bucket = s3Data.S3_BUCKET;
const s3Bucket = "test-app-automated-reports";
const s3AccessKeyId = process.env.S3_KEY;
const s3SecretAccessKey = process.env.S3_SECRET;
// const domainName = s3Data.S3_DOMAIN_NAME;
const domainName =
  "http://test-app-automated-reports.s3.eu-west-2.amazonaws.com";

const s3 = new AWS.S3({
  // region: s3Data.S3_REGION,
  region: "eu-west-2",
  accessKeyId: s3AccessKeyId,
  secretAccessKey: s3SecretAccessKey,
});

module.exports = {
  async s3Processor(projectName) {
    const date = this.formatDate();
    const folderName = date;
    // eslint-disable-next-line no-param-reassign,no-undef
    projectName = dataconfig.s3FolderName;
    console.log(
      `Starting Processing of Test Report for: ${date}/${projectName} ...`
    );
    /**
     * This creates the test report from the sample template
     * @type {string}
     */
    const tempFile = path.resolve(__dirname, "./scripts/s3ReportSample");
    let filePath;

    if (program.opts().dlink) {
      filePath = `../../${projectName}/test/reports/testReport-${date}.html`;
    } else {
      filePath = `../${projectName}/reports/testReport-${date}.html`;
    }

    const file = filePath;
    await fs.copySync(tempFile, file);

    /**
     * list of browsers test running on via lambdatest
     * @type {string[]}
     */
    const browserName = [
      "chrome",
      "firefox",
      "edge",
      "safari",
      "tabletGalaxy",
      "tabletiPad",
    ];
    let dataList;
    let dataNew = "";
    let browsername;
    let dataOut = await helpers.readFromFile(tempFile);

    s3.listObjects(
      {
        Bucket: s3Bucket,
        Marker: folderName,
        Prefix: `${date}/${projectName}`,
        MaxKeys: 1000,
      },
      async (err, data) => {
        if (data.Contents) {
          // // eslint-disable-next-line no-plusplus, no-plusplus
          for (let x = 0; x < browserName.length; x++) {
            browsername = browserName[x];
            const browserData = [];

            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < data.Contents.length; i++) {
              const key = data.Contents[i].Key;
              if (key.substring(0, 10) === folderName) {
                if (key.split(".")[1] === "html") {
                  dataList = `${domainName}/${key}`;
                  if (dataList.includes(browsername)) {
                    const envDataNew = dataList
                      .replace(/^.*reports\/\w+\//, "")
                      .replace(/\/.*.html/, "");
                    // console.log('this is the env Name from the s3reportProcessor ln 90 ====> ', envDataNew);
                    dataNew = dataList
                      .replace(/^.*reports\/\w+\//, "")
                      .replace(`${envDataNew}/`, "")
                      .replace(/\.html/, "");
                    // console.log('this is the data new from the s3reportProcessor ln 92 ====> ', dataNew);
                    const theNewData = `${dataNew} -- ${envDataNew}`;
                    let dataFile = "";
                    browserData.push(
                      (dataFile = `${dataFile}<div class="panel ${browsername}"><p style="text-indent:40px">${browsername}</p><a href="${dataList}">${theNewData}</a></div>`)
                    );
                  }
                }
              }
            }
            dataOut = dataOut.replace(
              "<-- browser_test_output -->",
              browserData.join(" ")
            );
          }
        }
        await helpers.writeToTxtFile(file, dataOut);
        if (dataList === undefined) {
          console.error(
            "There is no Data for this Project / project does not exist ...."
          );
        } else if (dataList.length > 0) {
          console.log("Test run completed and s3 report being sent .....");
          await helpers.klassiEmail();
        }
      }
    );
  },
  formatDate() {
    const $today = new Date();
    let $yesterday = new Date($today);
    $yesterday.setDate($today.getDate() - 1); // this cause the month to rollover.
    // $yesterday.setDate($today.getDate()); // uncomment for testing sets the date to today.
    let $dd = $yesterday.getDate();
    let $mm = $yesterday.getMonth() + 1; // January is 0!
    const $yyyy = $yesterday.getFullYear();
    if ($dd < 10) {
      $dd = `0${$dd}`;
    }
    if ($mm < 10) {
      $mm = `0${$mm}`;
    }
    $yesterday = `${$dd}-${$mm}-${$yyyy}`;
    return $yesterday;
  },
};
