"use strict";

////////////////////////Global variables////////////////////////////////
const vacCentersDropDown = document.getElementById("VacCentersDropDown");
const rowsPerPage = 5;
let timeslotsTable = [];
///////////////////////////////////////////////////////////////////////

/////////////////////////Events///////////////////////////////////////

window.addEventListener("load", (event) => {
  getVaccinationCenters();
});
function getVaccinationCenters() {
  const settings = {
    url: "http://localhost:8080/getVaccinationCenters",
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
  };

  $.ajax(settings).done(function (response) {
    let result = jQuery.parseJSON(response);
    var i = 0;
    for (let k in result) {
      let vc = result[k];
      let option = document.createElement("option");
      option.setAttribute("value", vc.code);

      let optionText = document.createTextNode(vc.address);
      option.appendChild(optionText);
      vacCentersDropDown.appendChild(option);
      i++;
    }
  });
}

document.querySelector("#resultsTable").addEventListener(
  "click",
  (e) => {
    let id;
    let date;
    let hour;
    const vaccinationCenter =
      document.getElementById("VacCentersDropDown").value;

    let tr = e.target.closest('tr[class="rows"]');
    if (tr) {
      id = tr.cells.item(0).innerHTML;
      date = tr.cells.item(1).innerHTML;
      hour = tr.cells.item(2).innerHTML + "-" + tr.cells.item(3).innerHTML;
    } else {
      return;
    }
    const selectedVaccinationCenter = document.getElementById(
      "selectedVaccinationCenter"
    );
    selectedVaccinationCenter.value = vaccinationCenter;
    const selectedTimeslotDate = document.getElementById(
      "selectedTimeslotDate"
    );
    selectedTimeslotDate.value = date;
    const selectedTimeslotHour = document.getElementById(
      "selectedTimeslotHour"
    );
    selectedTimeslotHour.value = hour;
    const selectedTimeslotID = document.getElementById("selectedTimeslotID");
    selectedTimeslotID.value = id;

    const btnbook = document.getElementById("bookAppointment");
    btnbook.disabled = false;
    const btnupdate = document.getElementById("updateAppointment");
    btnupdate.disabled = false;
  },
  false
);

document
  .querySelector("button#bookAppointment")
  .addEventListener("click", function (evt) {
    const btnupdate = document.getElementById("updateAppointment");
    btnupdate.disabled = true;
    bookVaccination();
  });
document
  .querySelector("button#updateAppointment")
  .addEventListener("click", function (evt) {
    const btnbook = document.getElementById("bookAppointment");
    btnbook.disabled = true;
    updateVaccination();
  });

document
  .querySelector("div#pagination")
  .addEventListener("click", function (evt) {
    const curPage = evt.target.innerText;
    showTimeslotsTable(timeslotsTable, parseInt(curPage));
  });

document
  .querySelector("button#showTimeslotsByDay")
  .addEventListener("click", function (evt) {
    getAvailableTimeslotsByDay();
  });
document
  .querySelector("button#showTimeslotsByMonth")
  .addEventListener("click", function (evt) {
    getAvailableTimeslotsByMonth();
  });
////////////////////////////////////////////////////////////////////////////

///////////--------------------Functions-------------------/////////////////

//////////////////////////Request Functions/////////////////////////////
function getAvailableTimeslotsByMonth() {
  const selectedMonth = document.getElementById("timeslotByMonth").value;
  const vaccinationCenter = document.getElementById("VacCentersDropDown").value;

  let year;
  let month;

  if (selectedMonth) {
    let dateArray = String(selectedMonth).split("-");
    year = dateArray[0];
    month = dateArray[1];
  } else {
    return;
  }

  const settings = {
    url:
      "http://localhost:8080/getAvailableTimeslotsByMonth?month=" +
      month +
      "&year=" +
      year +
      "&vacCenterCode=" +
      vaccinationCenter,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
  };

  $.ajax(settings).done(function (response) {
    fillTimeslotsTable(response);
    setupPagination(timeslotsTable, document.getElementById("pagination"));
    //This prints the table to html
    ascSort(timeslotsTable, 4);
  });
}
function getAvailableTimeslotsByDay() {
  const selectedDate = document.getElementById("timeslotByDay").value;
  const vaccinationCenter = document.getElementById("VacCentersDropDown").value;

  let year;
  let month;
  let day;
  if (selectedDate) {
    let dateArray = String(selectedDate).split("-");
    year = dateArray[0];
    month = dateArray[1];
    day = dateArray[2];
  } else {
    return;
  }
  const settings = {
    url:
      "http://localhost:8080/getAvailableTimeslots?day=" +
      day +
      "&month=" +
      month +
      "&year=" +
      year +
      "&vacCenterCode=" +
      vaccinationCenter,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
  };

  $.ajax(settings).done(function (response) {
    fillTimeslotsTable(response);
    setupPagination(timeslotsTable, document.getElementById("pagination"));
    //This prints the table to html
    ascSort(timeslotsTable, 4);
  });
}

function bookVaccination() {
  //console.log("Inside book vaccination");
  const selectedTimeslotID = document.getElementById("selectedTimeslotID");
  const id = selectedTimeslotID.value;
  const pBookAppointmentResult = document.getElementById(
    "bookAppointmentResult"
  );
  const fieldAMKA = document.getElementById("citizenAMKA");
  const amka = fieldAMKA.value;
  if (!amka) {
    pBookAppointmentResult.textContent = "Insert your AMKA to continue";
    pBookAppointmentResult.style.visibility = "visible";
    return;
  }

  var settings = {
    url: "http://localhost:8080/bookAppointment",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      tmslotID: parseInt(String(id)),
      citizenAMKA: String(amka),
    }),
  };
  $.ajax(settings).done(function (response) {
    //let temp = jQuery.parseJSON(response);
    let result = response.status;
    if (result == "SUCCESS") {
      pBookAppointmentResult.textContent = response.resultmsg;
      pBookAppointmentResult.style.visibility = "visible";
      document.getElementById("updateAppointment").disabled = false;
      // document.getElementById("updateAppointment").removeAttribute("disabled");
    } else {
      pBookAppointmentResult.textContent = response.warningMessage;
      pBookAppointmentResult.style.visibility = "visible";
      document.getElementById("updateAppointment").disabled = false;
    }
  });
}

function updateVaccination() {
  //2 Steps. First get the citezen's appointment. Second update
  const selectedTimeslotID = document.getElementById("selectedTimeslotID");
  const id = selectedTimeslotID.value;
  const pBookAppointmentResult = document.getElementById(
    "bookAppointmentResult"
  );
  const fieldAMKA = document.getElementById("citizenAMKA");
  const amka = fieldAMKA.value;
  if (!amka) {
    pBookAppointmentResult.textContent = "Insert your AMKA to continue";
    pBookAppointmentResult.style.visibility = "visible";
    return;
  }

  let settings = {
    url: "http://localhost:8080/getCitizenAppointment",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      amka: String(amka),
      vaccination: {},
    }),
  };

  $.ajax(settings).done(function (response) {
    let result = response.status;
    if (result !== "SUCCESS") {
      pBookAppointmentResult.textContent = response.warningMessage;
      pBookAppointmentResult.style.visibility = "visible";
      return;
    }
    let appointmentId = response.obj.id;

    let settings2 = {
      url: "http://localhost:8080/updateAppointment",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        appointmentID: appointmentId,
        newTimeslotID: id,
      }),
    };

    $.ajax(settings2).done(function (response) {
      let result = response.status;
      if (result !== "SUCCESS") {
        pBookAppointmentResult.textContent = response.warningMessage;
        pBookAppointmentResult.style.visibility = "visible";
        return;
      } else {
        pBookAppointmentResult.textContent = response.resultmsg;
        pBookAppointmentResult.style.visibility = "visible";
      }
    });
  });
}
///////////////////////////////////////////////////////////////////////////////////

function fillTimeslotsTable(json) {
  let temp = jQuery.parseJSON(json);
  let result = temp.obj;

  let table = document.getElementById("resultsTable");

  let rowCount = table.rows.length;
  for (let i = rowCount - 1; i > 0; i--) {
    table.deleteRow(i);
  }
  timeslotsTable = [];
  for (let i in result) {
    let timeslot = result[i];
    let id = timeslot.id;
    let date = timeslot.day + "-" + timeslot.month + "-" + timeslot.year;
    let startHour = timeslot.startHour + ":" + timeslot.startMin;
    let endHour = timeslot.endHour + ":" + timeslot.endMin;

    timeslotsTable[i] = [
      id,
      date,
      startHour,
      endHour,
      new Date(
        timeslot.year,
        timeslot.month,
        timeslot.day,
        timeslot.startHour,
        timeslot.startMin
      ),
    ];
  }
}
///////////////////////////Sorting Functions//////////////////////
//!!!!!!SOS----->This function call showTimeslotsTable to print to data
function ascSort(dataArray, field) {
  showTimeslotsTable(
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
/////////////////////////////////////////////////////////////////

///////////////////////////Print Functions//////////////////////
function showTimeslotsTable(dataArray, page) {
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
    cell1.className = "ids";
    cell2.innerHTML = peginationItems[i][1];
    cell2.className = "dates";
    cell3.innerHTML = peginationItems[i][2];
    cell3.className = "starthours";
    cell4.innerHTML = peginationItems[i][3];
    cell4.className = "endhours";
  }
}
/////////////////////////////////////////////////////////////////////////

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
