const db = firebase.firestore();

let allReports = [];

function t(key) {
    return window.TrashDetectX ? window.TrashDetectX.t(key) : key;
}


/* =========================
   IMAGE PATH
========================= */

function normalizeImagePath(value) {
    if (!value) return "";

    let path = String(value).replace(/\\/g, "/");

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (path.startsWith("/detected/")) return path;

    if (path.startsWith("detected/")) {
        return "/" + path;
    }

    const marker = "static/detected/";
    const index = path.indexOf(marker);

    if (index !== -1) {
        return "/" + path.substring(index + "static/".length);
    }

    return path.startsWith("/") ? path : "/" + path;
}


/* =========================
   DETECTIONS
========================= */

function normalizeDetections(raw) {
    if (!Array.isArray(raw)) return [];

    return raw.map(item => {
        if (typeof item === "string") {
            return {
                className: item,
                confidence: null
            };
        }

        return {
            className: item?.class || item?.name || "Unknown",
            confidence:
                typeof item?.confidence === "number"
                    ? item.confidence
                    : null
        };
    });
}


/* =========================
   STATUS
========================= */

function normalizeStatus(value) {
    /*
     * Everything is converted to a clean status.
     *
     * Examples:
     * Pending
     * pending
     * PENDING
     * pending report
     *
     * Resolved
     * resolved
     * RESOLVED
     */

    if (value === null || value === undefined) {
        return "Pending";
    }

    const status = String(value).trim().toLowerCase();

    if (status.includes("resolved") || status.includes("resolve")) {
        return "Resolved";
    }

    return "Pending";
}


/* =========================
   STATS
========================= */

function updateStats() {
    const total = allReports.length;

    let pending = 0;
    let resolved = 0;

    allReports.forEach(report => {
        const data = report.data || report;

        const status = normalizeStatus(data.status);

        if (status === "Resolved") {
            resolved++;
        } else {
            pending++;
        }
    });

    console.log("========== DASHBOARD STATS ==========");
    console.log("Total reports:", total);
    console.log("Pending reports:", pending);
    console.log("Resolved reports:", resolved);
    console.log("=====================================");

    const totalEl = document.getElementById("totalCount");
    const pendingEl = document.getElementById("pendingCount");
    const resolvedEl = document.getElementById("resolvedCount");

    if (totalEl) {
        totalEl.textContent = total;
    }

    if (pendingEl) {
        pendingEl.textContent = pending;
    }

    if (resolvedEl) {
        resolvedEl.textContent = resolved;
    }
}


/* =========================
   CLASSES
========================= */

function getAllClasses() {
    const classes = new Set();

    allReports.forEach(report => {
        const data = report.data || report;

        normalizeDetections(data.detections).forEach(d => {
            classes.add(d.className);
        });
    });

    return [...classes].sort();
}


function updateClassFilter() {
    const select = document.getElementById("classFilter");

    if (!select) return;

    const current = select.value;

    select.innerHTML = `
        <option value="">${t("admin.allClasses")}</option>
    `;

    getAllClasses().forEach(className => {
        const option = document.createElement("option");

        option.value = className;
        option.textContent = className;

        select.appendChild(option);
    });

    select.value = current;
}


/* =========================
   FILTERS
========================= */

function reportMatchesFilters(report) {
    const data = report.data || report;

    const search =
        (document.getElementById("searchInput")?.value || "")
            .trim()
            .toLowerCase();

    const status =
        document.getElementById("statusFilter")?.value || "";

    const selectedClass =
        document.getElementById("classFilter")?.value || "";

    const haystack = [
        data.block,
        data.floor,
        data.area,
        data.details,
        ...normalizeDetections(data.detections)
            .map(d => d.className)
    ]
        .join(" ")
        .toLowerCase();

    if (search && !haystack.includes(search)) {
        return false;
    }

    if (
        status &&
        normalizeStatus(data.status) !== status
    ) {
        return false;
    }

    if (selectedClass) {
        const found = normalizeDetections(data.detections)
            .some(d => d.className === selectedClass);

        if (!found) {
            return false;
        }
    }

    return true;
}


/* =========================
   RENDER REPORTS
========================= */

function renderReports() {
    const tableBody =
        document.getElementById("reportTableBody");

    const emptyState =
        document.getElementById("emptyState");

    if (!tableBody) return;

    const filteredReports =
        allReports.filter(reportMatchesFilters);

    tableBody.innerHTML = "";

    if (!filteredReports.length) {
        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }

    if (emptyState) {
        emptyState.hidden = true;
    }

    filteredReports.forEach(report => {
        const data = report.data || report;

        const reportId =
            report.id || data.id;

        const detections =
            normalizeDetections(data.detections);

        /* Detection badges */

        const detectionsHtml = detections.length
            ? detections.map(d => {

                const confidence =
                    d.confidence === null
                        ? ""
                        : ` ${Math.round(d.confidence * 100)}%`;

                return `
                    <span class="badge-class">
                        ${escapeHtml(d.className)}${confidence}
                    </span>
                `;

            }).join("")
            : `<span>${t("admin.none")}</span>`;


        /* Location */

        const hasLocation =
            data.latitude !== null &&
            data.latitude !== undefined &&
            data.longitude !== null &&
            data.longitude !== undefined;

        const locationHtml = hasLocation

            ? `
                <a
                    class="location-link"
                    href="https://www.google.com/maps?q=${encodeURIComponent(
                        data.latitude + "," + data.longitude
                    )}"
                    target="_blank"
                    rel="noopener"
                >
                    <i class="bi bi-geo-alt"></i>
                    ${t("admin.location")}
                </a>
            `

            : `
                <span class="text-muted">
                    ${t("admin.noLocation")}
                </span>
            `;


        /* Image */

        const imagePath =
            normalizeImagePath(data.detected_image);

        const imageHtml = imagePath

            ? `
                <div class="report-media">

                    <img
                        class="report-thumb"
                        src="${escapeAttr(imagePath)}"
                        alt="Detected trash"
                        loading="lazy"
                        onerror="this.style.display='none'"
                    >

                    <div class="media-actions">

                        <button
                            class="btn-mini btn-view"
                            onclick="showImageModal('${escapeAttr(imagePath)}')"
                        >
                            <i class="bi bi-image"></i>
                            ${t("admin.viewImage")}
                        </button>

                        ${locationHtml}

                    </div>

                </div>
            `

            : locationHtml;


        /* Status */

        const status =
            normalizeStatus(data.status);

        const statusClass =
            status === "Resolved"
                ? "status-resolved"
                : "status-pending";


        /* Row */

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td data-label="${t("admin.block")}">
                ${escapeHtml(data.block || "")}
            </td>

            <td data-label="${t("admin.floor")}">
                ${escapeHtml(data.floor || "")}
            </td>

            <td data-label="${t("admin.area")}">
                ${escapeHtml(data.area || "")}
            </td>

            <td data-label="${t("admin.details")}">
                ${escapeHtml(
                    data.details || t("admin.none")
                )}
            </td>

            <td data-label="${t("admin.status")}">

                <span
                    class="status-pill ${statusClass}"
                >
                    ${escapeHtml(status)}
                </span>

            </td>

            <td data-label="${t("admin.media")}">
                ${imageHtml}
            </td>

            <td data-label="${t("admin.classes")}">
                ${detectionsHtml}
            </td>

            <td data-label="${t("admin.actions")}">

                <div class="d-flex flex-wrap gap-2">

                    ${
                        status !== "Resolved"
                            ? `
                                <button
                                    class="btn-mini btn-resolve"
                                    onclick="updateStatus(
                                        '${escapeAttr(reportId)}',
                                        'Resolved'
                                    )"
                                >
                                    <i class="bi bi-check2-circle"></i>
                                    ${t("admin.resolve")}
                                </button>
                            `
                            : ""
                    }

                    <button
                        class="btn-mini btn-delete"
                        onclick="deleteReport(
                            '${escapeAttr(reportId)}'
                        )"
                    >
                        <i class="bi bi-trash3"></i>
                        ${t("admin.delete")}
                    </button>

                </div>

            </td>
        `;

        tableBody.appendChild(row);
    });
}


/* =========================
   FETCH REPORTS
========================= */

async function fetchReports() {

    const statusSummary =
        document.getElementById("statusSummary");

    if (statusSummary) {
        statusSummary.textContent =
            t("admin.loading");
    }

    try {

        const snapshot =
            await db
                .collection("trash_reports")
                .orderBy("block")
                .get();

        allReports =
            snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            }));


        console.log(
            "Firestore reports loaded:",
            allReports
        );


        /*
         * IMPORTANT:
         * Stats are calculated from ALL reports,
         * not from filtered reports.
         */

        updateStats();

        updateClassFilter();

        renderReports();


        if (statusSummary) {

            statusSummary.textContent =
                `${allReports.length} ${
                    t("admin.total").toLowerCase()
                }`;
        }

    } catch (error) {

        console.error(
            "Error fetching reports:",
            error
        );

        if (statusSummary) {
            statusSummary.textContent =
                t("admin.failed");
        }
    }
}


/* =========================
   UPDATE STATUS
========================= */

async function updateStatus(id, newStatus) {

    try {

        await db
            .collection("trash_reports")
            .doc(id)
            .update({
                status: newStatus
            });

        console.log(
            `Report ${id} changed to ${newStatus}`
        );

        await fetchReports();

    } catch (error) {

        console.error(
            "Error updating status:",
            error
        );

        alert(error.message);
    }
}


/* =========================
   DELETE REPORT
========================= */

async function deleteReport(id) {

    if (
        !confirm(
            t("admin.deleteConfirm")
        )
    ) {
        return;
    }

    try {

        await db
            .collection("trash_reports")
            .doc(id)
            .delete();

        await fetchReports();

    } catch (error) {

        console.error(
            "Error deleting report:",
            error
        );

        alert(error.message);
    }
}


/* =========================
   IMAGE MODAL
========================= */

function showImageModal(imagePath) {

    const backdrop =
        document.getElementById(
            "imageModalBackdrop"
        );

    const img =
        document.getElementById(
            "modalImage"
        );

    if (!backdrop || !img) {
        return;
    }

    img.src = imagePath;

    backdrop.classList.add("show");
}


function hideImageModal() {

    const backdrop =
        document.getElementById(
            "imageModalBackdrop"
        );

    const img =
        document.getElementById(
            "modalImage"
        );

    if (backdrop) {
        backdrop.classList.remove("show");
    }

    if (img) {
        img.src = "";
    }
}


/* =========================
   SECURITY / HTML ESCAPING
========================= */

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


function escapeAttr(value) {

    return escapeHtml(value)
        .replace(/`/g, "&#096;");
}


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.updateStatus =
    updateStatus;

window.deleteReport =
    deleteReport;

window.showImageModal =
    showImageModal;


/* =========================
   PAGE LOAD
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .getElementById("searchInput")
            ?.addEventListener(
                "input",
                renderReports
            );


        document
            .getElementById("statusFilter")
            ?.addEventListener(
                "change",
                renderReports
            );


        document
            .getElementById("classFilter")
            ?.addEventListener(
                "change",
                renderReports
            );


        document
            .getElementById("closeImageModal")
            ?.addEventListener(
                "click",
                hideImageModal
            );


        document
            .getElementById("imageModalBackdrop")
            ?.addEventListener(
                "click",
                e => {

                    if (
                        e.target.id ===
                        "imageModalBackdrop"
                    ) {
                        hideImageModal();
                    }

                }
            );


        document.addEventListener(
            "keydown",
            e => {

                if (e.key === "Escape") {
                    hideImageModal();
                }

            }
        );


        window.addEventListener(
            "trashdetectx:languageChanged",
            () => {

                updateClassFilter();
                renderReports();
                updateStats();

            }
        );


        fetchReports();

    }
);