import xml2js from 'xml2js'; // Importer xml2js
import * as XLSX from 'xlsx';

function exportToExcel(data) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAsExcelFile(wbout, 'data.xlsx');
}

function saveAsExcelFile(buffer, filename) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'data.xlsx';
    a.click();

    window.URL.revokeObjectURL(url);
}

window.handleFile = function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Veuillez sélectionner un fichier XML.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        const xmlString = event.target.result;

        // Parse XML en JSON
        xml2js.parseString(xmlString, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }

            // Fonction récursive pour extraire les variables
            function extractVariables(variables, parent) {
                let extractedVariables = [];

                if (!variables || !variables.variable) {
                    return extractedVariables;
                }

                variables.variable.forEach(variable => {
                    const key = variable.$.key;
                    const type = variable.$.type;
                    const description = variable.description[0];
                    const value = variable.value[0]['_'];

                    const groupName = type === 'group' && !/^Parameter|^Variable/.test(key) ? key : parent;

                    if(key && (description || value)) {
                        const extractedVariable = {
                            parent: parent,
                            key: key,
                            description: description,
                            value: value
                        };
                        extractedVariables.push(extractedVariable);
                    }


                    // Si la variable a des variables imbriquées, extraire récursivement
                    if (variable.variable) {
                        extractedVariables = extractedVariables.concat(extractVariables(variable, groupName));
                    }
                });

                return extractedVariables;
            }

            const extractedData = extractVariables(result.scope.variable[0], '');

            console.log(extractedData);

            // Afficher l'objet JSON
            exportToExcel(extractedData);
        });
    };

    reader.readAsText(file);
}


