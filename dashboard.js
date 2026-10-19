import { subscribeToConfirmations, subscribeToInvitados } from "./database.js";

const guestDirectoriesByEvent = {
    "miguel-sofia-2026": (window.config && window.config.invitados) || {}
};

const VALID_FILTERS = new Set(["todos", "si", "no", "pendiente"]);

function resolveDashboardEventContext() {
    const externalConfig = window.config || {};
    const eventConfig = externalConfig.event || {};
    const eventIdParam = String(eventConfig.eventIdParam || "eventId").trim() || "eventId";
    const defaultEventId = String(eventConfig.defaultEventId || "miguel-sofia-2026").trim() || "miguel-sofia-2026";
    const params = new URLSearchParams(window.location.search || "");
    const fromQuery = String(params.get(eventIdParam) || "").trim();
    const fromWindow = String(
        window.currentEventId
        || (window.EventContext && window.EventContext.eventId)
        || ""
    ).trim();

    const eventId = fromWindow || fromQuery || defaultEventId;
    const context = { eventId, eventIdParam, defaultEventId };

    window.EventContext = {
        ...(window.EventContext || {}),
        ...context
    };
    window.currentEventId = eventId;

    return context;
}

function getGuestDirectoryForEvent(eventId) {
    return guestDirectoriesByEvent[eventId] || {};
}

function getConfiguredGuestName(id) {
    const guest = window.config && window.config.invitados && window.config.invitados[String(id)];
    return guest && String(guest.nombre || "").trim();
}

function mapInvitadosToDirectory(invitados) {
    const directory = {};

    if (!Array.isArray(invitados)) {
        return directory;
    }

    invitados.forEach((invitado) => {
        if (!invitado || typeof invitado !== "object") return;

        const id = normalizeGuestId(invitado.id || invitado._key);
        const activo = typeof invitado.activo === "undefined" ? true : Boolean(invitado.activo);
        if (!id || !activo) return;

        directory[id] = {
            nombre: getConfiguredGuestName(id) || String(invitado.nombre || "").trim() || "Invitado",
            pases: Math.max(0, Number(invitado.pases) || 0),
            miembros: Array.isArray(invitado.miembros) ? invitado.miembros : []
        };
    });

    return directory;
}

function normalizeGuestId(value) {
    const safeValue = String(value || "").trim();
    return safeValue || "default";
}

function normalizeResponse(response) {
    const safeResponse = String(response || "").trim().toLowerCase();
    if (safeResponse === "si") return "si";
    if (safeResponse === "no") return "no";
    return "pendiente";
}

function normalizeConfirmation(record) {
    const response = normalizeResponse(record && record.respuesta);
    return {
        id: normalizeGuestId(record && (record.id || record._key)),
        nombre: String(record && record.nombre || ""),
        pasesAsignados: Math.max(0, Number(record && record.pasesAsignados) || 0),
        respuesta: response,
        cantidadConfirmada: response === "si"
            ? Math.max(0, Number(record && record.cantidadConfirmada) || 0)
            : 0,
        fechaConfirmacion: Number(record && record.fechaConfirmacion) || null
    };
}

function buildRows(confirmations, guestDirectory) {
    const localGuestDirectory = guestDirectory || {};
    const rows = [];
    const configuredIds = Object.keys(localGuestDirectory);
    const confirmationById = new Map();

    confirmations.forEach((record) => {
        const normalized = normalizeConfirmation(record);
        confirmationById.set(normalized.id, normalized);
    });

    configuredIds.forEach((id) => {
        const guest = localGuestDirectory[id];
        const members = Array.isArray(guest.miembros) ? guest.miembros : [];
        if (members.length > 0) {
            const memberRows = members.map((member, index) => {
                const memberId = id + "-member-" + (index + 1);
                return confirmationById.get(memberId) || {
                    id: memberId,
                    nombre: String(member.nombre || ""),
                    pasesAsignados: Math.max(0, Number(member.pases) || 1),
                    respuesta: "pendiente",
                    cantidadConfirmada: 0,
                    fechaConfirmacion: null
                };
            });
            const confirmedMembers = memberRows.filter((member) => member.respuesta === "si");
            const noMembers = memberRows.filter((member) => member.respuesta === "no");
            const pendingMembers = memberRows.filter((member) => member.respuesta === "pendiente");
            const response = confirmedMembers.length === memberRows.length ? "si"
                : noMembers.length === memberRows.length ? "no"
                : confirmedMembers.length || noMembers.length ? "mixta" : "pendiente";
            rows.push({
                id,
                nombre: String(guest.nombre || ""),
                pasesAsignados: memberRows.reduce((total, member) => total + member.pasesAsignados, 0),
                respuesta: response,
                cantidadConfirmada: confirmedMembers.reduce((total, member) => total + member.cantidadConfirmada, 0),
                fechaConfirmacion: confirmedMembers.length ? Math.max(...confirmedMembers.map((member) => member.fechaConfirmacion || 0)) : null,
                miembros: memberRows,
                integrantes: memberRows.map((member) => member.nombre + " (" + member.pasesAsignados + " pase)"),
                asistenciaConfirmada: confirmedMembers.map((member) => member.nombre + " (" + member.cantidadConfirmada + " pase)"),
                noAsistiran: noMembers.map((member) => member.nombre + " (" + member.pasesAsignados + " pase)"),
                pendientes: pendingMembers.map((member) => member.nombre + " (" + member.pasesAsignados + " pase)")
            });
            return;
        }
        const confirmation = confirmationById.get(id);

        if (!confirmation) {
            rows.push({
                id,
                nombre: String(guest.nombre || ""),
                pasesAsignados: Math.max(0, Number(guest.pases) || 0),
                respuesta: "pendiente",
                cantidadConfirmada: 0,
                fechaConfirmacion: null
            });
            return;
        }

        rows.push({
            ...confirmation,
            nombre: confirmation.nombre || String(guest.nombre || ""),
            pasesAsignados: confirmation.pasesAsignados || Math.max(0, Number(guest.pases) || 0)
        });
    });

    confirmationById.forEach((confirmation, id) => {
        if (configuredIds.includes(id)) return;
        if (configuredIds.some((groupId) => id.indexOf(groupId + "-member-") === 0)) return;
        rows.push(confirmation);
    });

    return rows.sort((a, b) => compareGuestIds(a && a.id, b && b.id));
}

function formatConfirmationDate(value) {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleString("es-GT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatConfirmationDateParts(value) {
    if (!value) {
        return { date: "--", time: "--" };
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return { date: "--", time: "--" };
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    let hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour === 0 ? 12 : hour;

    return {
        date: day + "/" + month + "/" + year,
        time: hour + ":" + minute + " " + period
    };
}

function toResponseLabel(response) {
    if (response === "si") return "confirmado";
    if (response === "no") return "no asistirán";
    if (response === "mixta") return "respuesta mixta";
    return "pendiente";
}

function normalizeSearchText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function formatGuestId(value) {
    const safeValue = String(value || "").trim();
    return "#" + (safeValue || "--");
}

function compareGuestIds(a, b) {
    const idA = String(a == null ? "" : a).trim();
    const idB = String(b == null ? "" : b).trim();
    const numericA = /^\d+$/.test(idA) ? Number(idA) : Number.POSITIVE_INFINITY;
    const numericB = /^\d+$/.test(idB) ? Number(idB) : Number.POSITIVE_INFINITY;

    if (numericA !== numericB) {
        return numericA - numericB;
    }

    return idA.localeCompare(idB, "es", { numeric: true, sensitivity: "base" });
}

function matchesActiveFilter(row, filter) {
    if (filter === "todos") return true;
    if (filter === "si") return Number(row && row.cantidadConfirmada) > 0;
    if (filter === "no") return Array.isArray(row && row.noAsistiran) && row.noAsistiran.length > 0;
    if (filter === "pendiente") return Array.isArray(row && row.pendientes) && row.pendientes.length > 0;
    return false;
}

function applySearchAndFilter(rows, filter, searchTerm) {
    const normalizedSearch = normalizeSearchText(searchTerm);

    return rows.filter((row) => {
        if (!matchesActiveFilter(row, filter)) return false;
        if (!normalizedSearch) return true;
        const normalizedName = normalizeSearchText(row && row.nombre);
        return normalizedName.includes(normalizedSearch);
    });
}

function escapeCsvCell(value) {
    const text = String(value == null ? "" : value);
    return '"' + text.replace(/"/g, '""') + '"';
}

function buildCsvContent(rows) {
    const headers = [
        "Nombre",
        "Pases asignados",
        "Respuesta",
        "Cantidad confirmada",
        "Fecha de confirmación"
    ];

    const lines = [headers.map(escapeCsvCell).join(",")];

    rows.forEach((row) => {
        const responseValue = ["si", "no", "mixta"].includes(row.respuesta) ? row.respuesta : "pendiente";
        const line = [
            row.nombre || "--",
            String(Number(row.pasesAsignados) || 0),
            toResponseLabel(responseValue),
            responseValue === "pendiente" ? "--" : String(Number(row.cantidadConfirmada) || 0),
            responseValue === "pendiente" ? "--" : formatConfirmationDate(row.fechaConfirmacion)
        ];
        lines.push(line.map(escapeCsvCell).join(","));
    });

    return "\uFEFF" + lines.join("\n");
}

function downloadCsvFile(content, eventId) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    const safeEventId = String(eventId || "evento").replace(/[^a-zA-Z0-9_-]/g, "-");

    link.href = url;
    link.download = "confirmaciones-rsvp-" + safeEventId + "-" + dateStamp + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function setSummaryValues(rows) {
    const totalGuests = rows.length;
    const totalYes = rows
        .filter((row) => row && Number(row.cantidadConfirmada) > 0)
        .reduce((acc, row) => acc + (Number(row && row.cantidadConfirmada) || 0), 0);
    const totalNo = rows
        .reduce((acc, row) => acc + (Array.isArray(row && row.noAsistiran) ? row.noAsistiran.length : (row && row.respuesta === "no" ? Number(row.pasesAsignados) || 0 : 0)), 0);
    const totalPending = rows
        .filter((row) => row && row.respuesta === "pendiente")
        .reduce((acc, row) => acc + (Number(row && row.pasesAsignados) || 0), 0);
    const totalConfirmedPeople = rows
        .reduce((acc, row) => acc + (Number(row.cantidadConfirmada) || 0), 0);

    const totalGuestsEl = document.getElementById("summary-total-guests");
    const totalYesEl = document.getElementById("summary-yes");
    const totalNoEl = document.getElementById("summary-no");
    const totalPendingEl = document.getElementById("summary-pending");
    const totalConfirmedPeopleEl = document.getElementById("summary-confirmed-people");

    if (totalGuestsEl) totalGuestsEl.textContent = String(totalGuests);
    if (totalYesEl) totalYesEl.textContent = String(totalYes);
    if (totalNoEl) totalNoEl.textContent = String(totalNo);
    if (totalPendingEl) totalPendingEl.textContent = String(totalPending);
    if (totalConfirmedPeopleEl) totalConfirmedPeopleEl.textContent = String(totalConfirmedPeople);
}

function renderDesktopTable(rows, emptyMessage) {
    const tableBody = document.getElementById("confirmations-table-body");
    if (!tableBody) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        const message = emptyMessage || "No hay confirmaciones para mostrar.";
        tableBody.innerHTML = '<tr><td class="empty-state" colspan="6">' + message + "</td></tr>";
        return;
    }

    tableBody.replaceChildren();

    rows.forEach((row) => {
        const tr = document.createElement("tr");

        const idTd = document.createElement("td");
        idTd.className = "id-cell";
        idTd.textContent = formatGuestId(row.id);

        const nameTd = document.createElement("td");
        nameTd.className = "name-cell";
        nameTd.textContent = row.nombre || "--";

        const assignedTd = document.createElement("td");
        assignedTd.textContent = String(Number(row.pasesAsignados) || 0);

        const responseTd = document.createElement("td");
        const badge = document.createElement("span");
        const responseValue = ["si", "no", "mixta"].includes(row.respuesta) ? row.respuesta : "pendiente";
        badge.className = "status-badge status-badge--" + responseValue;
        badge.textContent = toResponseLabel(responseValue);
        responseTd.appendChild(badge);

        const confirmedTd = document.createElement("td");
        confirmedTd.textContent = responseValue === "pendiente"
            ? "--"
            : String(Number(row.cantidadConfirmada) || 0);

        const dateTd = document.createElement("td");
        dateTd.className = "date-cell";
        const dateParts = responseValue === "pendiente"
            ? { date: "--", time: "--" }
            : formatConfirmationDateParts(row.fechaConfirmacion);
        const dateMain = document.createElement("span");
        dateMain.className = "date-main";
        dateMain.textContent = dateParts.date;
        const dateSub = document.createElement("span");
        dateSub.className = "date-sub";
        dateSub.textContent = dateParts.time;
        dateTd.append(dateMain, dateSub);

        tr.append(idTd, nameTd, assignedTd, responseTd, confirmedTd, dateTd);
        tableBody.appendChild(tr);
    });
}

function renderMobileCards(rows, emptyMessage, activeFilter) {
    const mobileList = document.getElementById("confirmations-mobile-list");
    if (!mobileList) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        const message = emptyMessage || "No hay confirmaciones para mostrar.";
        mobileList.innerHTML = '<div class="mobile-empty-state">' + message + "</div>";
        return;
    }

    mobileList.replaceChildren();

    rows.forEach((row) => {
        const card = document.createElement("article");
        card.className = "confirmation-card";

        const nameEl = document.createElement("h3");
        nameEl.className = "confirmation-card-name";
        const idInline = document.createElement("span");
        idInline.className = "confirmation-card-id-inline";
        idInline.textContent = formatGuestId(row.id);
        const nameMain = document.createElement("span");
        nameMain.className = "confirmation-card-name-main";
        nameMain.textContent = row.nombre || "--";
        nameEl.append(idInline, document.createTextNode(" \u2022 "), nameMain);

        const statusWrap = document.createElement("div");
        statusWrap.className = "confirmation-card-status";

        const responseValue = ["si", "no", "mixta"].includes(row.respuesta) ? row.respuesta : "pendiente";
        const badge = document.createElement("span");
        badge.className = "status-badge status-badge--" + responseValue;
        badge.textContent = toResponseLabel(responseValue);
        statusWrap.appendChild(badge);

        const details = document.createElement("div");
        details.className = "confirmation-card-details";

        const dateParts = responseValue === "pendiente"
            ? { date: "--", time: "--" }
            : formatConfirmationDateParts(row.fechaConfirmacion);

        const lineAssigned = document.createElement("div");
        lineAssigned.className = "confirmation-card-line";
        const assignedLabel = document.createElement("span");
        assignedLabel.textContent = "Pases";
        const assignedValue = document.createElement("strong");
        assignedValue.textContent = String(Number(row.pasesAsignados) || 0);
        lineAssigned.append(assignedLabel, assignedValue);

        const lineConfirmed = document.createElement("div");
        lineConfirmed.className = "confirmation-card-line";
        const confirmedLabel = document.createElement("span");
        confirmedLabel.textContent = "Pases confirmados";
        const confirmedValue = document.createElement("strong");
        confirmedValue.textContent = responseValue === "pendiente"
            ? "--"
            : String(Number(row.cantidadConfirmada) || 0);
        lineConfirmed.append(confirmedLabel, confirmedValue);

        const lineDate = document.createElement("div");
        lineDate.className = "confirmation-card-line";
        const dateLabel = document.createElement("span");
        dateLabel.textContent = "Fecha de confirmación";
        const dateValue = document.createElement("strong");
        dateValue.textContent = dateParts.date;
        lineDate.append(dateLabel, dateValue);

        const lineTime = document.createElement("div");
        lineTime.className = "confirmation-card-line";
        const timeLabel = document.createElement("span");
        timeLabel.textContent = "Hora de confirmación";
        const timeValue = document.createElement("strong");
        timeValue.textContent = dateParts.time;
        lineTime.append(timeLabel, timeValue);

        details.append(lineAssigned, lineConfirmed, lineDate, lineTime);
        if (Array.isArray(row.integrantes)) {
            const lineMembers = document.createElement("div");
            lineMembers.className = "confirmation-card-line confirmation-card-line--stacked";
            const membersLabel = document.createElement("span");
            membersLabel.textContent = "Integrantes";
            const membersValue = document.createElement("strong");
            membersValue.textContent = row.integrantes.join(", ");
            lineMembers.append(membersLabel, membersValue);

            const lineAttendance = document.createElement("div");
            lineAttendance.className = "confirmation-card-line confirmation-card-line--stacked";
            const attendanceLabel = document.createElement("span");
            attendanceLabel.textContent = "Asistencia confirmada";
            const attendanceValue = document.createElement("strong");
            attendanceValue.textContent = row.asistenciaConfirmada.length ? row.asistenciaConfirmada.join(", ") : "--";
            lineAttendance.append(attendanceLabel, attendanceValue);
            if (activeFilter !== "no" && activeFilter !== "pendiente") details.append(lineAttendance);

            function appendMemberStatus(labelText, values) {
                if (!Array.isArray(values) || values.length === 0) return;
                const line = document.createElement("div");
                line.className = "confirmation-card-line confirmation-card-line--stacked";
                const label = document.createElement("span");
                label.textContent = labelText;
                const value = document.createElement("strong");
                value.textContent = values.join(", ");
                line.append(label, value);
                details.appendChild(line);
            }

            if (activeFilter === "todos" || activeFilter === "no") appendMemberStatus("No podrán asistir", row.noAsistiran);
            if (activeFilter === "todos" || activeFilter === "pendiente") appendMemberStatus("Pendientes de Confirmar", row.pendientes);
        }
        card.append(nameEl, statusWrap, details);
        mobileList.appendChild(card);
    });
}

function renderTable(rows, emptyMessage, activeFilter) {
    renderDesktopTable(rows, emptyMessage);
    renderMobileCards(rows, emptyMessage, activeFilter);
}

document.addEventListener("DOMContentLoaded", function () {
    const eventContext = resolveDashboardEventContext();
    const activeEventId = eventContext.eventId;
    const eventBadge = document.getElementById("dashboard-event-current");
    if (eventBadge) {
        eventBadge.textContent = "Evento activo: " + activeEventId;
    }

    const fallbackGuestDirectory = getGuestDirectoryForEvent(activeEventId);
    let remoteGuestDirectory = {};
    let hasRemoteGuestSource = false;
    let confirmationsState = [];
    const searchInput = document.getElementById("dashboard-search");
    const clearButton = document.getElementById("dashboard-clear");
    const exportButton = document.getElementById("dashboard-export");
    const filterButtons = Array.from(document.querySelectorAll(".filter-chip[data-filter]"));
    let allRows = buildRows([], fallbackGuestDirectory);
    let visibleRows = [];
    let activeFilter = "todos";
    let currentSearchTerm = "";

    function syncFilterButtons() {
        filterButtons.forEach((button) => {
            const isActive = button.dataset.filter === activeFilter;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-selected", isActive ? "true" : "false");
        });
    }

    function getEffectiveGuestDirectory() {
        if (hasRemoteGuestSource) {
            const merged = Object.assign({}, fallbackGuestDirectory, remoteGuestDirectory);
            Object.keys(fallbackGuestDirectory).forEach((id) => {
                const fallbackGuest = fallbackGuestDirectory[id];
                const remoteGuest = remoteGuestDirectory[id];
                if (remoteGuest && (!Array.isArray(remoteGuest.miembros) || remoteGuest.miembros.length === 0)
                    && Array.isArray(fallbackGuest.miembros) && fallbackGuest.miembros.length > 0) {
                    merged[id] = Object.assign({}, remoteGuest, { miembros: fallbackGuest.miembros });
                }
            });
            return merged;
        }
        return fallbackGuestDirectory;
    }

    function refreshRowsFromSources() {
        const effectiveGuestDirectory = getEffectiveGuestDirectory();
        const rows = buildRows(confirmationsState, effectiveGuestDirectory);
        updateDashboard(rows);
    }

    function updateTableView() {
        const filteredRows = applySearchAndFilter(allRows, activeFilter, currentSearchTerm);
        const sortedRows = filteredRows.slice().sort((a, b) => {
            const byId = compareGuestIds(a && a.id, b && b.id);
            if (byId !== 0) return byId;
            return String(a && a.nombre || "").localeCompare(String(b && b.nombre || ""), "es");
        });

        visibleRows = sortedRows;
        const hasControlsApplied = activeFilter !== "todos" || normalizeSearchText(currentSearchTerm).length > 0;
        const emptyMessage = hasControlsApplied
            ? "No hay coincidencias con la búsqueda o filtro seleccionado."
            : "No hay confirmaciones para mostrar.";
        renderTable(sortedRows, emptyMessage, activeFilter);
        if (exportButton) exportButton.disabled = visibleRows.length === 0;
    }

    function updateDashboard(rows) {
        allRows = Array.isArray(rows) ? rows : [];
        setSummaryValues(allRows);
        updateTableView();
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            currentSearchTerm = searchInput.value || "";
            updateTableView();
        });
    }

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            currentSearchTerm = "";
            activeFilter = "todos";
            if (searchInput) searchInput.value = "";
            syncFilterButtons();
            updateTableView();
        });
    }

    if (exportButton) {
        exportButton.addEventListener("click", function () {
            if (!visibleRows || visibleRows.length === 0) return;
            const csvContent = buildCsvContent(visibleRows);
            downloadCsvFile(csvContent, activeEventId);
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const nextFilter = String(button.dataset.filter || "");
            if (!VALID_FILTERS.has(nextFilter)) return;
            activeFilter = nextFilter;
            syncFilterButtons();
            updateTableView();
        });
    });

    syncFilterButtons();

    const initialRows = buildRows([], fallbackGuestDirectory);
    updateDashboard(initialRows);

    subscribeToConfirmations(
        activeEventId,
        function (confirmations) {
            confirmationsState = Array.isArray(confirmations) ? confirmations : [];
            refreshRowsFromSources();
        },
        function (error) {
            console.error("Error al sincronizar confirmaciones:", error);
        }
    );

    subscribeToInvitados(
        activeEventId,
        function (invitados) {
            const invitadosArray = Array.isArray(invitados) ? invitados : [];
            hasRemoteGuestSource = invitadosArray.length > 0;
            remoteGuestDirectory = mapInvitadosToDirectory(invitadosArray);
            Object.keys(fallbackGuestDirectory).forEach((id) => {
                const fallbackGuest = fallbackGuestDirectory[id];
                const remoteGuest = remoteGuestDirectory[id];
                if (!remoteGuest) return;
                if (Array.isArray(fallbackGuest.miembros) && fallbackGuest.miembros.length && !remoteGuest.miembros.length) {
                    remoteGuest.miembros = fallbackGuest.miembros;
                }
                if (id === "1") {
                    remoteGuest.nombre = fallbackGuest.nombre;
                    remoteGuest.pases = fallbackGuest.pases;
                }
            });
            refreshRowsFromSources();
        },
        function (error) {
            console.error("Error al sincronizar invitados:", error);
        }
    );
});
