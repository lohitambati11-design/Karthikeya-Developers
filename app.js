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


/* ==========================
   COUNTERS
========================== */

function updateCounts() {

    let available = 0;
    let booked = 0;
    let sold = 0;

    plots.forEach(plot => {

        if (plot.status === "available")
            available++;

        else if (plot.status === "booked")
            booked++;

        else if (plot.status === "sold")
            sold++;

    });

    document.getElementById("availableCount").innerText = available;
    document.getElementById("bookedCount").innerText = booked;
    document.getElementById("soldCount").innerText = sold;
}


/* ==========================
   FIREBASE SAVE
========================== */

async function savePlots() {

    for (const plot of plots) {

        await setDoc(
            doc(db, "plots", String(plot.id)),
            plot
        );

    }

}


/* ==========================
   FIREBASE LOAD
========================== */

async function loadPlots() {

    const snapshot = await getDocs(
        collection(db, "plots")
    );

    snapshot.forEach(docSnap => {

        const savedPlot = docSnap.data();

        const plot = plots.find(
            p => p.id === savedPlot.id
        );

        if (plot) {

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


/* ==========================
   REALTIME UPDATES
========================== */

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

                if (plot) {

                    plot.status =
                        savedPlot.status ||
                        "available";

                    plot.customer =
                        savedPlot.customer ||
                        "";

                    plot.extent =
                        savedPlot.extent ||
                        "";

                    plot.facing =
                        savedPlot.facing ||
                        "";

                }

            });

            drawPlots();

        }
    );

}


/* ==========================
   POPUP
========================== */

function showPlotPopup(plot) {

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
        plot.customer || "";

    document.getElementById(
        "popupExtent"
    ).innerText =
        plot.extent || "";

    document.getElementById(
        "popupFacing"
    ).innerText =
        plot.facing || "";


    const customerInput =
        document.getElementById(
            "customerInput"
        );

    if (customerInput) {

        customerInput.value =
            plot.customer || "";

    }


    if (isAdmin) {

        document.getElementById(
            "adminSection"
        ).style.display = "block";

    }

    else {

        document.getElementById(
            "adminSection"
        ).style.display = "none";

    }


    document.getElementById(
        "plotPopup"
    ).style.display = "block";

}


/* ==========================
   CLOSE POPUP
========================== */

function closePopup() {

    document.getElementById(
        "plotPopup"
    ).style.display = "none";

    selectedPlot = null;

}


/* ==========================
   ADMIN - SAVE CUSTOMER
========================== */

async function saveCustomer() {

    if (!selectedPlot)
        return;


    const customerName =
        document.getElementById(
            "customerInput"
        ).value.trim();


    selectedPlot.customer =
        customerName;


    await savePlots();


    document.getElementById(
        "popupCustomer"
    ).innerText =
        customerName;


    await loadPlots();


    alert("Customer Saved");

}


/* ==========================
   ADMIN - CHANGE STATUS
========================== */

async function setStatus(status) {

    if (!selectedPlot)
        return;


    selectedPlot.status =
        status;


    await savePlots();


    document.getElementById(
        "popupStatus"
    ).innerText =
        status;


    drawPlots();

}


/* =========================================================
   DRAW PLOTS
   =========================================================
   
   RECTANGLE:
   If plot.type is NOT "polygon",
   the existing x/y/width/height system is used.

   POLYGON:
   Only plots with type: "polygon"
   use their points.
========================================================= */

function drawPlots() {

    svg.innerHTML = "";


    plots.forEach(plot => {

        let shape;


        /* =================================================
           POLYGON PLOT
           ================================================= */

        if (plot.type === "polygon") {

            shape =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "polygon"
                );


            shape.setAttribute(
                "points",
                plot.points
            );

        }


        /* =================================================
           NORMAL RECTANGLE PLOT
           ================================================= */

        else {

            shape =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "rect"
                );


            shape.setAttribute(
                "x",
                plot.x
            );


            shape.setAttribute(
                "y",
                plot.y
            );


            shape.setAttribute(
                "width",
                plot.width
            );


            shape.setAttribute(
                "height",
                plot.height
            );

        }


        /* =================================================
           PLOT COLOR
           ================================================= */

        let color = "green";


        if (plot.status === "booked") {

            color = "yellow";

        }


        if (plot.status === "sold") {

            color = "red";

        }


        shape.setAttribute(
            "fill",
            color
        );


        shape.setAttribute(
            "stroke",
            "black"
        );


        shape.setAttribute(
            "fill-opacity",
            "0.7"
        );


        shape.setAttribute(
            "stroke-width",
            "3"
        );


        shape.style.cursor =
            "pointer";


        /* =================================================
           CLICK PLOT
           ================================================= */

        shape.addEventListener(
            "click",
            () => {

                showPlotPopup(plot);

            }
        );


        svg.appendChild(shape);


        /* =================================================
           PLOT NUMBER
           ================================================= */

        const text =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );


        let centerX;
        let centerY;


        /* =================================================
           POLYGON CENTER
           ================================================= */

        if (plot.type === "polygon") {

            const coords =
                plot.points
                    .trim()
                    .split(/\s+/)
                    .map(point => {

                        const values =
                            point
                                .split(",")
                                .map(Number);

                        return {
                            x: values[0],
                            y: values[1]
                        };

                    });


            if (coords.length < 3) {

                console.warn(
                    "Invalid polygon for plot:",
                    plot.id
                );

                return;

            }


            let area = 0;

            let centroidX = 0;

            let centroidY = 0;


            for (
                let i = 0;
                i < coords.length;
                i++
            ) {

                const current =
                    coords[i];

                const next =
                    coords[
                        (i + 1) %
                        coords.length
                    ];


                const cross =
                    current.x * next.y -
                    next.x * current.y;


                area += cross;


                centroidX +=
                    (current.x + next.x) *
                    cross;


                centroidY +=
                    (current.y + next.y) *
                    cross;

            }


            area =
                area / 2;


            if (
                Math.abs(area) > 0.001
            ) {

                centerX =
                    centroidX /
                    (6 * area);


                centerY =
                    centroidY /
                    (6 * area);

            }

            else {

                centerX =
                    coords.reduce(
                        (sum, point) =>
                            sum + point.x,
                        0
                    ) /
                    coords.length;


                centerY =
                    coords.reduce(
                        (sum, point) =>
                            sum + point.y,
                        0
                    ) /
                    coords.length;

            }

        }


        /* =================================================
           RECTANGLE CENTER
           ================================================= */

        else {

            centerX =
                plot.x +
                (plot.width / 2);


            centerY =
                plot.y +
                (plot.height / 2);

        }


        /* =================================================
           NUMBER POSITION
           ================================================= */

        text.setAttribute(
            "x",
            centerX
        );


        text.setAttribute(
            "y",
            centerY
        );


        text.setAttribute(
            "text-anchor",
            "middle"
        );


        text.setAttribute(
            "dominant-baseline",
            "middle"
        );


        /* =================================================
           NUMBER STYLE
           ================================================= */

        text.setAttribute(
            "fill",
            "white"
        );


        text.setAttribute(
            "font-size",
            "18"
        );


        text.setAttribute(
            "font-weight",
            "bold"
        );


        text.setAttribute(
            "stroke",
            "black"
        );


        text.setAttribute(
            "stroke-width",
            "1.5"
        );


        text.setAttribute(
            "paint-order",
            "stroke"
        );


        text.textContent =
            plot.id;


        /*
           Important:
           Clicking the number should still
           click the plot underneath.
        */

        text.style.pointerEvents =
            "none";


        svg.appendChild(text);

    });


    updateCounts();

}


/* ==========================
   INITIAL LOAD
========================== */

loadPlots();

startRealtimeUpdates();


/* ==========================
   COORDINATES
========================== */

svg.addEventListener(
    "mousemove",
    (e) => {

        const point =
            svg.createSVGPoint();


        point.x =
            e.clientX;

        point.y =
            e.clientY;


        const svgPoint =
            point.matrixTransform(
                svg
                    .getScreenCTM()
                    .inverse()
            );


        document.getElementById(
            "coordinates"
        ).innerText =
            `X: ${Math.round(svgPoint.x)} | Y: ${Math.round(svgPoint.y)}`;

    }
);


/* ==========================
   SEARCH
========================== */

document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        () => {

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


            if (plot) {

                showPlotPopup(plot);

            }

            else {

                alert(
                    "Plot Not Found"
                );

            }

        }
    );


/* ==========================
   ADMIN LOGIN
========================== */

document
    .getElementById("adminBtn")
    .addEventListener(
        "click",
        () => {

            const password =
                prompt(
                    "Enter Admin Password"
                );


            if (password === "7702") {

                isAdmin = true;


                alert(
                    "Admin Mode Enabled"
                );

            }

            else {

                alert(
                    "Wrong Password"
                );

            }

        }
    );


/* ==========================
   OUTSIDE CLICK CLOSE
========================== */

window.addEventListener(
    "click",
    function (event) {

        const popup =
            document.getElementById(
                "plotPopup"
            );


        if (event.target === popup) {

            popup.style.display =
                "none";

            selectedPlot = null;

        }

    }
);


/* ==========================
   GLOBAL FUNCTIONS
========================== */

window.closePopup =
    closePopup;

window.saveCustomer =
    saveCustomer;

window.setStatus =
    setStatus;