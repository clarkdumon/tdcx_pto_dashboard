import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.10/+esm";
const supabase = createClient(
    "https://jhqxioqnviaxdjlauyir.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocXhpb3FudmlheGRqbGF1eWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODQ2MjksImV4cCI6MjA2NDQ2MDYyOX0.DAP7sLjxZCtbS-0G4c4brSda6wL2u9mC3QLBfKBXOUM"
);

const dialogbox = document.querySelector("#popup-modal");
const dialogboxCloseBtn = document.querySelector('#modal-close');
const btnSendRequest = document.querySelector('#btnSendRequest');

// dialogbox.showModal();

dialogbox.addEventListener('click',event =>{
    offsideModalClick(dialogbox)
})
dialogboxCloseBtn.addEventListener('click',event =>{
    console.log('close btn')
    dialogbox.close();
})
btnSendRequest.addEventListener('click',()=>{
    dialogbox.showModal();
})

function offsideModalClick(modal) {
    const rect = modal.getBoundingClientRect();
    const isInDialog =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

    if (!isInDialog) {
        console.log('offside close')
        modal.close();
    }
}
