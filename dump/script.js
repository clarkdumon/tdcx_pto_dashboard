import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"

// Create a single supabase client for interacting with your database
const supabase = createClient('https://jhqxioqnviaxdjlauyir.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpocXhpb3FudmlheGRqbGF1eWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODQ2MjksImV4cCI6MjA2NDQ2MDYyOX0.DAP7sLjxZCtbS-0G4c4brSda6wL2u9mC3QLBfKBXOUM')

for (let i = 0; i<= (ptovalue.length-1); i++) {
  if(ptovalue[i].leave_date == '2025-07-07'){
      console.log(ptovalue[i].leave_date,i,ptovalue[i].recipient)
  };
}


function getUserRequestedPTO(){

let response = 'data'




}