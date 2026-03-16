import { authFetch } from "@/services/authFetch";

export const getReport = async (data) =>{
    const response = await authFetch('/reportes', {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `No se pudo generar el reporte (código ${response.status}).`);
    }

    const idreport = response.headers.get("X-Report-ID");
    const pdfBlob = await response.blob();
    let pdfUrl = URL.createObjectURL(pdfBlob);

    return { pdfBlob, pdfUrl, idreport };
}

export const getReportIA = async (data) =>{
    const response = await authFetch('/reportes/ai', {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `No se pudo generar el reporte con IA (código ${response.status}).`);
    }

    const idreport = response.headers.get("X-Report-ID");
    const pdfBlob = await response.blob();
    let pdfUrl = URL.createObjectURL(pdfBlob);

    return { pdfBlob, pdfUrl, idreport };
}
