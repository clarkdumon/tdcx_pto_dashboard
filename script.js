// Configuation and Constants
// This file contains all the configuration and constants used in the PTO system

const CONFIG = {
    TOAST_DURATION: 2000, // Duration for toast notifications in milliseconds
    APPROVED_PTO_THRESHOLD: 30, // Maximum number of approved PTOs allowed
    NUMBER_OF_DAYS_AVAILABLE_FOR_CANCEL: 2, // Number of days before which PTO can be cancelled
    PTO_DAYS_START_OFFSET: 4 * 7, // Offset for the start date of PTO days
    PTO_DAYS_END_DATE_OFFSET: 90, // Offset for the end date of PTO

    PTO_OPEN_START_DATE: () => {
        // Calculate the start date for PTO requests
        let openStartDate = new Date();
        openStartDate.setDate(openStartDate.getDate() + (CONFIG.PTO_DAYS_START_OFFSET - openStartDate.getDay()));
        return formateDateyyyymmdd(openStartDate);
    },

    PTO_OPEN_END_DATE: () => {
        // Calculate the end date for PTO requests
        let openEndDate = new Date();
        openEndDate.setDate(openEndDate.getDate() + (CONFIG.PTO_DAYS_START_OFFSET - openEndDate.getDay()));
        openEndDate.setDate(openEndDate.getDate() + CONFIG.PTO_DAYS_END_DATE_OFFSET);
        return formateDateyyyymmdd(openEndDate);
    },
};

// PTO Status Codes
// These constants are used to define the status of PTO requests
// They are used to track the state of PTO requests in the system
// The status can be APPROVED, DENIED, CANCELLED, or WAITLISTED
// These constants are used in the database and in the UI to display the status of PTO requests
const PTO_STATUS = Object.freeze({
    APPROVED: `APPROVED`,
    DENIED: `DENIED`,
    CANCELLED: `CANCELLED`,
    WAITLISTED: `WAITLISTED`,
});

// Skill Codes
// These constants are used to define the skill codes for different skills
const TIER = Object.freeze({
    RESOLUTIONS1: `Resolutions 1`,
    RESOLUTIONS2: `Resolutions 2`,
    RESOLUTIONS3: `Resolutions 3`,
    DMHS: `DMHS`,
    DSS: `Dedicated Superhost`,
});

// Shift Codes
// These constants are used to define the shift codes for different shifts
const SHIFT_CODE = Object.freeze({
    AM: `AM`,
    PM: `PM`,
    MID: `MID`,
});

// Operator Constants
// These constants are used to define the operations for adding or removing PTO requests
// They are used in the context of updating allocations and approval counts in the database
const OPERATOR = Object.freeze({
    ADD: `add`,
    REMOVE: `remove`,
});

const TOAST = Object.freeze({
    SUCCESS: "success",
    WARNING: "warning",
    DANGER: "danger",
});

const TOAST_CALLS = {
    SUCCESS: (message) => showToast(message, TOAST.SUCCESS),
    WARNING: (message) => showToast(message, TOAST.WARNING),
    DANGER: (message) => showToast(message, TOAST.DANGER),
};

let user = document.getElementById("currentuser-name").dataset.email;
let userDetails = await document.getElementById("currentuser-name").dataset;
const popNotification = document.querySelector("#popNotification");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.10/+esm";
const supabase = createClient(
    "https://jhqxioqnviaxdjlauyir.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocXhpb3FudmlheGRqbGF1eWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODQ2MjksImV4cCI6MjA2NDQ2MDYyOX0.DAP7sLjxZCtbS-0G4c4brSda6wL2u9mC3QLBfKBXOUM"
);

const dialogbox = document.querySelector("#popup-modal");
const dialogboxCloseBtn = document.querySelector("#modal-close");
const btnSendRequest = document.querySelector("#btnSendRequest");

let userData = async (email) => {
    try {
        let reponse = await supabase.from("member_list").select("*").eq("email", email);

        if (!reponse.error) {
            return reponse.data[0];
        }
    } catch (error) {}
};

// Toast Notification Javascript
function showToast(message, status) {
    const icons = {
        success: "check_circle",
        danger: "error",
        warning: "warning",
    };
    const toast = document.createElement("div");
    toast.className = `toast ${status}`;
    toast.innerHTML = `<span class="material-symbols-rounded">${icons[status]}</span> ${message}`;

    const toastBox = document.querySelector("#popup-modal").open ? document.querySelector("#toastBoxInner") : document.querySelector("#toastBox");

    toastBox.appendChild(toast);
    setTimeout(() => toast.remove(), CONFIG.TOAST_DURATION);
}
// Toast Notification Javascript End

// Date Formatter : mm/dd/yyyy hh:mm:ss AM/PM
function formatDatemmddyyyyhhmmampm(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = String(hours).padStart(2, "0");

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}
// Date Formatter : mm/dd/yyyy
function formatDatemmddyyyy(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
}
// Date Formatter : yyyy-mm-dd
function formateDateyyyymmdd(datevalue) {
    let month = (datevalue.getMonth() + 1).toString().padStart(2, "0");
    let date = datevalue.getDate().toString().padStart(2, "0");
    let year = datevalue.getFullYear();
    return `${year}-${month}-${date}`;
}
//Date Formatter End

// const inpLeaveDate = document.querySelector("#inpdate_leavedate");

// Event Listeners
dialogbox.addEventListener("click", (event) => {
    offsideModalClick(dialogbox);
});

dialogboxCloseBtn.addEventListener("click", (event) => {
    dialogbox.close();
});

// Test Calls for Functions

// Needed Functions

function offsideModalClick(modal) {
    const rect = modal.getBoundingClientRect();
    const isInDialog = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;

    if (!isInDialog) {
        modal.close();
    }
}

async function pullPTOlist() {
    try {
        let { data, error } = await supabase.from("db_pto_request").select("*").eq("recipient", user).order("leave_date", { ascending: false });
        return data;
    } catch (error) {}
}

async function tableUpdate() {
    let tableWhole = document.querySelector("#requested_pto_data");
    let tableData = document.querySelector("#ptotablebody");
    let dbData = await pullPTOlist();
    let table = ``;

    for (let i = 0; i < dbData.length; i++) {
        let status = tablestatusUpdate(dbData[i].status, dbData[i].leave_date);
        table += `<tr>
                    <td class="tbl-transactionID" title='${dbData[i].transaction_id}'>${dbData[i].transaction_id.substr(0, 10)}...</td>
                <td class="tbl-timestamp">${formatDatemmddyyyyhhmmampm(new Date(dbData[i].created_at))}</td>
                <td class="tbl-sender">${dbData[i].sender}</td>
                <td class="tbl-recipient">${dbData[i].recipient}</td>
                <td class="tbl-leave_date">${formatDatemmddyyyy(new Date(dbData[i].leave_date))}</td>
                <td class="status-data">${status.status}
                </td>
                <td class="tbl-actionitems" data-transaction_id="${dbData[i].transaction_id}" data-leave_date="${dbData[i].leave_date}">${
            status.action
        }
                </td></tr>`;
    }
    tableData.innerHTML = table;
    actionItemListener();
}

// Send PTO with Duplicate Checker
const btnModalSendRequest = document.querySelector("#btn_send_request");
btnModalSendRequest.addEventListener("click", () => {
    btnModalSendRequest.disabled = true;
    if (!formChecker()) {
        actionFormSend();
    }
});

function formChecker() {
    if (!isValidDate(document.querySelector("#inpdate_leavedate").value)) {
        alert("Please enter a valid date.");
        document.querySelector("#inpdate_leavedate").value = null;
        btnModalSendRequest.disabled = false;
        return true;
    } else {
        if (
            document.querySelector("#inpdate_leavedate").value < CONFIG.PTO_OPEN_START_DATE() ||
            document.querySelector("#inpdate_leavedate").value > CONFIG.PTO_OPEN_END_DATE()
        ) {
            alert("Please enter dates that is currently open");
            document.querySelector("#inpdate_leavedate").value = null;
            btnModalSendRequest.disabled = false;
            return true;
        }
        return false;
    }
}

function isValidDate(value) {
    return value && !isNaN(new Date(value).getTime());
}

async function updateUserDetails() {
    let user = document.getElementById("currentuser-name").dataset;
    try {
        let userDetails = await userData(user.email);
        Object.keys(userDetails).forEach((element) => {
            user[element] = userDetails[element];
        });
    } catch (error) {
        btnSendRequest.disabled = true;
        showToast("You are not an identified user, Please contact Workforce Mangement", "danger");
    }
    document.querySelector("#currentuser-name").innerHTML = `${user.name}`;
    document.querySelector("#currentuser-skill-shiftcode-site").innerHTML = `${user.skill} - ${user.shift_code} - ${user.site}`;
    document.querySelector("#currentuser-role").innerHTML = `${user.role}`;
}

function tablestatusUpdate(status, leave_date) {
    const icons = {
        APPROVED: ["approved", "check_circle", "Approved"],
        DENIED: ["denied", "cancel", "Denied"],
        CANCELLED: ["cancelled", "do_not_disturb_on", "Cancelled"],
        WAITLISTED: ["waitlisted", "schedule", "Waitlisted"],
    };

    if (status === "APPROVED" || status === "WAITLISTED") {
        icons[status].push(lockDateforCancellation(leave_date));
    } else {
        icons[status].push(lockDateToReinstate(leave_date));
    }

    const [className, icon, label, showAction] = icons[status] || [];

    return {
        status: `<span class="status ${className}"><span class="material-symbols-rounded status-icon">${icon}</span><span>${label}</span></span>`,
        action: showAction
            ? `<span class="material-symbols-rounded action-icon ${
                  status === "CANCELLED" || status === "DENIED" ? "reinstate" : "cancel"
              }" data-action="${status === "CANCELLED" || status === "DENIED" ? "reinstate" : "cancel"}">${
                  status === "CANCELLED" || status === "DENIED" ? "settings_backup_restore" : "delete_forever"
              }</span>`
            : "",
    };
}

function lockDateforCancellation(leave_date) {
    //Checks if the leave is still available to cancellation
    //Cancellation of PTO should ${numberOfDayAvailableForCancel} prior
    //Ex.
    //  today = 2025-06-23
    //  dates that can be retracted = 2025-06-25 onwards
    //  dates below 2025-06-24 cannot be cancelled or reinstated
    //
    // Q: Is date already locked? yes:True, no:False
    const today = new Date();
    const dayOfWeek = today.getDay();
    const lockDate = new Date(formateDateyyyymmdd(today));
    lockDate.setDate(today.getDate() + (CONFIG.NUMBER_OF_DAYS_AVAILABLE_FOR_CANCEL - 1));

    const inputDate = new Date(leave_date);
    const validator = inputDate - lockDate;
    return validator > 0;
}

function lockDateToReinstate(leave_date) {
    //Checks if the leave is still available to reinstate
    //Leave is avaiable to reinstate if date is not past ${ptoOpenStartDate()}
    // Q: Is date already locked? yes:True, no:False

    let checkdate = new Date(leave_date);
    let paramdate = new Date(CONFIG.PTO_OPEN_START_DATE());
    let validator = checkdate - paramdate;
    return validator >= 0;
}

// ACTION ITEM LISTENER

function actionItemListener() {
    //Adds Event Listener on all action items
    let c = document.querySelectorAll(".tbl-actionitems span");
    c.forEach((actionitem) => {
        actionitem.addEventListener("click", (e) => {
            e.target.style.display = "none";
            let transaction_id = e.target.parentElement.dataset.transaction_id;
            let leave_date = e.target.parentElement.dataset.leave_date;
            let action = e.target.dataset.action;

            if (action === "cancel") {
                cancelPrompt(transaction_id, leave_date, e.target);
            } else if (action === "reinstate") {
                actionReinstate(transaction_id);
            } else {
                showToast(`Action not recognized.``<br><br>Contact WFM and send a screenshot of the error`, "danger");
            }
        });
    });
}

popNotification.addEventListener("close", () => {
    TOAST_CALLS.DANGER(`Action Cancelled`);
    let actionItem = document.querySelectorAll(".tbl-actionitems span");

    actionItem.forEach((action) => {
        action.style.display = "inline-block";
    });
});

async function cancelPrompt(transaction_id, leave_date, actionItem) {
    popNotification.innerHTML = `<div id="popNotificationError">
    </div>
    <div id="prompt">
      <div id="prompt-info">
        <h4>Are you sure you want to cancel this request for ${leave_date}?</h4>
        <label for="prompt_cancellation_remarks">Enter reason for cancellation</label>
        <textarea name="" id="prompt_cancellation_remarks"></textarea>
      </div>
      <div id="prompt-buttons">
        <button id="prompt-yes">Yes</button>
        <button id="prompt-no">No</button>
      </div>
      
    </div>`;
    popNotification.showModal();

    console.log(transaction_id, leave_date, actionItem);
    let yes = document.querySelector("#prompt-yes");
    let no = document.querySelector("#prompt-no");

    yes.addEventListener("click", () => {
        yes.disabled = true;
        if (document.querySelector("#prompt_cancellation_remarks").value === "") {
            popNotification.close();
            TOAST_CALLS.DANGER(`Action Cancelled: Please provide a reason for cancellation.`);
            actionItem.style.display = "inline-block";
            return;
        } else {
            actionCancel(transaction_id, document.querySelector("#prompt_cancellation_remarks").value);
            popNotification.close();
        }
        console.log(`%c Yes clicked`, `color:green`);
    });
    no.addEventListener("click", () => {
        no.disabled = true;
        console.log(`%c No clicked`, `color:green`);
        actionItem.style.display = "inline-block";
        popNotification.close();
        // TOAST_CALLS.DANGER(`Action Cancelled`);

        setTimeout(() => {
            no.disabled = false;
        }, 3000);
        tableUpdate();
    });

    // actionCancel(transaction_id);
}

async function actionFormSend() {
    console.group("actionFormSend");

    try {
        // let userDetails = await userData();
        let payload = {
            cancellation_remarks: null,
            cancelled_on: null,
            created_at: null,
            leave_date: document.querySelector("#inpdate_leavedate").value,
            pto_reason: document.querySelector("#textarea_ptoreason").value,
            recipient: userDetails.email,
            sender: userDetails.email,
            shift_code: userDetails.shift_code,
            site: userDetails.site,
            skill: userDetails.skill,
            status: null,
            status_remarks: null,
            transaction_id: null,
        };

        let db_pto_request;
        let queryFormSend = await supabase.from("db_pto_request").select("*").eq("recipient", payload.recipient).eq("leave_date", payload.leave_date);

        if (queryFormSend.data[0] ? true : false) {
            if (queryFormSend.data[0].status === PTO_STATUS.CANCELLED || queryFormSend.data[0].status === PTO_STATUS.DENIED) {
                actionReinstate(queryFormSend.data[0].transaction_id, payload.pto_reason);
            } else {
                TOAST_CALLS.DANGER(
                    `You’ve already submitted a PTO request for ${formatDatemmddyyyy(
                        new Date(payload.leave_date)
                    )}. Please review your pending or approved requests before submitting another.`
                );

                btnModalSendRequest.disabled = false;
                document.getElementById("inpdate_leavedate").value = "";
            }
        } else {
            db_pto_request = payload;
            delete payload.transaction_id;
            delete payload.created_at;

            let allocation = await get_db_allocation(db_pto_request, OPERATOR.ADD);
            let approved_count = await get_db_approval_count(db_pto_request, OPERATOR.ADD);

            if (!(approved_count.approved_count > CONFIG.APPROVED_PTO_THRESHOLD)) {
                if (!(allocation.remaining < 0)) {
                    db_pto_request.status = PTO_STATUS.APPROVED;
                    update_db_allocations(allocation);
                    update_db_approved_count(approved_count);
                    update_db_pto_request(db_pto_request);
                    dialogbox.close();
                    TOAST_CALLS.SUCCESS(
                        `Your request for ${formatDatemmddyyyy(
                            new Date(db_pto_request.leave_date)
                        )} has been successfully submitted. Enjoy your break!.`
                    );
                } else {
                    db_pto_request.status = PTO_STATUS.WAITLISTED;
                    update_db_pto_request(db_pto_request);
                    dialogbox.close();
                    showToast(
                        `You have been added to the waitlist and will be notified if an allocation becomes avaiable for ${formatDatemmddyyyy(
                            new Date(db_pto_request.leave_date)
                        )}.`,
                        TOAST.WARNING
                    );
                }
            } else {
                db_pto_request.status = PTO_STATUS.DENIED;
                update_db_pto_request(db_pto_request);
                dialogbox.close();
                showToast(
                    `The number of your approved leaves has reached the limit (${CONFIG.APPROVED_PTO_THRESHOLD}).<br>\nContact your supervisor for assistance.`,
                    TOAST.DANGER
                );
            }
        }
    } catch (error) {
        console.error(error);
    }

    console.groupEnd();
}

async function actionReinstate(transaction_id, pto_reason) {
    pto_reason = pto_reason ? pto_reason : ``;
    try {
        let db_pto_request;
        let queryReinstate = await supabase.from("db_pto_request").select(`*`).eq(`transaction_id`, transaction_id);

        db_pto_request = queryReinstate.data[0];
        db_pto_request.pto_reason += `-${db_pto_request.created_at}\n ${pto_reason}-`;
        db_pto_request.skill = userDetails.skill;
        db_pto_request.shift_code = userDetails.shift_code;
        db_pto_request.site = userDetails.site;
        db_pto_request.cancelled_on = null;
        db_pto_request.cancellation_remarks = null;
        db_pto_request.sender = userDetails.email;
        db_pto_request.created_at = new Date();

        let allocation = await get_db_allocation(db_pto_request, OPERATOR.ADD);
        let approved_count = await get_db_approval_count(db_pto_request, OPERATOR.ADD);

        if (!(approved_count.approved_count > CONFIG.APPROVED_PTO_THRESHOLD)) {
            if (!(allocation.remaining < 0)) {
                db_pto_request.status = PTO_STATUS.APPROVED;
                update_db_allocations(allocation);
                update_db_approved_count(approved_count, OPERATOR.ADD);
                update_db_pto_request(db_pto_request);
                showToast(
                    `Your request for ${formatDatemmddyyyy(new Date(db_pto_request.leave_date))} has been approved. Enjoy your break!.`,
                    TOAST.SUCCESS
                );
            } else {
                db_pto_request.status = PTO_STATUS.WAITLISTED;
                update_db_pto_request(db_pto_request);
                dialogbox.close();
                showToast(
                    `You have been added to the waitlist and will be notified if an allocation becomes avaiable for ${formatDatemmddyyyy(
                        new Date(db_pto_request.leave_date)
                    )}.`,
                    TOAST.WARNING
                );
            }
        } else {
            db_pto_request.status = PTO_STATUS.DENIED;
            update_db_pto_request(db_pto_request);
            dialogbox.close();
            showToast(
                `The number of your approved leaves has reached the limit (${CONFIG.APPROVED_PTO_THRESHOLD}).<br>\nContact your supervisor for assistance.`,
                TOAST.DANGER
            );
        }
    } catch (error) {
        console.error("Error: in actionReinstate");
        console.error(`%c ${error}`, `color:red`);
    }
}

async function actionCancel(transaction_id, cancellation_remarks) {
    console.groupCollapsed(`FN action Cancel`);
    try {
        let db_pto_request;
        let queryCancel = await supabase.from("db_pto_request").select("*").eq("transaction_id", transaction_id);

        db_pto_request = queryCancel.data[0];

        let allocation = await get_db_allocation(db_pto_request, OPERATOR.REMOVE);
        let approved_count = await get_db_approval_count(db_pto_request, OPERATOR.REMOVE);

        let updated_db_pto_request = await structuredClone(db_pto_request);
        updated_db_pto_request.sender = userDetails.email;
        updated_db_pto_request.cancellation_remarks = cancellation_remarks ? cancellation_remarks : null;
        updated_db_pto_request.cancelled_on = new Date();
        updated_db_pto_request.status = PTO_STATUS.CANCELLED;
        console.log(db_pto_request.status);
        if (db_pto_request.status !== PTO_STATUS.WAITLISTED) {
            update_db_allocations(allocation);
            update_db_approved_count(approved_count);
        }
        update_db_pto_request(updated_db_pto_request);

        showToast(
            `Your PTO request has been successfully cancelled for ${formatDatemmddyyyy(
                new Date(updated_db_pto_request.leave_date)
            )}. The allocation has been released and your record has been updated.`,
            TOAST.SUCCESS
        );

        tableUpdate();
    } catch (error) {
        console.error("Error: in actionCancel");
        console.error(`%c ${error}`, `color:red`);
    }
    console.groupEnd();
}

async function get_db_allocation(payload, operator) {
    try {
        let db_allocation;
        let query = await supabase
            .from("db_allocation")
            .select("*")
            .eq("skill", payload.skill)
            .eq("shift_code", payload.shift_code)
            .eq("site", payload.site)
            .eq("date", payload.leave_date);

        db_allocation = query.data[0];

        if (operator === OPERATOR.REMOVE) {
            ++db_allocation.remaining;
            --db_allocation.approved;
        } else if (operator === OPERATOR.ADD) {
            --db_allocation.remaining;
            ++db_allocation.approved;
        }
        console.info(`--`, db_allocation);
        return db_allocation;
    } catch (error) {
        console.error("Error: in update_db_allocation");
        console.error(`%c ${error}`, `color:red`);
        showToast(error + `<br><br>Contact WFM and send a screenshot of the error`, "danger");
    }
}

async function get_db_approval_count(payload, operator) {
    let emptyShell = {
        email: payload.recipient,
        year: new Date(payload.leave_date).getFullYear(),
        approved_count: 0,
    };
    try {
        let db_approved_count;
        let query = await supabase
            .from("db_approved_count")
            .select("*")
            .eq("email", payload.recipient)
            .eq("year", new Date(payload.leave_date).getFullYear());

        db_approved_count = query.data[0] ? query.data[0] : emptyShell;
        if (operator === OPERATOR.REMOVE) {
            --db_approved_count.approved_count;
        } else if (operator === OPERATOR.ADD) {
            ++db_approved_count.approved_count;
        }
        return db_approved_count;
    } catch (error) {
        console.log(`%c ${JSON.stringify(error)}`, `color:red`);
        showToast(error + `<br><br>Contact WFM and send a screenshot of the error`, "danger");
    }
}

async function update_db_pto_request(payload) {
    //This updates db_pto request database

    try {
        let query = supabase.from("db_pto_request").upsert(payload).select();

        if (payload.transaction_id) {
            query = query.eq("transaction_id", payload.transaction_id);
        }

        let resUpsert = await query;
        tableUpdate();
    } catch (error) {
        console.error(`%c ${JSON.stringify(error)}`, `color:red`);
        showToast(error + `<br><br>Contact WFM and send a screenshot of the error`, "danger");
    }
}

async function update_db_allocations(payload) {
    //This updates db_allocation
    try {
        let { data, error } = await supabase.from(`db_allocation`).upsert(payload).eq("id", payload.id).select(`*`);

        return data;
    } catch (error) {
        console.error(`%c ${JSON.stringify(error)}`, `color:red`);
        showToast(error + `<br><br>Contact WFM and send a screenshot of the error`, "danger");
    }
}

async function update_db_approved_count(payload) {
    console.groupCollapsed(`update_db_approved_count`);
    try {
        let { data, error } = await supabase.from(`db_approved_count`).upsert(payload).eq("id", payload.id).select(`*`);

        return data;
    } catch (error) {
        console.error(`%c ${JSON.stringify(error)}`, `color:red`);
    }
    console.groupEnd();
}

btnSendRequest.addEventListener("click", () => {
    dialogbox.showModal();
    document.querySelector("#inpdate_leavedate").min = CONFIG.PTO_OPEN_START_DATE();
    document.querySelector("#inpdate_leavedate").max = CONFIG.PTO_OPEN_END_DATE();
    document.querySelector("#inpdate_leavedate").value = "";
    document.querySelector("#textarea_ptoreason").value = "";

    btnModalSendRequest.disabled = false;

    if (document.getElementById("currentuser-name").dataset.role !== "Support Ambassador") {
        document.querySelector("div#recipientData input").focus();
    } else {
        document.querySelector("#inpdate_leavedate").focus();
    }
});

// dialogbox.showModal();

// popNotification.showModal();
//Init

// document.addEventListener("DOMContentLoaded", () => {
//     tableUpdate();
//     updateUserDetails();
//     console.log("DOM fully loaded and parsed");
// });

// let x = document.querySelector("#sidebar-menu");
// let m = x.children;

// for (let i = 0; i < m.length; i++) {
//     m[i].addEventListener("click", () => {
//         console.log(m[i].id);
//     });
// }

//
initializeApp();
async function initializeApp() {
    await updateUserDetails();
    await tableUpdate();
    // await updateAllocationsTable();
    console.log("App initialization complete");
    await initListener();
    roleCheck();
}

// getDataForAllocationsPage();
async function getDataForAllocationsPage() {
    let response = await supabase
        .from("db_allocation")
        .select("*")
        .gte("date", CONFIG.PTO_OPEN_START_DATE())
        .lte("date", CONFIG.PTO_OPEN_END_DATE())
        .eq("skill", document.getElementById("currentuser-name").dataset.skill)
        .eq("shift_code", document.getElementById("currentuser-name").dataset.shift_code)
        .eq("site", document.getElementById("currentuser-name").dataset.site)
        .order("date", { ascending: true });

    return response.data;
}

async function updateAllocationsTable() {
    let allocation = await getDataForAllocationsPage();
    let tablebody = ``;
    allocation.forEach((response) => {
        tablebody += `
                <tr>
                    <td>${formatDatemmddyyyy(new Date(response.date))}</td>
                    <td>${response.allocation}</td>
                    <td>${response.approved}</td>
                    <td>${response.remaining}</td>
                </tr>`;
    });
    document.querySelector("#allocationtablebody").innerHTML = tablebody;
}

async function clickedLink(event) {
    // await updateAllocationsTable();
    document.querySelectorAll(".sidebarmenu").forEach((page) => {
        page.classList.remove("active");
        if (page.innerHTML == event.target.innerHTML) {
            page.classList.add("active");
            tableUpdater(event.target.innerHTML);
        }
    });

    document.querySelectorAll(".contentarea").forEach((content) => {
        content.classList.remove("hidden");
        if (content.id != `contentarea-${String(event.target.innerHTML).toLocaleLowerCase()}`) {
            content.classList.add("hidden");
        }
    });
}

function initListener() {
    document.querySelectorAll(".sidebarmenu").forEach((sidebar) => {
        sidebar.addEventListener("click", clickedLink);
    });
}

async function tableUpdater(sidebar) {
    if (sidebar === "Dashboard") {
        await tableUpdate();
    } else {
        document.querySelector("#allocation--title").innerHTML = `${document.getElementById("currentuser-name").dataset.skill} - ${
            document.getElementById("currentuser-name").dataset.shift_code
        } - ${document.getElementById("currentuser-name").dataset.site}`;
        await updateAllocationsTable();
    }
}

function roleCheck() {
    //Tag UserData
    let userData = document.getElementById("currentuser-name").dataset;
    let ptoFormRecipientData = document.querySelector("div#recipientData input");
    let ptoFormLeaveDetails = document.querySelector("#leaveDetails");
    let recipientList = document.getElementById("recipientList");
    //IF r = Support Ambassador => Disable #recipientData and put user details in the input box
    if (userData.role === `Support Ambassador`) {
        ptoFormLeaveDetails.style.display = null;
        recipientList.style.display ='none'
        ptoFormRecipientData.disabled = true;
        ptoFormRecipientData.value = userData.name;
        ptoFormRecipientData.dataset.email = userData.email;
        document.querySelector("#inpdate_leavedate").value = null;
        document.querySelector("#textarea_ptoreason").value = null;
    } else {
        getAgentList();
        ptoFormRecipientData.value = null;
        ptoFormRecipientData.disabled = false;
        ptoFormLeaveDetails.style.display = "none";
    }
    ptoFormRecipientData.addEventListener("keyup", generateRecipientList);
    ptoFormRecipientData.addEventListener("focus", focusRecipient);
}

async function getAgentList() {
    let userData = document.getElementById("currentuser-name").dataset;
    let recipientList = document.getElementById("recipientList");
    try {
        let agentList = await supabase
            .from("member_list")
            .select("*")
            .eq("role", "Support Ambassador")
            .or(`team_lead.eq."${userData.name}",operations_manager.eq."${userData.name}"`);

        recipientList.dataset.agentList = JSON.stringify(agentList.data);
        console.log(agentList);
    } catch (error) {
        console.log(error);
    }
}

function generateRecipientList(event) {
    updateRecipientList(event.target.value);
}

function updateRecipientList(searchValue) {
    let recipientList = document.getElementById("recipientList");
    recipientList.innerHTML = "";
    let dataSet = recipientList.dataset.agentList ? JSON.parse(recipientList.dataset.agentList) : [];

    let list = dataSet.filter((agent) => {
        let name = String(agent.name).toLocaleLowerCase();
        return name.includes(searchValue.toLocaleLowerCase());
    });

    list.forEach((agent) => {
        let li = document.createElement("li");
        li.classList.add("recipientNames");
        li.addEventListener("click", agentSelect);
        li.dataset.name = agent.name;
        li.dataset.email = agent.email;
        li.innerHTML = agent.name;

        recipientList.appendChild(li);
    });
}

function agentSelect(event) {
    let recipientList = document.getElementById("recipientList");
    let ptoFormRecipientData = document.querySelector("div#recipientData input");
    let ptoFormLeaveDetails = document.querySelector("#leaveDetails");

    recipientList.style.display = "none";
    recipientList.innerHTML = "";
    ptoFormRecipientData.value = event.target.dataset.name;
    ptoFormRecipientData.dataset.email = event.target.dataset.email;
    ptoFormLeaveDetails.style.display = null;
}

function focusRecipient(event) {
    let ptoFormRecipientData = document.querySelector("div#recipientData input");
    let recipientList = document.getElementById("recipientList");
    let ptoFormLeaveDetails = document.querySelector("#leaveDetails");
    ptoFormLeaveDetails.style.display = "none";
    ptoFormRecipientData.value = "";
    delete ptoFormRecipientData.dataset.email;
    updateRecipientList("");
    recipientList.style.display = null;
    console.log("cleared");
}
