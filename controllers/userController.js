const puppeteer = require("puppeteer");
const path = require("path");

var requestBody;

const loadReport = async (req, res) => {
  try {
    const requestData = requestBody;

    if (!Array.isArray(requestData)) {
      throw new Error("Request data is not in the expected format.");
    }

    const labels = requestData.map((entry) => entry.data_year.toString());
    const data = requestData.map((entry) => entry.Burglary);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Burglary",
          data: data,
          borderColor: "#1463FF",
          fill: false,
        },
      ],
    };
    res.render("report", {
      chartData: JSON.stringify(chartData),
    });
  } catch (error) {
    res.status(500).send({ success: false, msg: error.message });
  }
};

const generateReport = async (req, res) => {
  try {
    requestBody = req.body;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("http://localhost:5000/report", {
      waitUntil: "networkidle2",
    });

    await page.setViewport({ width: 595, height: 842 });

    const todayDate = new Date();

    const pdfBuffer = await page.pdf({
      path: `${path.join(
        __dirname,
        "../public/files",
        todayDate.getTime() + ".pdf",
      )}`,
      printBackground: true,
      format: "A4",
    });

    await browser.close();

    const pdfFileName = todayDate.getTime() + ".pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfFileName}"`,
    );

    res.send(pdfBuffer);

    // res.download(pdfURL, function (err) {
    //   if (errr) {
    //     console.log(errr);
    //   } else {
    //   }
    // });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to generate and send PDF" });
  }
};

module.exports = {
  loadReport,
  generateReport,
};
