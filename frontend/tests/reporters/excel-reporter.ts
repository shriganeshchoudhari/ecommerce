/**
 * Playwright Custom Excel Reporter
 * Generates a styled .xlsx file with pass/fail results for every test.
 *
 * Output: frontend/test-results/ShopEase_TestReport.xlsx
 */

import ExcelJS from 'exceljs';
import type {
    Reporter, Suite, TestCase, TestResult,
} from '@playwright/test/reporter';
import * as path from 'path';
import * as fs from 'fs';

interface RowData {
    module: string;
    testId: string;
    testName: string;
    type: 'Positive' | 'Negative' | 'Info';
    browser: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    duration: number;
    error: string;
}

class ExcelReporter implements Reporter {
    private rows: RowData[] = [];
    private startTime = Date.now();

    onTestEnd(test: TestCase, result: TestResult): void {
        const titleParts = test.titlePath();             // e.g. ['', 'AUTH — Login', '[AUTH-P02] ...']
        const fileTitle = titleParts[1] || '';           // describe block
        const testTitle = titleParts[titleParts.length - 1];

        const module = this.extractModule(fileTitle);
        const testId = this.extractId(testTitle);
        const type = testId.includes('-N') ? 'Negative' : testTitle.toLowerCase().includes('info') ? 'Info' : 'Positive';
        const browser = test.parent?.project()?.name ?? 'chromium';

        this.rows.push({
            module,
            testId,
            testName: testTitle.replace(/^\[[\w-]+\]\s*/, ''),
            type,
            browser,
            status: result.status === 'passed' ? 'PASS' :
                result.status === 'skipped' ? 'SKIP' : 'FAIL',
            duration: Math.round(result.duration / 1000 * 10) / 10,
            error: result.error?.message?.split('\n')[0] ?? '',
        });
    }

    async onEnd(): Promise<void> {
        const outDir = path.resolve(__dirname, '../test-results');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const outFile = path.join(outDir, 'ShopEase_TestReport.xlsx');

        const wb = new ExcelJS.Workbook();
        wb.creator = 'ShopEase Playwright Reporter';
        wb.created = new Date();

        // ─── Summary Sheet ─────────────────────────────────────────────────
        const summary = wb.addWorksheet('Summary');
        const total = this.rows.length;
        const passed = this.rows.filter(r => r.status === 'PASS').length;
        const failed = this.rows.filter(r => r.status === 'FAIL').length;
        const skipped = this.rows.filter(r => r.status === 'SKIP').length;
        const passRate = total > 0 ? (passed / total * 100).toFixed(1) : '0';
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(0);

        summary.addRow(['ShopEase E2E Test Execution Report']);
        summary.addRow(['Generated:', new Date().toLocaleString()]);
        summary.addRow(['Duration:', `${elapsed}s`]);
        summary.addRow([]);
        summary.addRow(['Metric', 'Count']);
        summary.addRow(['Total Tests', total]);
        summary.addRow(['PASS', passed]);
        summary.addRow(['FAIL', failed]);
        summary.addRow(['SKIP', skipped]);
        summary.addRow(['Pass Rate', `${passRate}%`]);

        // Style summary header
        const titleRow = summary.getRow(1);
        titleRow.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        titleRow.alignment = { horizontal: 'center' };
        summary.mergeCells('A1:B1');

        ['FFFFFFFF', 'FFFFFFFF', 'FFFFFFFF', 'FFFFFFFF', 'FFFFFFFF'].forEach((_, i) => {
            const r = summary.getRow(5 + i);
            r.font = i === 0 ? { bold: true } : {};
        });
        const passRow = summary.getRow(7);
        passRow.font = { color: { argb: 'FF166534' }, bold: true };
        const failRow = summary.getRow(8);
        failRow.font = { color: { argb: 'FF991B1B' }, bold: true };
        summary.columns = [{ width: 20 }, { width: 20 }];

        // ─── Test Results Sheet ─────────────────────────────────────────────
        const ws = wb.addWorksheet('Test Results');
        ws.columns = [
            { header: 'Module', key: 'module', width: 20 },
            { header: 'Test ID', key: 'testId', width: 14 },
            { header: 'Test Name', key: 'testName', width: 55 },
            { header: 'Type', key: 'type', width: 12 },
            { header: 'Browser', key: 'browser', width: 13 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Duration(s)', key: 'duration', width: 13 },
            { header: 'Error', key: 'error', width: 60 },
        ];

        // Header row style
        const hdr = ws.getRow(1);
        hdr.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        hdr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        hdr.alignment = { horizontal: 'center', vertical: 'middle' };
        hdr.height = 22;

        for (const row of this.rows) {
            const dataRow = ws.addRow(row);
            const statusCell = dataRow.getCell('status');

            if (row.status === 'PASS') {
                statusCell.font = { bold: true, color: { argb: 'FF166534' } };
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
            } else if (row.status === 'FAIL') {
                statusCell.font = { bold: true, color: { argb: 'FF991B1B' } };
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
            } else {
                statusCell.font = { color: { argb: 'FF92400E' } };
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            }

            const typeCell = dataRow.getCell('type');
            if (row.type === 'Positive') {
                typeCell.font = { color: { argb: 'FF1D4ED8' } };
            } else {
                typeCell.font = { color: { argb: 'FFB45309' } };
            }

            // Alternating row background
            if (ws.rowCount % 2 === 0) {
                dataRow.eachCell({ includeEmpty: false }, cell => {
                    if (!cell.fill || (cell.fill as ExcelJS.FillPattern).fgColor?.argb === 'FFFFFFFF') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
                    }
                });
            }
        }

        // Freeze header row
        ws.views = [{ state: 'frozen', ySplit: 1 }];
        // Auto filter
        ws.autoFilter = { from: 'A1', to: 'H1' };

        // ─── Module Summary Sheet ───────────────────────────────────────────
        const modSheet = wb.addWorksheet('Module Summary');
        modSheet.columns = [
            { header: 'Module', key: 'module', width: 22 },
            { header: 'Total', key: 'total', width: 10 },
            { header: 'PASS', key: 'pass', width: 10 },
            { header: 'FAIL', key: 'fail', width: 10 },
            { header: 'SKIP', key: 'skip', width: 10 },
            { header: 'Pass Rate', key: 'rate', width: 13 },
        ];
        const modHdr = modSheet.getRow(1);
        modHdr.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        modHdr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

        const modules = [...new Set(this.rows.map(r => r.module))];
        for (const mod of modules) {
            const modRows = this.rows.filter(r => r.module === mod);
            const mTotal = modRows.length;
            const mPass = modRows.filter(r => r.status === 'PASS').length;
            const mFail = modRows.filter(r => r.status === 'FAIL').length;
            const mSkip = modRows.filter(r => r.status === 'SKIP').length;
            const mRate = mTotal > 0 ? (mPass / mTotal * 100).toFixed(1) + '%' : '0%';
            const mRow = modSheet.addRow({ module: mod, total: mTotal, pass: mPass, fail: mFail, skip: mSkip, rate: mRate });
            if (mFail > 0) mRow.getCell('fail').font = { bold: true, color: { argb: 'FF991B1B' } };
            if (mPass === mTotal) mRow.getCell('rate').font = { bold: true, color: { argb: 'FF166534' } };
        }
        // Totals row
        const tRow = modSheet.addRow({
            module: 'TOTAL',
            total,
            pass: passed,
            fail: failed,
            skip: skipped,
            rate: `${passRate}%`,
        });
        tRow.font = { bold: true };
        tRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };

        await wb.xlsx.writeFile(outFile);
        console.log(`\n✅ Excel report written to: ${outFile}\n`);
    }

    private extractModule(describe: string): string {
        const m = describe.match(/^([A-Z]+(?:\s—\s[A-Za-z]+)?)/);
        return m ? m[1] : describe;
    }

    private extractId(title: string): string {
        const m = title.match(/\[([A-Z]+-[A-Z][0-9]+)\]/);
        return m ? m[1] : '—';
    }
}

export default ExcelReporter;
