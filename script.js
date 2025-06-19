let user = document.getElementById("currentuser-name").dataset.email;
let userDetails = document.getElementById("currentuser-name").dataset;

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
const toastDuration = 5 * 1000;
const approvedPtoThreshold = 30;
const ptoOpenStartDate = () => {
    let openStartDate = new Date();
    openStartDate.setDate(openStartDate.getDate() + 28);
    openStartDate = formateDateyyyymmdd(openStartDate);
    return openStartDate;
};
const ptoOpenEndDate = () => {
    let openEndDate = new Date();
    openEndDate.setDate(openEndDate.getDate() + 28 + 90);
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

async function pullmemberlist() {
    localStorage.clear();
    let { data, error } = await supabase.from("member_list").select("*");
    localStorage.setItem("memberlist", JSON.stringify(data));
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
        let status = tableStatus(dbData[i].status);
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
                <td class="status-data">
                  ${status.status}
                </td>
                <td class="tbl-actionitems" data-transaction_id="${
                    dbData[i].transaction_id
                }">
                  ${status.action}
                </td>
              </tr>`;
    }
    tableData.innerHTML = table;

    actionItemListener();
}

function tableStatus(status) {
    let detail = {};
    switch (status) {
        case "APPROVED":
            detail.status = `<span class="status approved">
                                <span class="material-symbols-rounded status-icon">check_circle</span>
                                <span>Approved</span>
                            </span>`;
            detail.action = `<span class="material-symbols-rounded action-icon cancel" data-action="cancel">delete_forever</span>`;
            return detail;
            break;
        case "DENIED":
            detail.status = `<span class="status denied">
                                <span class="material-symbols-rounded status-icon">cancel</span>
                                <span>Denied</span>
                            </span>`;
            detail.action = ``;
            return detail;
            break;
        case "CANCELLED":
            detail.status = `<span class="status cancelled">
                                <span class="material-symbols-rounded status-icon">do_not_disturb_on</span>
                                <span>Cancelled</span>
                            </span>`;
            detail.action = `<span class="material-symbols-rounded action-icon reinstate" data-action="reinstate" title="reinstate">settings_backup_restore</span>`;
            return detail;
            break;
        case "WAITLISTED":
            detail.status = `<span class="status waitlisted">
                                <span class="material-symbols-rounded status-icon">schedule</span>
                                <span>Waitlisted</span>
                            </span>`;
            detail.action = `<span class="material-symbols-rounded action-icon cancel"  data-action="cancel">delete_forever</span>`;
            return detail;
            break;
    }
}

// Send PTO with Duplicate Checker
const btnModalSendRequest = document.querySelector("#btn_send_request");
btnModalSendRequest.addEventListener("click", () => {
    btnModalSendRequest.disabled = true;
    if (!formChecker()) {
        sendPTOWorkflow();
    }
});

async function getPTOList() {
    let { data, error } = await supabase.from("db_pto_request").select();
    return { data, error };
}

async function sendPTOWorkflow() {
    // let userDetails = await userData();
    let payload = {
        leave_date: document.querySelector("#inpdate_leavedate").value,
        status: null,
        cancelled_on: null,
        status_remarks: null,
        pto_reason: document.querySelector("#textarea_ptoreason").value,
        cancellation_remarks: null,
        sender: userDetails.email,
        recipient: userDetails.email,
        request_tier: userDetails.skill,
        site: userDetails.site,
        shift_code: userDetails.shift_code,
    };

    dbGETpto(payload);

    // let response = await checkDuplicatePTO(payload);
    // console.log(response);
    // // console.log(payload);

    // if (response.response == "update") {
    //     sendPTOWorkflowUpdate(response.pto);
    // } else if (response.response == "insert") {
    //     sendPTOWorkflowInsert(payload);
    // }
}

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

async function checkDuplicatePTO(payload) {
    let response = await getPTOList();
    let filteredResponse = null;

    if (!response.error) {
        response.data.filter((pto) => {
            if (
                pto.recipient == payload.recipient &&
                pto.leave_date == payload.leave_date
            ) {
                if (!(pto.status == "CANCELLED")) {
                    filteredResponse = { response: `duplicate`, pto };
                    showToast(
                        `You have already requested for ${formatDatemmddyyyy(
                            new Date(payload.leave_date)
                        )}`,
                        `danger`
                    );
                    document.querySelector("#inpdate_leavedate").value = null;
                    btnModalSendRequest.disabled = false;
                } else {
                    filteredResponse = { response: `update`, pto };
                    dialogbox.close();
                }
            }
        });
    }
    if (!filteredResponse) {
        filteredResponse = { response: `insert` };
        dialogbox.close();
    }

    return filteredResponse;
}

async function sendPTOWorkflowUpdate(payload) {
    payload.cancelled_on = null;
    payload.created_at = new Date();
    payload.status = "WAITLISTED";

    const { data, error } = await supabase
        .from("db_pto_request")
        .upsert(payload)
        .eq("transaction_id", payload.transaction_id)
        .select("*");

    tableUpdate();
    showToast(
        `You have reinstated your leave request for ${formatDatemmddyyyy(
            new Date(payload.leave_date)
        )}`,
        "success"
    );
}

async function sendPTOWorkflowInsert(payload) {
    payload.status = "WAITLISTED";
    delete payload.shift_code;
    delete payload.site;

    const { data, error } = await supabase
        .from("db_pto_request")
        .insert([payload])
        .select("*");

    console.log(data);
    console.log(error);
    tableUpdate();
    showToast(
        `You have successfully requested a leave for ${formatDatemmddyyyy(
            new Date(payload.leave_date)
        )}`,
        "success"
    );
}

function actionItemListener() {
    let c = document.querySelectorAll(".tbl-actionitems span");

    c.forEach((actionitem) => {
        actionitem.addEventListener("click", (e) => {
            let transaction_id = e.target.parentElement.dataset.transaction_id;
            let action = e.target.dataset.action;
            actionItemClicked(transaction_id, action);
            e.target.style.display = "none";
        });
    });
}

async function actionItemClicked(transaction_id, action) {
    if (action == "cancel") {
        let payload = null;
        let { data, error } = await supabase
            .from("db_pto_request")
            .select("*")
            .eq("transaction_id", transaction_id);

        if (data.length > 0) {
            payload = data[0];
            console.log(payload);
            payload.cancelled_on = new Date();
            payload.status = "CANCELLED";
        }
        let { canceldata, cancelerror } = await supabase
            .from("db_pto_request")
            .update(payload)
            .select("*")
            .eq("transaction_id", transaction_id);
        tableUpdate();
        showToast(
            `You have cancelled your leave request on ${formatDatemmddyyyy(
                new Date(payload.leave_date)
            )}`,
            "danger"
        );
    } else if (action == "reinstate") {
        let payload = null;
        let { data, error } = await supabase
            .from("db_pto_request")
            .select("*")
            .eq("transaction_id", transaction_id);

        if (data.length > 0) {
            payload = data[0];
            // console.log(payload);
            payload.cancelled_on = null;
            payload.status = "WAITLISTED";
            payload.created_at = new Date();
        }
        let { reinstatedata, reinstateerror } = await supabase
            .from("db_pto_request")
            .update(payload)
            .select("*")
            .eq("transaction_id", transaction_id);
        tableUpdate();
        showToast(
            `You have reinstated you leave request on ${formatDatemmddyyyy(
                new Date(payload.leave_date)
            )}`,
            "success"
        );
    }
}

// On Initialization call functions
updateUserDetails();
tableUpdate();

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

async function sendPTO() {}

async function dbGETpto(payload) {
    // //DELETE AFTER TESTING
    // payload = {
    //     leave_date: "2025-7-30",
    //     status: null,
    //     cancelled_on: null,
    //     status_remarks: null,
    //     pto_reason: document.querySelector("#textarea_ptoreason").value,
    //     cancellation_remarks: null,
    //     sender: userDetails.email,
    //     recipient: userDetails.email,
    //     request_tier: userDetails.skill,
    //     site: userDetails.site,
    //     shift_code: userDetails.shift_code,
    // };
    // //DELETE AFTER TESTING ABOVE
    try {
        let query = supabase.from("db_pto_request").select();
        const filters = {
            leaveDate: payload.leave_date,
            recipient: payload.recipient,
        };

        if (filters.leaveDate) {
            query = query.eq("leave_date", filters.leaveDate);
        }
        if (filters.recipient) {
            query = query.eq("recipient", filters.recipient);
        }
        query = query.neq("status", "CANCELLED");

        let resPTO = await query;

        if (resPTO.data.length === 0) {
            let updatedPayload = await validateCancelled(payload);
            dbGETAllocation(updatedPayload);
        } else {
            showToast(
                `You’ve already submitted a PTO request for ${formatDatemmddyyyy(
                    new Date(payload.leave_date)
                )}. Please review your pending or approved requests before submitting another.`,
                "danger"
            );
        }
    } catch (error) {
        showToast(
            error + `Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
}

async function dbGETAllocation(payload) {
    try {
        let query = supabase.from("db_allocation").select();
        const filters = {
            tier: payload.request_tier,
            shift_code: payload.shift_code,
            site: payload.site,
            leave_date: payload.leave_date,
        };
        if (filters.tier) {
            query = query.eq("tier", filters.tier);
        }
        if (filters.shift_code) {
            query = query.eq("shift_code", filters.shift_code);
        }
        if (filters.site) {
            query = query.eq("site", filters.site);
        }
        if (filters.leave_date) {
            query = query.eq("date", filters.leave_date);
        }

        let resAlloc = await query;
        if (!(resAlloc.data.length === 0)) {
            if (resAlloc.data[0].remaining > 0) {
                dbGETCount(payload, resAlloc.data[0]);
            } else {
                payload.status = "WAITLISTED";
                showToast(
                    `You have been added to the waitlist and will be notified if an allocation becomes avaiable for ${formatDatemmddyyyy(
                        new Date(payload.leave_date)
                    )}.`,
                    `warning`
                );
                upsertPTO(payload);
            }
        } else {
            showToast(
                `Dates not available, Contact WFM for more info`,
                `danger`
            );
        }

        // console.log(resAlloc.data);
    } catch (error) {
        showToast(
            error + `Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
}

async function dbGETCount(payload, allocData) {
    console.log(`dbGETCount`, payload, allocData);

    try {
        let query = supabase.from("db_approved_count").select();
        const filters = {
            email: payload.email,
            year: new Date(payload.leave_date).getFullYear(),
        };

        if (filters.email) {
            query = query.eq("tier", filters.tier);
        }
        if (filters.year) {
            query = query.eq("year", filters.year);
        }

        let resCount = await query;

        if (!(resCount.data.length === 0)) {
            if (resCount.data[0].approved_count < approvedPtoThreshold) {
                payload.status = "APPROVED";
                dialogbox.close();
                upsertPTO(payload);
                dbUPDATEAllocation(allocData, "remove");
                dbUPDATECount(resCount.data[0], "add");
                showToast(`Your leave request has been approved.`, `success`);
            } else {
                payload.status = "DENIED";
                upsertPTO(payload);
                showToast(
                    `The number of your approved leaves has reached the limit (${approvedPtoThreshold}). Please select another date or contact your supervisor for assistance`,
                    `danger`
                );
            }
        }
    } catch (error) {
        showToast(
            error + `Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
}

async function validateCancelled(payload) {
    payload.pto_reason = "test pto reason";

    try {
        let query = supabase.from("db_pto_request").select();
        const filters = {
            leaveDate: payload.leave_date,
            recipient: payload.recipient,
        };

        if (filters.leaveDate) {
            query = query.eq("leave_date", filters.leaveDate);
        }
        if (filters.recipient) {
            query = query.eq("recipient", filters.recipient);
        }
        query = query.eq("status", "CANCELLED");

        let resCancelled = await query;

        if (!(resCancelled.data.length === 0)) {
            payload.created_at = new Date();
            payload.sender = resCancelled.data[0].sender;
            payload.transaction_id = resCancelled.data[0].transaction_id;
            payload.pto_reason = `${resCancelled.data[0].pto_reason}/${new Date(
                resCancelled.data[0].created_at
            )}--${payload.pto_reason}/${payload.created_at}`;
            return payload;
        }
        return payload;
    } catch (error) {
        showToast(
            error + `Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
}

async function upsertPTO(payload) {
    if (payload.shift_code) {
        delete payload.shift_code;
    }
    if (payload.site) {
        delete payload.site;
    }
    try {
        let query = supabase.from("db_pto_request").upsert(payload).select();

        if (payload.transaction_id) {
            query = query.eq("transaction_id", payload.transaction_id);
        }

        let resUpsert = await query;
        tableUpdate();
        console.log(resUpsert);
    } catch (error) {
        showToast(
            error + `Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
}

async function dbUPDATEAllocation(payload, operator) {
    try {
        if (operator === "remove") {
            payload.remaining = --payload.remaining;
            payload.approved = ++payload.approved;
        } else {
            payload.remaining = ++payload.remaining;
            payload.approved = --payload.approved;
        }
        console.log(`dbUPDATEAllocation`, payload);
        let query = supabase
            .from("db_allocation")
            .update(payload)
            .eq("id", payload.id)
            .select();

        let resUPAllocation = await query;
        console.log(`resUPAllocation`, resUPAllocation);
    } catch (error) {
        showToast(
            error + `Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
}

async function dbUPDATECount(payload, operator) {
    try {
        if (operator === "add") {
            payload.approved_count = ++payload.approved_count;
        } else {
            payload.approved_count = --payload.approved_count;
        }

        console.log(`dbUPDATECount`, payload);
        let query = supabase
            .from("db_approved_count")
            .update(payload)
            .eq("id", payload.id)
            .select();
        let resUpCount = await query;
        console.log("resUpCount", resUpCount);
    } catch (error) {
        showToast(
            error + `Contact WFM and send a screenshot of the error`,
            "danger"
        );
    }
}
