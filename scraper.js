const puppeteer = require("puppeteer");
const { promisify } = require("util");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const RESULT_DIR = path.join(__dirname, "result");
const writeFileSync = promisify(fs.writeFileSync);
if (!fs.existsSync(RESULT_DIR)) fs.mkdirSync(RESULT_DIR);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(process.env.GFORM_URL, {
      timeout: 0,
    });

    const questions = await page.evaluate(() => {
      const allQue = Array.from(
        document.querySelectorAll(".freebirdFormviewerViewItemsItemItem")
      );

      const data = allQue.map((que) => {
        let dat = {
          question: que
            .querySelector(
              ".freebirdFormviewerViewItemsItemItemTitle.exportItemTitle.freebirdCustomFont"
            )
            .innerText.replace("*", "")
            .trim(),
        };

        const inputShort = que.querySelector(
          ".freebirdFormviewerViewItemsTextShortText.freebirdThemedInput"
        );
        const options = que.querySelector(
          ".appsMaterialWizToggleRadiogroupGroupContainer.exportGroupContainer.freebirdFormviewerViewItemsRadiogroupRadioGroup"
        );

        if (inputShort !== null) dat.inputShort = inputShort.innerHTML;
        if (options !== null) {
          const allOptions = options.querySelectorAll(
            ".freebirdFormviewerViewItemsRadioOptionContainer"
          );

          const opt = Array.from(allOptions).map((opt) => opt.innerText);
          const checked = options.querySelector(".isChecked").innerText;

          dat.options = { opt, checked };
        }

        return dat;
      });

      return data;
    });

    await browser.close();
    writeFileSync(
      path.join(RESULT_DIR, "result.json"),
      JSON.stringify(questions, null, 2)
    );
  } catch (e) {
    console.error(e);
    await browser.close();
  }
})();
