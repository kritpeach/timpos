const pdfMake = require("pdfmake/build/pdfmake.js");
const pdfFonts = require("pdfmake/build/vfs_fonts.js");

pdfMake.vfs = pdfFonts.pdfMake.vfs;
const openReport = (tableData, startDate, endDate, revenue, menuList) => {
  console.log(menuList);
  const docDefinition = {
    defaultStyle: {
      font: "THSarabun"
    },
    content: [
      { text: "Sales report", style: "subheader" },
      `Order from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      `Total revenue: ฿${revenue}`,
      {
        table: {
          headerRows: 1,
          body: [
            [
              { text: "Menu", style: "tableHeader" },
              { text: "Quantity", style: "tableHeader" },
              { text: "Revenue", style: "tableHeader" }
            ],
            ...tableData
          ]
        }
      }
    ]
  };
  pdfMake.fonts = {
    THSarabun: {
      normal: "THSarabun.ttf",
      bold: "THSarabun Bold.ttf",
      italics: "THSarabun Italic.ttf",
      bolditalics: "THSarabun Bold Italic.ttf"
    }
  };
  pdfMake.createPdf(docDefinition).download();
};

export default openReport;
