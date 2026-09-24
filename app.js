const svg = document.getElementById("map");

let nextPlotId = 1;

function updateCounts() {

    let available = 0;
    let booked = 0;
    let sold = 0;

    plots.forEach(plot => {

        if(plot.status === "available")
            available++;
        else if(plot.status === "booked")
            booked++;
        else if(plot.status === "sold")
            sold++;

    });

    document.getElementById("availableCount").innerText = available;
    document.getElementById("bookedCount").innerText = booked;
    document.getElementById("soldCount").innerText = sold;
}

function savePlots() {
    localStorage.setItem(
        "nagarajukuntaPlots",
        JSON.stringify(plots)
    );
}

function loadPlots() {

    const saved = localStorage.getItem(
        "nagarajukuntaPlots"
    );

    if(saved){

        const savedPlots = JSON.parse(saved);

        savedPlots.forEach(savedPlot => {

            const plot = plots.find(
                p => p.id === savedPlot.id
            );

            if(plot){
                plot.status = savedPlot.status;
            }

        });

    }
}

function drawPlots() {

    svg.innerHTML = "";

    plots.forEach(plot => {

        const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );

        rect.setAttribute("x", plot.x);
        rect.setAttribute("y", plot.y);
        rect.setAttribute("width", plot.width);
        rect.setAttribute("height", plot.height);

        let color = "green";

        if(plot.status === "booked")
            color = "yellow";

        if(plot.status === "sold")
            color = "red";

        rect.setAttribute("fill", color);
        rect.setAttribute("stroke", "black");
        rect.setAttribute("fill-opacity", "0.7");
        rect.setAttribute("stroke-width", "3");

        rect.addEventListener("click", () => {

            if(plot.status === "available")
                plot.status = "booked";
            else if(plot.status === "booked")
                plot.status = "sold";
            else
                plot.status = "available";

            savePlots();
            drawPlots();

        });

        svg.appendChild(rect);

        const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

        text.setAttribute("x", plot.x + 30);
        text.setAttribute("y", plot.y + 45);
        text.setAttribute("fill", "white");
        text.textContent = plot.id;

        svg.appendChild(text);

    });

    updateCounts();
}

loadPlots();
drawPlots();
svg.addEventListener("mousemove", (e) => {

    const point = svg.createSVGPoint();

    point.x = e.clientX;
    point.y = e.clientY;

    const svgPoint =
        point.matrixTransform(
            svg.getScreenCTM().inverse()
        );

    document.getElementById(
        "coordinates"
    ).innerText =
        `X: ${Math.round(svgPoint.x)} | Y: ${Math.round(svgPoint.y)}`;

});
svg.addEventListener("click", (e) => {

    const point = svg.createSVGPoint();

    point.x = e.clientX;
    point.y = e.clientY;

    const svgPoint =
        point.matrixTransform(
            svg.getScreenCTM().inverse()
        );

    if(addPlotMode){

       console.log(
`{ id: ${nextPlotId}, x: ${Math.round(svgPoint.x)}, y: ${Math.round(svgPoint.y)}, width: 45, height: 60, status: "available" },`
);

nextPlotId++;
    }

});
let addPlotMode = false;

document
.getElementById("addPlotBtn")
.addEventListener("click", () => {

    addPlotMode = !addPlotMode;

    document.getElementById(
        "addPlotBtn"
    ).innerText =
    addPlotMode
    ? "Add Plot Mode: ON"
    : "Add Plot Mode: OFF";

});