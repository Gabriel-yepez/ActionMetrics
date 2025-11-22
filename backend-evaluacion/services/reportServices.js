const { maquetareport, maquetareportWithAI } = require('./maquetareport');
const PrinterServices = require('./printerServices');

class ReportServices {

    constructor () {
        this.printer = new PrinterServices();
    }

    async getReport(data) {
        const docDefinition = await maquetareport(data);
        return this.printer.createPdf(docDefinition);
    }
    
    async getReportWithAI(data) {
        const docDefinition = await maquetareportWithAI(data);
        return this.printer.createPdf(docDefinition);
    }
    
    // Nuevos métodos que devuelven tanto la definición como el stream
    async getReportWithDefinition(data) {
        const docDefinition = await maquetareport(data);
        const pdfStream = this.printer.createPdf(docDefinition);
        return { docDefinition, pdfStream };
    }
    
    async getReportWithAIAndDefinition(data) {
        const docDefinition = await maquetareportWithAI(data);
        const pdfStream = this.printer.createPdf(docDefinition);
        return { docDefinition, pdfStream };
    }
}

module.exports = ReportServices;
