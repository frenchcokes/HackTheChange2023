//Output filesystem
function generateOutputs(data){
    //replace children.
    let outputBoxes = document.getElementById("output__boxes");
    outputBoxes.replaceChildren();

    for(let i = 0; i < data.objectAnnotations.length; i++){
        //Make some new elements to fit information
        let newOutput = document.createElement("div");
        let newObjName = document.createElement("h2");
        let disposal = document.createElement("p");

        newOutput.setAttribute("id", `output__boxes__${i}`);
        newOutput.setAttribute("class", `outputBox`);
        newObjName.setAttribute("class", `outputBox__header`);
        disposal.setAttribute("class", `objectBox__text`);

        //Put data in
        newObjName.innerText = `${data.objectAnnotations[i].name}`;
        disposal.innerText = `${data.objectAnnotations[i].disposal} \n \n Confidence: ${data.objectAnnotations[i].score}`;

        //Append to DOM
        newOutput.appendChild(newObjName);
        newOutput.appendChild(disposal);

        outputBoxes.appendChild(newOutput);
    }
    for(let j = 0; j < data.textAnnotations.length; j++){
        let newOutput = document.createElement("div");
        let newObjName = document.createElement("h2");
        let disposal = document.createElement("p");

        newOutput.setAttribute("id", `output__boxes__${j}`);
        newOutput.setAttribute("class", `outputBox`);
        newObjName.setAttribute("class", `outputBox__header`);
        disposal.setAttribute("class", `objectBox__text`);

        newObjName.innerText = `${data.textAnnotations[j].name}`;
        disposal.innerText = `${data.textAnnotations[j].disposal}`;

        //Append to DOM
        newOutput.appendChild(newObjName);
        newOutput.appendChild(disposal);

        outputBoxes.appendChild(newOutput);
    }
}