import {
    db,
    doc,
    setDoc,
    collection,
    getDocs,
    onSnapshot
} from "./firebase.js";
const svg = document.getElementById("map");

let isAdmin = false;
let selectedPlot = null;

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

async function savePlots() {

    for (const plot of plots) {

        await setDoc(
            doc(
                db,
                "plots",
                String(plot.id)
            ),
            plot
        );

    }

}


async function loadPlots() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "plots"
            )
        );

    snapshot.forEach(docSnap => {

        const savedPlot =
            docSnap.data();

        const plot =
            plots.find(
                p => p.id === savedPlot.id
            );

        if(plot){

            plot.status =
                savedPlot.status || "available";

            plot.customer =
                savedPlot.customer || "";

            plot.extent =
                savedPlot.extent || "";

            plot.facing =
                savedPlot.facing || "";

        }

    });

    drawPlots();

}
function startRealtimeUpdates() {

    onSnapshot(
        collection(db, "plots"),
        (snapshot) => {

            snapshot.forEach(docSnap => {

                const savedPlot =
                    docSnap.data();

                const plot =
                    plots.find(
                        p => p.id === savedPlot.id
                    );

                if(plot){

                    plot.status =
                        savedPlot.status;

                    plot.customer =
                        savedPlot.customer || "";

                    plot.extent =
                        savedPlot.extent || "";

                    plot.facing =
                        savedPlot.facing || "";

                }

            });

            drawPlots();

        }
    );

}
function showPlotPopup(plot){
selectedPlot = plot;
    document.getElementById(
        "popupPlotNo"
    ).innerText = plot.id;

    document.getElementById(
        "popupStatus"
    ).innerText = plot.status;

    document.getElementById(
        "popupCustomer"
    ).innerText =
    plot.customer || "N/A";
    const customerInput =
document.getElementById("customerInput");

if(customerInput){
    customerInput.value =
    plot.customer || "";
}

    document.getElementById(
        "popupExtent"
    ).innerText =
    plot.extent || "N/A";

    document.getElementById(
        "popupFacing"
    ).innerText =
    plot.facing || "N/A";

    if(isAdmin){

    document.getElementById(
        "adminSection"
    ).style.display = "block";

}else{

    document.getElementById(
        "adminSection"
    ).style.display = "none";

}

document.getElementById(
    "plotPopup"
).style.display = "block";

}
function setStatus(status){

    if(!selectedPlot)
        return;

    selectedPlot.status = status;

    savePlots();

    drawPlots();

    showPlotPopup(selectedPlot);

}
function saveCustomer(){

    if(!selectedPlot)
        return;

    const customerName =
    document.getElementById(
        "customerInput"
    ).value.trim();

    selectedPlot.customer =
    customerName;

    savePlots();

    showPlotPopup(
        selectedPlot
    );

    alert(
        "Customer Saved"
    );

}
function closePopup(){

    document.getElementById(
        "plotPopup"
    ).style.display = "none";

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

            showPlotPopup(plot);

        });

        svg.appendChild(rect);

        const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

        text.setAttribute("x", plot.x + 15);
        text.setAttribute("y", plot.y + 35);
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "18");
        text.textContent = plot.id;

        svg.appendChild(text);

    });

    updateCounts();
}

loadPlots();
startRealtimeUpdates();

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

document
.getElementById("searchBtn")
.addEventListener("click", () => {

    const plotNo =
    parseInt(
        document.getElementById(
            "searchPlot"
        ).value
    );

    const plot =
    plots.find(
        p => p.id === plotNo
    );

    if(plot){

        showPlotPopup(plot);

    }else{

        alert("Plot Not Found");

    }

});
document
.getElementById("adminBtn")
.addEventListener("click", () => {

    const password =
    prompt("Enter Admin Password");

    if(password === "7702"){

        isAdmin = true;

        alert(
            "Admin Mode Enabled"
        );

    }else{

        alert(
            "Wrong Password"
        );

    }

});

window.addEventListener("click", function(event){

    const popup =
    document.getElementById("plotPopup");

    if(event.target === popup){

        popup.style.display = "none";

    }

});