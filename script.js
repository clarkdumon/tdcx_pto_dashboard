import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.10/+esm";
const supabase = createClient(
    "https://jhqxioqnviaxdjlauyir.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocXhpb3FudmlheGRqbGF1eWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODQ2MjksImV4cCI6MjA2NDQ2MDYyOX0.DAP7sLjxZCtbS-0G4c4brSda6wL2u9mC3QLBfKBXOUM"
);

// Constant Variables
const toastDuration = 7 * 1000;
const approvedPtoThreshold = 25;


// Toast Notification Javascript
function showToast(msg, status) {
    let note = "";
    if (status == "success") {
        note = `<span class="material-symbols-rounded">check_circle</span> ${msg}`;
    }
    if (status == "danger") {
        note = `<span class="material-symbols-rounded">error</span> ${msg}`;
    }

    if (status == "warning") {
        note = `<span class="material-symbols-rounded">warning</span> ${msg}`;
    }
    let toastBox = document.querySelector("#toastBox");

    let toast = document.createElement("div");
    toast.classList.add("toast");
    toast.classList.add(status);
    toast.innerHTML = note;
    toastBox.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, toastDuration);
}// Toast Notification Javascript End



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




const dialogbox = document.querySelector("#popup-modal");
const dialogboxCloseBtn = document.querySelector("#modal-close");
const btnSendRequest = document.querySelector("#btnSendRequest");
// const inpLeaveDate = document.querySelector("#inpdate_leavedate");
const btnModalSendRequest = document.querySelector("#btn_send_request");

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

btnModalSendRequest.addEventListener("click", () => {
    btnModalSendRequest.disabled = true;
    sendPTOWorkflow();
});

// Test Calls for Functions
// showToast("Success", "success");
// showToast(
//     "There is no available allocation for your requested dates. You have been added to the waitlist until the locking period or until a slot becomes available.",
//     "warning"
// );
// showToast(
//     `You have exceeded the allowed threshold of ${approvedPtoThreshold} approved leave requests.`,
//     "danger"
// );
handlePTORequest();
// ptoOpenStartDate();
// ptoOpenEndDate();
// pullmemberlist();
// pullPTOlist();
tableUpdate();
// checkuser();
// checkallocation()
// dialogbox.showModal();

// Needed Functions

function ptoOpenStartDate() {
    let openStartDate = new Date();
    openStartDate.setDate(openStartDate.getDate() + 28);
    openStartDate = formateDateyyyymmdd(openStartDate);
    return openStartDate;
}

function ptoOpenEndDate() {
    let openEndDate = new Date();
    openEndDate.setDate(openEndDate.getDate() + 28 + 90);
    openEndDate = formateDateyyyymmdd(openEndDate);
    return openEndDate;
}



function offsideModalClick(modal) {
    const rect = modal.getBoundingClientRect();
    const isInDialog =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

    if (!isInDialog) {
        console.log("offside close");
        modal.close();
    }
}

async function pullmemberlist() {
    localStorage.clear();
    let { data, error } = await supabase.from("member_list").select("*");
    localStorage.setItem("memberlist", JSON.stringify(data));
}

async function pullPTOlist() {
    let { data, error } = await supabase
        .from("db_pto_request")
        .select("*")
        .eq("recipient", "clark.dumon@tdcx.com")
        .order("leave_date", { ascending: false });
    return data;
}

async function sendPTOWorkflow() {
    let reqPTODate = document.querySelector("#inpdate_leavedate").value;
    let reqPTOReason = document.querySelector("#textarea_ptoreason").value;
    // console.log(reqPTODate,reqPTOReason)

    let data = await pullPTOlist();

    let pto = data.filter((ptodate) => {
        // console.log(ptodate)

        return reqPTODate == ptodate.leave_date;
    });
    if (pto.length != 0) {
        console.log(pto);
        dialogbox.close();
        alert("You have already requested for these dates");
    } else {
        let allocation = checkallocation(reqPTODate);
    }
}

async function checkallocation(reqPTODate) {
    let { data, error } = await supabase
        .from("db_allocation")
        .select()
        .eq("tier", "Resolutions 1")
        .eq("shift_code", "AM")
        .eq("site", "Cebu")
        .eq("date", reqPTODate);

    console.log(data);
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
                <td class="tbl-ptoDate">${formatDatemmddyyyy(
                    new Date(dbData[i].leave_date)
                )}</td>
                <td class="status-data">
                  ${status.status}
                </td>
                <td class="tbl-actionitems">
                  ${status.action}
                </td>
              </tr>`;
    }
    tableData.innerHTML = table;
}

function tableStatus(status) {
    let detail = {};
    switch (status) {
        case "APPROVED":
            detail.status = `<span class="status approved">
                                <span class="material-symbols-rounded status-icon">check_circle</span>
                                <span>Approved</span>
                            </span>`;
            detail.action = `<span class="material-symbols-rounded action-icon cancel">delete_forever</span>`;
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
            detail.action = `<span class="material-symbols-rounded action-icon reinstate" title="reinstate">settings_backup_restore</span>`;
            return detail;
            break;
        case "WAITLISTED":
            detail.status = `<span class="status waitlisted">
                                <span class="material-symbols-rounded status-icon">schedule</span>
                                <span>Waitlisted</span>
                            </span>`;
            detail.action = `<span class="material-symbols-rounded action-icon cancel">delete_forever</span>`;
            return detail;
            break;
    }
}





async function checkuser() {
    let { data, error } = await supabase
        .from("member_list")
        .select()
        .eq("email", "clark.dumon@tdcx.com");

    console.log(data[0]);
}

// DB Connections
async function getPTOList() {
    let { data, error } = await supabase.from("db_pto_request").select();
    return { data, error };
}

async function getPTOAllocation() {
    let { data, error } = await supabase.from("db_allocation").select();
    return { data, error };
}

async function getApprovalCount() {
    let { data, error } = await supabase.from("approved_count").select();
    return { data, error };
}

// Send Request PTO
async function handlePTORequest() {
    
    let ptoList = await getPTOList();
    let allocation = await getPTOAllocation();
    let approvalCount = await getApprovalCount();
    let userDetails = {
        email: "clark.dumon@tdcx.com",
        tier: "Resolutions 1",
        shift_code: "AM",
        site: "Cebu",
        ptoDate: "2025-07-25",
        ptoReason: "User Generated Reason",
    };
    let payload = {
        transaction_id: "",
        created_at: "",
        leave_date: userDetails.ptoDate,
        status: "",
        cancelled_on: "",
        status_remarks: "",
        pto_reason: userDetails.ptoReason,
        cancellation_remarks: "",
        sender: userDetails.email,
        recipient: userDetails.email,
        request_tier: userDetails.tier,
    };
    console.log(payload);

    let ptoHandle =  ptoHandler(ptoList, userDetails);
    let allocationHandle =  allocationHandler(allocation, userDetails);
    let countHandle =  approvedCountHandler(approvalCount, userDetails);

    console.log("********");
    console.log("ptoHandle");
    console.log(ptoHandle);
    console.log("allocationHandle");
    console.log(allocationHandle);
    console.log("countHandle");
    console.log(countHandle);

    if (!ptoHandle.status) {
        showToast(ptoHandle.remarks, "danger");
        return;
    }

    if (!allocationHandle.status) {
        showToast(allocationHandle.remarks, "warning");
        payload.status = "WAITLISTED";
        payload.status_remarks = allocationHandle.remarks;
        console.log(payload)
        return
    }

    if (!countHandle.status) {
        showToast(countHandle.remarks, "danger");
    }
}
// Send Request PTO FN Check Duplicate Request, Check Duplicate if Cancelled
function ptoHandler(ptoList, userDetails) {
    let filteredPto = [];
    if (!ptoList.error) {
        ptoList.data.filter((pto) => {
            if (
                pto.recipient == userDetails.email &&
                pto.leave_date == userDetails.ptoDate
            ) {
                filteredPto.push(pto);
            }
        });
    }

    if (filteredPto.length != 0) {
        if (filteredPto[0].status != "CANCELLED") {
            // showToast('Dates has already been requested','danger')
            return {
                status: false,
                remarks: `Error: Duplicate leave date; Check requested leave`,
                filteredPto,
            };
        } else {
            return { status: true, remarks: ``, filteredPto };
        }
    } else {
        return { status: true, remarks: ``, filteredPto };
    }
}
// Send Request PTO FN Check Allocation not Zero[0]
function allocationHandler(allocation, userDetails) {
    let filteredAllocation = [];
    if (!allocation.error) {
        allocation.data.filter((allocation) => {
            if (
                allocation.tier == userDetails.tier &&
                allocation.shift_code == userDetails.shift_code &&
                allocation.site == userDetails.site &&
                allocation.date == userDetails.ptoDate
            ) {
                filteredAllocation.push(allocation);
            }
        });
    }

    if (filteredAllocation.length != 0) {
        if (!(filteredAllocation[0].remaining > 0)) {
            return {
                status: false,
                remarks: `There is no available allocation for your requested dates. You have been added to the waitlist until the locking period or until a slot becomes available.`,
                filteredAllocation,
            };
        } else {
            return { status: true, remarks: ``, filteredAllocation };
        }
    }
    return { status: false, remarks: ``, filteredAllocation };
}
// Send Request PTO FN Check Approved Count if above threshold
function approvedCountHandler(approvalCount, userDetails) {
    let filteredApprovalCount = [];
    if (!approvalCount.error) {
        approvalCount.data.filter((count) => {
            if (
                count.email == userDetails.email &&
                count.year == new Date(userDetails.ptoDate).getFullYear()
            ) {
                filteredApprovalCount.push(count);
            }
        });
    }

    if (filteredApprovalCount != 0) {
        if (filteredApprovalCount[0].approved_count >= approvedPtoThreshold) {
            return {
                status: false,
                remarks: `You have exceeded the allowed threshold of ${approvedPtoThreshold} approved leave requests.`,
                filteredApprovalCount,
            };
        } else {
            return { status: true, remarks: ``, filteredApprovalCount };
        }
    }
} // Send Request PTO End

