const puppeteer = require("puppeteer");
const firebase = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage")
require("firebase/storage");
require("dotenv").config();

var requestBody;

const firebaseConfig = {
  apiKey: "AIzaSyBz9GOcAyJsrg6t0Xlp8P-qTOT_BnhuxuU",
  authDomain: "real-assist-pdf.firebaseapp.com",
  projectId: "real-assist-pdf",
  storageBucket: "real-assist-pdf.appspot.com",
  messagingSenderId: "23790003857",
  appId: "1:23790003857:web:4ca768032525a375c38130",
};

firebase.initializeApp(firebaseConfig);
const storage = getStorage();

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
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    await page.goto("https://real-assist-backend.onrender.com/report", {
      waitUntil: "networkidle2",
    });

    await page.setViewport({ width: 595, height: 842 });

    const todayDate = new Date();

    const pdfBuffer = await page.pdf({
      printBackground: true,
      format: "A4",
    });

    await browser.close();

    const pdfFileName = todayDate.getTime() + ".pdf";

    // Create a reference to the desired storage location
    const storageRef = ref(storage, `pdfs/${pdfFileName}`);

    // Upload the PDF to Firebase Storage
    await uploadBytes(storageRef, pdfBuffer);

    // Get the download URL
      const pdfURL = await getDownloadURL(storageRef);

      res.status(200).json({ pdfURL });

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
