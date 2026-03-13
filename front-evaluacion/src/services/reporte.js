import { authFetch } from "@/services/authFetch";

export const getReport = async (data) =>{
    try {
        const response = await authFetch('/reportes', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // Obtener el ID del reporte del header
        const idreport = response.headers.get("X-Report-ID");
        console.log('ID del reporte:', idreport);

        // Get the PDF as a blob
        const pdfBlob = await response.blob();

        // Create a URL for the blob
        let pdfUrl = URL.createObjectURL(pdfBlob);

        return {
            pdfBlob,
            pdfUrl,
            idreport // Incluir el idreport en la respuesta
        };
    } catch (error) {
        console.log('error al obtener el reporte', error)
    }
}

export const getReportIA = async (data) =>{
    try {
        const response = await authFetch('/reportes/ai', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // Obtener el ID del reporte del header
        const idreport = response.headers.get("X-Report-ID");
        console.log('ID del reporte:', idreport);

        // Get the PDF as a blob
        const pdfBlob = await response.blob();

        // Create a URL for the blob
        let pdfUrl = URL.createObjectURL(pdfBlob);

        return {
            pdfBlob,
            pdfUrl,
            idreport // Incluir el idreport en la respuesta
        };
    } catch (error) {
        console.log('error al obtener el reporte', error)
    }
}
