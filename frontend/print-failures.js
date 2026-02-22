const ExcelJS = require('exceljs');

async function checkFailures() {
    const wb = new ExcelJS.Workbook();
    try {
        await wb.xlsx.readFile('./tests/test-results/ShopEase_TestReport.xlsx');
        const ws = wb.getWorksheet('Test Results');
        let failures = [];
        ws.eachRow((row, rowNumber) => {
            if (rowNumber > 1 && row.getCell(6).value === 'FAIL') { // Column F is Status
                failures.push({
                    module: row.getCell(1).value,
                    id: row.getCell(2).value,
                    name: row.getCell(3).value,
                    error: row.getCell(8).value
                });
            }
        });
        const fs = require('fs');
        fs.writeFileSync('failures.json', JSON.stringify(failures, null, 2), 'utf8');
        console.log("Wrote failures to failures.json");
    } catch (err) {
        console.error("Failed to read Excel:", err);
    }
}
checkFailures();
