import {
    db,
    doc,
    setDoc
} from "./firebase.js";

async function uploadPlots() {

    for (const plot of plots) {

        await setDoc(
            doc(db, "plots", String(plot.id)),
            plot
        );

        console.log(
            `Uploaded Plot ${plot.id}`
        );
    }

    alert("All plots uploaded successfully!");
}

window.uploadPlots = uploadPlots;