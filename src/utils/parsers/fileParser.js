import xlsx from 'xlsx';

/**
 * Read Excel file and convert to JSON
 */
export const readExcelFile = (fileBuffer) => {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: ''
    });

    if (jsonData.length === 0) {
        throw new Error('File không có dữ liệu.');
    }

    return jsonData;
};