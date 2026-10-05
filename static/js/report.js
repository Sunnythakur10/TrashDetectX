document.addEventListener("DOMContentLoaded", () => {
    const blockSelect = document.getElementById("blockSelect");
    const floorSelect = document.getElementById("floorSelect");
    const areaSelect = document.getElementById("areaSelect");
    const form = document.getElementById("reportForm");
    const fileInput = document.getElementById("trashPhoto");
    const submitBtn = document.getElementById("submitBtn");
    const statusBox = document.getElementById("formStatus");
    const previewWrap = document.getElementById("previewWrap");
    const previewImage = document.getElementById("previewImage");
    const dropZone = document.getElementById("fileDrop");
    const fileName = document.getElementById("fileName");

    if (!blockSelect || !floorSelect || !areaSelect || !form || !fileInput) return;

    const floorOptions = {
        "M Block": ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor"],
        "E Block": ["1st Floor", "2nd Floor", "3rd Floor"]
    };

    function getAreas(block, floor) {
        if (!block || !floor) return [];
        const match = floor.match(/\d+/);
        const floorNumber = match ? match[0] : "";
        const areas = [];

        for (let i = 1; i <= 6; i++) {
            areas.push(`${block.charAt(0)}${floorNumber}0${i}`);
        }

        areas.push("Toilet Area");
        return areas;
    }

    function setStatus(message, type = "info") {
        statusBox.textContent = message;
        statusBox.className = `status-box status-${type}`;
    }

    function getText(key) {
        return window.TrashDetectX ? window.TrashDetectX.t(key) : key;
    }

    blockSelect.addEventListener("change", () => {
        floorSelect.innerHTML = `<option value="" disabled selected>${getText("report.floorPlaceholder")}</option>`;
        areaSelect.innerHTML = `<option value="" disabled selected>${getText("report.areaPlaceholder")}</option>`;
        areaSelect.disabled = true;
        floorSelect.disabled = false;

        (floorOptions[blockSelect.value] || []).forEach(floor => {
            const option = document.createElement("option");
            option.value = floor;
            option.textContent = floor;
            floorSelect.appendChild(option);
        });
    });

    floorSelect.addEventListener("change", () => {
        areaSelect.innerHTML = `<option value="" disabled selected>${getText("report.areaPlaceholder")}</option>`;
        areaSelect.disabled = false;

        getAreas(blockSelect.value, floorSelect.value).forEach(area => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });
    });

    function showPreview(file) {
        if (!file || !file.type.startsWith("image/")) return;

        const url = URL.createObjectURL(file);
        previewImage.onload = () => URL.revokeObjectURL(url);
        previewImage.src = url;
        previewWrap.classList.add("show");
        fileName.textContent = `${getText("report.imageSelected")}: ${file.name}`;
    }

    fileInput.addEventListener("change", () => {
        showPreview(fileInput.files[0]);
    });

    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            dropZone.classList.add("dragging");
        });
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            dropZone.classList.remove("dragging");
        });
    });

    dropZone.addEventListener("drop", e => {
        const file = e.dataTransfer.files[0];
        if (file) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            showPreview(file);
        }
    });

    dropZone.addEventListener("click", () => fileInput.click());

    window.addEventListener("trashdetectx:languageChanged", () => {
        if (blockSelect.value) {
            const selectedFloor = floorSelect.value;
            floorSelect.innerHTML = `<option value="" disabled>${getText("report.floorPlaceholder")}</option>`;
            (floorOptions[blockSelect.value] || []).forEach(floor => {
                const option = document.createElement("option");
                option.value = floor;
                option.textContent = floor;
                floorSelect.appendChild(option);
            });
            floorSelect.value = selectedFloor;

            const selectedArea = areaSelect.value;
            areaSelect.innerHTML = `<option value="" disabled>${getText("report.areaPlaceholder")}</option>`;
            getAreas(blockSelect.value, floorSelect.value).forEach(area => {
                const option = document.createElement("option");
                option.value = area;
                option.textContent = area;
                areaSelect.appendChild(option);
            });
            areaSelect.value = selectedArea;
        } else {
            floorSelect.innerHTML = `<option value="" disabled selected>${getText("report.floorPlaceholder")}</option>`;
            areaSelect.innerHTML = `<option value="" disabled selected>${getText("report.areaPlaceholder")}</option>`;
        }
    });

    form.addEventListener("submit", async e => {
        e.preventDefault();

        if (!blockSelect.value || !floorSelect.value || !areaSelect.value || !fileInput.files[0]) {
            setStatus(getText("report.error"), "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add("btn-loading");
        setStatus(getText("report.analyzing"), "info");

        const block = blockSelect.value;
        const floor = floorSelect.value;
        const area = areaSelect.value;
        const details = document.getElementById("additionalDetails").value.trim();
        const file = fileInput.files[0];

        let latitude = null;
        let longitude = null;
        let filename = "";
        let detectedImagePath = "";
        let detections = [];

        try {
            try {
                const gpsData = await extractGPS(file);
                latitude = gpsData.latitude;
                longitude = gpsData.longitude;
            } catch (gpsError) {
                console.info("No EXIF GPS:", gpsError);
            }

            const uploadForm = new FormData();
            uploadForm.append("file", file);

            const uploadResponse = await fetch("/upload", {
                method: "POST",
                body: uploadForm
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok || !uploadData.success) {
                if (uploadData.error === "No trash detected") {
                    setStatus(getText("report.noTrash"), "error");
                    return;
                }
                throw new Error(uploadData.error || "Image processing failed.");
            }

            filename = uploadData.filename || "";
            detectedImagePath = uploadData.detected_image_path || "";
            detections = uploadData.detections || [];

            const reportResponse = await fetch("/submit-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    block,
                    floor,
                    area,
                    details,
                    gps: { latitude, longitude },
                    filename,
                    detected_image_path: detectedImagePath,
                    detections
                })
            });

            const reportData = await reportResponse.json();

            if (!reportResponse.ok || !reportData.success) {
                throw new Error(reportData.error || "Report submission failed.");
            }

            setStatus(getText("report.submitted"), "success");
            alert(getText("report.submitted"));

            form.reset();
            blockSelect.selectedIndex = 0;
            floorSelect.innerHTML = `<option value="" disabled selected>${getText("report.floorPlaceholder")}</option>`;
            areaSelect.innerHTML = `<option value="" disabled selected>${getText("report.areaPlaceholder")}</option>`;
            floorSelect.disabled = true;
            areaSelect.disabled = true;
            previewWrap.classList.remove("show");
            fileName.textContent = "";
        } catch (error) {
            console.error("Submission error:", error);
            setStatus(error.message || getText("report.error"), "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove("btn-loading");
        }
    });
});

function extractGPS(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const img = new Image();

            img.onload = function () {
                try {
                    EXIF.getData(img, function () {
                        const lat = EXIF.getTag(this, "GPSLatitude");
                        const lon = EXIF.getTag(this, "GPSLongitude");
                        const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
                        const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

                        if (!lat || !lon) {
                            reject("No GPS data found.");
                            return;
                        }

                        const latitude =
                            (lat[0] + lat[1] / 60 + lat[2] / 3600) *
                            (latRef === "S" ? -1 : 1);

                        const longitude =
                            (lon[0] + lon[1] / 60 + lon[2] / 3600) *
                            (lonRef === "W" ? -1 : 1);

                        resolve({ latitude, longitude });
                    });
                } catch (error) {
                    reject("Unable to read EXIF GPS data.");
                }
            };

            img.onerror = () => reject("Unable to load image.");
            img.src = event.target.result;
        };

        reader.onerror = () => reject("Unable to read file.");
        reader.readAsDataURL(file);
    });
}
