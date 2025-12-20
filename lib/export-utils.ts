import * as XLSX from 'xlsx';

export const downloadExperimentAsExcel = (
    systemPrompt: string,
    userPrompt: string | null,
    aiResponse: string | null,
    bulkData?: { input: string; output: string; model: string; status: string }[]
) => {
    // Sheet 1: System Prompt
    const sheet1Data = [
        ["System Prompt"],
        [systemPrompt]
    ];
    const sheet1 = XLSX.utils.aoa_to_sheet(sheet1Data);

    // Sheet 2: Experiment Data
    let sheet2Data: (string | null)[][] = [];

    if (bulkData && bulkData.length > 0) {
        // Bulk Mode
        sheet2Data = [
            ["Case #", "User Prompt", "AI Response", "Model", "Status"],
            ...bulkData.map((d, i) => [
                (i + 1).toString(),
                d.input,
                d.output,
                d.model,
                d.status
            ])
        ];
    } else {
        // Single Mode
        sheet2Data = [
            ["User Prompt", "AI Response"],
            [userPrompt || "", aiResponse || ""]
        ];
    }
    const sheet2 = XLSX.utils.aoa_to_sheet(sheet2Data);


    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet1, "System Prompt");
    XLSX.utils.book_append_sheet(workbook, sheet2, "Experiment");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `experiment-${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, filename);
};
