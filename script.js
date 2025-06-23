let user = document.getElementById("currentuser-name").dataset.email;
let userDetails = document.getElementById("currentuser-name").dataset;

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.10/+esm";
const supabase = createClient(
    "https://jhqxioqnviaxdjlauyir.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocXhpb3FudmlheGRqbGF1eWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODQ2MjksImV4cCI6MjA2NDQ2MDYyOX0.DAP7sLjxZCtbS-0G4c4brSda6wL2u9mC3QLBfKBXOUM"
);

const PTO_STATUS = {
    APPROVED: `APPROVED`,
    DENIED: `DENIED`,
    CANCELLED: `CANCELLED`,
    WAITLISTED: `WAITLISTED`,
};

const TIER = {
    RESOLUTIONS1: `Resolutions 1`,
    RESOLUTIONS2: `Resolutions 2`,
    RESOLUTIONS3: `Resolutions 3`,
    DMHS: `DMHS`,
    DSS: `Dedicated Superhost`,
};

const SHIFT_CODE = {
    AM: `AM`,
    PM: `PM`,
    MID: `MID`,
};

const OPERATOR = {
    ADD: `add`,
    REMOVE: `remove`,
};

const TOAST = {
    SUCCESS: "success",
    WARNING: "warning",
    DANGER: "danger",
};

const dialogbox = document.querySelector("#popup-modal");
const dialogboxCloseBtn = document.querySelector("#modal-close");
const btnSendRequest = document.querySelector("#btnSendRequest");

let userData = async (email) => {
    try {
        let reponse = await supabase
            .from("member_list")
            .select("*")
            .eq("email", email);

        if (!reponse.error) {
            return reponse.data[0];
        }
    } catch (error) {}
};

// Constant Variables
const toastDuration = 4 * 1000;
const approvedPtoThreshold = 30;
const numberOfDayAvailableForCancel = 0;
const ptoDaysStartOffset = 4 * 7;
const ptoDaysEndDateOffset = 90;

const ptoOpenStartDate = () => {
    //
    let openStartDate = new Date();
    openStartDate.setDate(
        openStartDate.getDate() + (ptoDaysStartOffset - openStartDate.getDay())
    );
    openStartDate = formateDateyyyymmdd(openStartDate);
    return openStartDate;
};

const ptoOpenEndDate = () => {
    let openEndDate = new Date();
    openEndDate.setDate(
        openEndDate.getDate() + (ptoDaysStartOffset - openEndDate.getDay())
    );
    openEndDate.setDate(openEndDate.getDate() + ptoDaysEndDateOffset);
    openEndDate = formateDateyyyymmdd(openEndDate);
    return openEndDate;
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

    const toastBox = document.querySelector("#popup-modal").open
        ? document.querySelector("#toastBoxInner")
        : document.querySelector("#toastBox");

    toastBox.appendChild(toast);
    setTimeout(() => toast.remove(), toastDuration);
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
    console.log("close btn");
    dialogbox.close();
});
btnSendRequest.addEventListener("click", () => {
    dialogbox.showModal();
    document.querySelector("#inpdate_leavedate").min = ptoOpenStartDate();
    document.querySelector("#inpdate_leavedate").max = ptoOpenEndDate();
    document.querySelector("#inpdate_leavedate").value = "";
    document.querySelector("#textarea_ptoreason").value = "";

    btnModalSendRequest.disabled = false;
});

// Test Calls for Functions

// Needed Functions

function offsideModalClick(modal) {
    const rect = modal.getBoundingClientRect();
    const isInDialog =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

    if (!isInDialog) {
        modal.close();
    }
}

async function pullPTOlist() {
    try {
        let { data, error } = await supabase
            .from("db_pto_request")
            .select("*")
            .eq("recipient", user)
            .order("leave_date", { ascending: false });
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
                    <td class="tbl-transactionID" title='${
                        dbData[i].transaction_id
                    }'>${dbData[i].transaction_id.substr(0, 10)}...</td>
                <td class="tbl-timestamp">${formatDatemmddyyyyhhmmampm(
                    new Date(dbData[i].created_at)
                )}</td>
                <td class="tbl-sender">${dbData[i].sender}</td>
                <td class="tbl-recipient">${dbData[i].recipient}</td>
                <td class="tbl-leave_date">${formatDatemmddyyyy(
                    new Date(dbData[i].leave_date)
                )}</td>
                <td class="status-data">${status.status}
                </td>
                <td class="tbl-actionitems" data-transaction_id="${
                    dbData[i].transaction_id
                }">${status.action}
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
            document.querySelector("#inpdate_leavedate").value <
                ptoOpenStartDate() ||
            document.querySelector("#inpdate_leavedate").value >
                ptoOpenEndDate()
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
        showToast(
            "You are not an identified user, Please contact Workforce Mangement",
            "danger"
        );
    }
    document.querySelector("#currentuser-name").innerHTML = `${user.name}`;
    document.querySelector(
        "#currentuser-skill-shiftcode-site"
    ).innerHTML = `${user.skill} - ${user.shift_code} - ${user.site}`;
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
                  status === "CANCELLED" || status === "DENIED"
                      ? "reinstate"
                      : "cancel"
              }" data-action="${
                  status === "CANCELLED" || status === "DENIED"
                      ? "reinstate"
                      : "cancel"
              }">${
                  status === "CANCELLED" || status === "DENIED"
                      ? "settings_backup_restore"
                      : "delete_forever"
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
    lockDate.setDate(today.getDate() + (numberOfDayAvailableForCancel - 1));

    const inputDate = new Date(leave_date);
    const validator = inputDate - lockDate;
    return validator > 0;
}

function lockDateToReinstate(leave_date) {
    //Checks if the leave is still available to reinstate
    //Leave is avaiable to reinstate if date is not past ${ptoOpenStartDate()}
    // Q: Is date already locked? yes:True, no:False

    let checkdate = new Date(leave_date);
    let paramdate = new Date(ptoOpenStartDate());
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
            let action = e.target.dataset.action;

            if (action === "cancel") {
                console.log("Click Cancel");
                actionCancel(transaction_id);
            } else if (action === "reinstate") {
                actionReinstate(transaction_id);
            } else {
                showToast(
                    `Action not recognized.``<br><br>Contact WFM and send a screenshot of the error`,
                    "danger"
                );
            }
        });
    });
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

        console.log("initial payload", payload);

        let db_pto_request;
        let queryFormSend = await supabase
            .from("db_pto_request")
            .select("*")
            .eq("recipient", payload.recipient)
            .eq("leave_date", payload.leave_date);
        console.log(`ln 607`, queryFormSend);

        if (queryFormSend.data[0] ? true : false) {
            console.log(queryFormSend.data[0]);
            if (
                queryFormSend.data[0].status === PTO_STATUS.CANCELLED ||
                queryFormSend.data[0].status === PTO_STATUS.DENIED
            ) {
                actionReinstate(
                    queryFormSend.data[0].transaction_id,
                    payload.pto_reason
                );
            } else {
                showToast(
                    `You’ve already submitted a PTO request for ${formatDatemmddyyyy(
                        new Date(payload.leave_date)
                    )}. Please review your pending or approved requests before submitting another.`,
                    TOAST.DANGER
                );

                btnModalSendRequest.disabled = false;
                document.getElementById("inpdate_leavedate").value = "";
            }
        } else {
            db_pto_request = payload;
            delete payload.transaction_id;
            delete payload.created_at;

            let allocation = await get_db_allocation(
                db_pto_request,
                OPERATOR.ADD
            );
            let approved_count = await get_db_approval_count(
                db_pto_request,
                OPERATOR.ADD
            );

            if (!(approved_count.approved_count > approvedPtoThreshold)) {
                if (!(allocation.remaining < 0)) {
                    db_pto_request.status = PTO_STATUS.APPROVED;
                    update_db_allocations(allocation);
                    update_db_approved_count(approved_count);
                    update_db_pto_request(db_pto_request);
                    dialogbox.close();
                    showToast(
                        `Your request for ${formatDatemmddyyyy(
                            new Date(db_pto_request.leave_date)
                        )} has been approved. Enjoy your break!.`,
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
                console.log(
                    `The number of your approved leaves has reached the limit (${approvedPtoThreshold}).<br>\nContact your supervisor for assistance.`
                );
            }
        }
    } catch (error) {
        console.error(error);
    }

    console.groupEnd();
}

async function actionReinstate(transaction_id, pto_reason) {
    console.log("actionReinstate");
    pto_reason = pto_reason ? pto_reason : ``;
    console.log(pto_reason);
    try {
        let db_pto_request;
        let queryReinstate = await supabase
            .from("db_pto_request")
            .select(`*`)
            .eq(`transaction_id`, transaction_id);

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
        let approved_count = await get_db_approval_count(
            db_pto_request,
            OPERATOR.ADD
        );

        if (!(approved_count.approved_count > approvedPtoThreshold)) {
            if (!(allocation.remaining < 0)) {
                db_pto_request.status = PTO_STATUS.APPROVED;
                update_db_allocations(allocation);
                update_db_approved_count(approved_count,OPERATOR.ADD);
                update_db_pto_request(db_pto_request);
                showToast(
                        `Your request for ${formatDatemmddyyyy(
                            new Date(db_pto_request.leave_date)
                        )} has been approved. Enjoy your break!.`,
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
                `The number of your approved leaves has reached the limit (${approvedPtoThreshold}).<br>\nContact your supervisor for assistance.`,TOAST.DANGER
            );
        }
    } catch (error) {
        console.error("Error: in actionReinstate");
        console.log(`%c ${error}`, `color:red`);
    }
}

async function actionCancel(transaction_id, cancellation_remarks) {
    console.groupCollapsed(`FN action Cancel`);
    cancellation_remarks = "this is a new cancellation";
    console.log(`actionCancel`, transaction_id);
    try {
        let db_pto_request;
        let queryCancel = await supabase
            .from("db_pto_request")
            .select("*")
            .eq("transaction_id", transaction_id);

        db_pto_request = queryCancel.data[0];

        let allocation = await get_db_allocation(
            db_pto_request,
            OPERATOR.REMOVE
        );
        let approved_count = await get_db_approval_count(
            db_pto_request,
            OPERATOR.REMOVE
        );

        let updated_db_pto_request = await structuredClone(db_pto_request);
        updated_db_pto_request.sender = userDetails.email;
        updated_db_pto_request.cancellation_remarks = cancellation_remarks
            ? cancellation_remarks
            : null;
        updated_db_pto_request.cancelled_on = new Date();
        updated_db_pto_request.status = PTO_STATUS.CANCELLED;
        console.table(db_pto_request);
        console.table(updated_db_pto_request);
        if (db_pto_request.status !== OPERATOR.WAITLISTED) {
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
        console.log(`%c ${error}`, `color:red`);
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

        console.info(`Init db_allocation`, JSON.stringify(db_allocation));
        if (operator === OPERATOR.REMOVE) {
            ++db_allocation.remaining;
            --db_allocation.approved;
        } else if (operator === OPERATOR.ADD) {
            --db_allocation.remaining;
            ++db_allocation.approved;
        }

        console.info(`Endo db_allocation`, JSON.stringify(db_allocation));
        return db_allocation;
    } catch (error) {
        console.error("Error: in update_db_allocation");
        console.log(`%c ${error}`, `color:red`);
        showToast(
            error + `<br><br>Contact WFM and send a screenshot of the error`,
            "danger"
        );
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
        console.info(
            `Init db_approved_count`,
            JSON.stringify(db_approved_count)
        );
        if (operator === OPERATOR.REMOVE) {
            --db_approved_count.approved_count;
        } else if (operator === OPERATOR.ADD) {
            ++db_approved_count.approved_count;
        }
        console.info(
            `Endo db_approved_count`,
            JSON.stringify(db_approved_count)
        );
        return db_approved_count;
    } catch (error) {
        console.log(`%c ${JSON.stringify(error)}`, `color:red`);
        showToast(
            error + `<br><br>Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
}

async function update_db_pto_request(payload) {
    console.groupCollapsed("FN update_db_pto_request");
    //This updates db_pto request database

    console.log("upsertPTO");

    try {
        let query = supabase.from("db_pto_request").upsert(payload).select();

        if (payload.transaction_id) {
            query = query.eq("transaction_id", payload.transaction_id);
        }

        let resUpsert = await query;
        tableUpdate();
        console.log(resUpsert);
    } catch (error) {
        console.log(`%c ${JSON.stringify(error)}`, `color:red`);
        showToast(
            error + `<br><br>Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
    console.groupEnd();
}

async function update_db_allocations(payload) {
    //This updates db_allocation
    try {
        let { data, error } = await supabase
            .from(`db_allocation`)
            .upsert(payload)
            .eq("id", payload.id)
            .select(`*`);

        return data;
    } catch (error) {
        console.log(`%c ${JSON.stringify(error)}`, `color:red`);
        showToast(
            error + `<br><br>Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
}

async function update_db_approved_count(payload) {
    console.groupCollapsed(`update_db_approved_count`);
    try {
        let { data, error } = await supabase
            .from(`db_approved_count`)
            .upsert(payload)
            .eq("id", payload.id)
            .select(`*`);

        console.log(`update_approved_count`, data);
        return data;
    } catch (error) {
        console.log(`%c ${JSON.stringify(error)}`, `color:red`);
    }
    console.groupEnd();
}

//Init
tableUpdate();
updateUserDetails();
// actionFormSend();
