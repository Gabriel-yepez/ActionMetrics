const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
};

// Asegurarse de que el directorio de reportes exista
const REPORTS_DIR = path.join(__dirname, '../public/reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

class PrinterServices {

    static printer = new PdfPrinter(fonts);
    
    // Método para streaming del PDF (previamente existente)
    createPdf = (docDefinition) => {
        return PrinterServices.printer.createPdfKitDocument(docDefinition);
    }
    
    // Nuevo método para guardar el PDF en disco y devolver la URL
    savePdf = async (docDefinition, userId, fecha) => {
        return new Promise((resolve, reject) => {
            try {
                // Crear un nombre de archivo base
                let baseFilename = `reporte_${userId}_${fecha}`;
                let filename = `${baseFilename}.pdf`;
                let filePath = path.join(REPORTS_DIR, filename);
                
                // Verificar si el archivo ya existe y crear uno con nombre único
                let counter = 1;
                while (fs.existsSync(filePath)) {
                    // Si ya existe, agregar un número secuencial
                    filename = `${baseFilename} (${counter}).pdf`;
                    filePath = path.join(REPORTS_DIR, filename);
                    counter++;
                }
                
                // Crear el documento PDF
                const pdfDoc = PrinterServices.printer.createPdfKitDocument(docDefinition);
                
                // Stream para escribir en archivo
                const writeStream = fs.createWriteStream(filePath);
                
                // Manejar eventos
                writeStream.on('error', (error) => {
                    console.error('Error escribiendo PDF en disco:', error);
                    reject(error);
                });
                
                pdfDoc.on('end', () => {
                    // Construir URL para el frontend
                    const fileUrl = `/reports/${filename}`;
                    resolve({
                        success: true,
                        fileUrl,
                        filePath
                    });
                });
                
                // Pipe y finalizar
                pdfDoc.pipe(writeStream);
                pdfDoc.end();
            } catch (error) {
                console.error('Error generando PDF:', error);
                reject(error);
            }
        });
    }
}

module.exports = PrinterServices;