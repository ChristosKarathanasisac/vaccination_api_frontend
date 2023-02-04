"use strict";
////////////////////////Global variables////////////////////////////////
const rowsPerPage = 5;
let appointmentsTable = [];
///////////////////////////////////////////////////////////////////////

//////////////////////////////EVENTS//////////////////////////////////
document
  .querySelector("button#showTodaysAppointments")
  .addEventListener("click", function (evt) {
    document.getElementById("searchResult").textContent = "";
    document.getElementById("searchResult").style.visibility = "hidden";
    const doctorAmka = document.getElementById("doctorAMKA").value;
    if (doctorAmka == "") {
      document.getElementById("searchResult").textContent =
        "Insert your AMKA to continue";
      document.getElementById("searchResult").style.visibility = "visible";
      return;
    }
    getTodaysAppointments();
  });

document
  .querySelector("button#showAllAppointments")
  .addEventListener("click", function (evt) {
    document.getElementById("searchResult").textContent = "";
    document.getElementById("searchResult").style.visibility = "hidden";
    const doctorAmka = document.getElementById("doctorAMKA").value;
    if (doctorAmka == "") {
      document.getElementById("searchResult").textContent =
        "Insert your AMKA to continue";
      document.getElementById("searchResult").style.visibility = "visible";
      return;
    }
    getAllAppointments();
  });

document
  .querySelector("div#pagination")
  .addEventListener("click", function (evt) {
    const curPage = evt.target.innerText;
    showAppointmentsTable(appointmentsTable, parseInt(curPage));
  });
/////////////////////////////////////////////////////////////////////

///////////--------------------Functions-------------------/////////////////

//////////////////////////Request Functions/////////////////////////////
function getAllAppointments() {
  const doctorAmka = document.getElementById("doctorAMKA").value;

  var settings = {
    url: "http://localhost:8080/getAppointments",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      amka: String(doctorAmka),
      timeslots: [],
    }),
  };

  $.ajax(settings).done(function (response) {
    fillAppointmentsTable(response);
    setupPagination(appointmentsTable, document.getElementById("pagination"));
    //This prints the table to html
    ascSort(appointmentsTable, 4);
  });
}

function getTodaysAppointments() {
  const doctorAmka = document.getElementById("doctorAMKA").value;
  var settings = {
    url: "http://localhost:8080/getTodaysAppointments",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      amka: String(doctorAmka),
      timeslots: [],
    }),
  };

  $.ajax(settings).done(function (response) {
    fillAppointmentsTable(response);
    setupPagination(appointmentsTable, document.getElementById("pagination"));
    //This prints the table to html
    ascSort(appointmentsTable, 4);
  });
}
//////////////////////////////////////////////////////////////////////////
function fillAppointmentsTable(json) {
  //let temp = jQuery.parseJSON(json);
  if (json.status != "SUCCESS") {
    document.getElementById("searchResult").textContent =
      "Fail to load appointments. Error message: " + json.warningMessage;
    document.getElementById("searchResult").style.visibility = "visible";
    return;
  }

  let result = json.obj;
  let table = document.getElementById("resultsTable");

  let rowCount = table.rows.length;
  for (let i = rowCount - 1; i > 0; i--) {
    table.deleteRow(i);
  }
  appointmentsTable = [];
  for (let i in result) {
    let appointment = result[i];
    let vaccCenter = appointment.timeslot.vacCenter.code;
    let date =
      appointment.timeslot.day +
      "-" +
      appointment.timeslot.month +
      "-" +
      appointment.timeslot.year;
    let startHour =
      appointment.timeslot.startHour + ":" + appointment.timeslot.startMin;
    let endHour =
      appointment.timeslot.endHour + ":" + appointment.timeslot.endMin;

    appointmentsTable[i] = [
      vaccCenter,
      date,
      startHour,
      endHour,
      new Date(
        appointment.timeslot.year,
        appointment.timeslot.month,
        appointment.timeslot.day,
        appointment.timeslot.startHour,
        appointment.timeslot.startMin
      ),
    ];
  }
}
///////////////////////////Print Functions//////////////////////
function showAppointmentsTable(dataArray, page) {
  const table = document.getElementById("resultsTable");

  let rowCount = table.rows.length;
  for (let j = rowCount - 1; j > 0; j--) {
    table.deleteRow(j);
  }
  page--;
  let start = rowsPerPage * page;
  let end = start + rowsPerPage;
  let peginationItems = dataArray.slice(start, end);

  for (let i = 0; i < peginationItems.length; i++) {
    let row = table.insertRow(-1);
    row.className = "rows";

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);

    cell1.innerHTML = peginationItems[i][0];
    cell1.className = "vaccCenters";
    cell2.innerHTML = peginationItems[i][1];
    cell2.className = "dates";
    cell3.innerHTML = peginationItems[i][2];
    cell3.className = "starthours";
    cell4.innerHTML = peginationItems[i][3];
    cell4.className = "endhours";
  }
}
///////////////////////////////////////////////////////////////

//////////////////////////Pegination Functions/////////////////////////////
function setupPagination(items, wrapper) {
  let pageCount = Math.ceil(items.length / rowsPerPage);
  wrapper.innerHTML = "";
  for (let i = 1; i < pageCount + 1; i++) {
    let btn = paginationBtn(i);
    wrapper.appendChild(btn);
  }
}

function paginationBtn(page) {
  let button = document.createElement("button");
  button.innerText = page;

  return button;
}
////////////////////////////////////////////////////////////////////////////

///////////////////////////Sorting Functions//////////////////////

//SOS----->This function call showAppointmentsTable to print to data
function ascSort(dataArray, field) {
  showAppointmentsTable(
    dataArray.sort(function sortFunction(a, b) {
      if (a[field] === b[field]) {
        return 0;
      } else {
        if (a[field].getDate() !== b[field].getDate()) {
          //return a[field].getDate() > b[field].getDate() ? -1 : 1;
          return a[field].getDate() - b[field].getDate();
        }
        return a[field].getTime() - b[field].getTime();
      }
    }),
    1
  );
}
