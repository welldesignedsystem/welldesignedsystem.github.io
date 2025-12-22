
document.addEventListener("DOMContentLoaded", function () {
    function encodeHex(data) {
        return data.split('').map(function (c) {
            return c.charCodeAt(0).toString(16).padStart(2, '0');
        }).join('');
    }

    function compressToPlantUML(hex) {
        return "http://www.plantuml.com/plantuml/img/" + "~h" + hex;
    }

    document.querySelectorAll('.plantuml-diagram').forEach(function (container, index) {
        const textarea = container.querySelector('.plantuml-code');
        const img = container.querySelector('.plantuml-image');

        if (textarea && img) {
            const code = textarea.value;
            console.log("PlantUML Code:", code); 
            const hex = encodeHex(code);
            console.log("Encoded Hex:", hex); 
            img.src = compressToPlantUML(hex);
        }
    });
});

