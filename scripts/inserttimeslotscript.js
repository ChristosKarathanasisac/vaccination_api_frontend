"use strict";
////////////////////////Global variables/////////////////////////////////
const vacCentersDropDown = document.getElementById("VacCentersDropDown");
/////////////////////////////////////////////////////////////////////////

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
document
  .querySelector("button#inserttimeslot")
  .addEventListener("click", function (evt) {
    insertTimeSlot();
  });
////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////

///////////--------------------Functions-------------------/////////////////

//////////////////////////Request Functions/////////////////////////////
function insertTimeSlot() {
  let insertResult = document.getElementById("inserttimeslotresult");
  insertResult.textContent = "";
  insertResult.style.visibility = "hidden";

  var selectedDate = document.getElementById("timeslotDate").value;
  var startTime = document.getElementById("timeslotStartTime").value;
  var endTime = document.getElementById("timeslotEndTime").value;

  var vaccinationCenter = document.getElementById("VacCentersDropDown").value;
  var dateArray = String(selectedDate).split("-");
  var year;
  var month;
  var day;
  var startTimeArray;
  var startHour;
  var startMin;
  var endTimeArray;
  var endtHour;
  var endMin;

  var docAMKA = document.getElementById("docamka").value;

  if (docAMKA == "") {
    insertResult.textContent = "Insert AMKA to continue";
    insertResult.style.visibility = "visible";
    return;
  }
  if (selectedDate) {
    var dateArray = String(selectedDate).split("-");
    var year = dateArray[0];
    var month = dateArray[1];
    var day = dateArray[2];
  } else {
    insertResult.textContent = "Insert date to continue";
    insertResult.style.visibility = "visible";
    return;
  }
  if (startTime) {
    var startTimeArray = String(startTime).split(":");
    var startHour = startTimeArray[0];
    var startMin = startTimeArray[1];
  } else {
    insertResult.textContent = "Insert start hour to continue";
    insertResult.style.visibility = "visible";
    return;
  }
  if (endTime) {
    var endTimeArray = String(endTime).split(":");
    var endtHour = endTimeArray[0];
    var endMin = endTimeArray[1];
  } else {
    insertResult.textContent = "Insert end hour to continue";
    insertResult.style.visibility = "visible";
    return;
  }

  var settings = {
    url: "http://localhost:8080/insertTimeSlot",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      id: "",
      day: day,
      month: month,
      year: year,
      startHour: startHour,
      startMin: startMin,
      endHour: endtHour,
      endMin: endMin,
      available: true,
      vacCenter: {
        code: vaccinationCenter,
        address: "",
        timeslots: [],
      },
      doc: {
        amka: docAMKA,
        firstName: "",
        lastName: "",
      },
    }),
  };
  $.ajax(settings).done(function (response) {
    if (response.status == "SUCCESS") {
      insertResult.textContent = response.resultmsg;
      insertResult.style.visibility = "visible";
    } else {
      insertResult.textContent = response.warningMessage;
      insertResult.style.visibility = "visible";
    }
  });
}
