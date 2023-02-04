"use strict";
document
  .querySelector("button#insertvaccination")
  .addEventListener("click", function (evt) {
    insertVaccination();
  });

function insertVaccination() {
  let insertResult = document.getElementById("insertvaccinationresult");
  insertResult.textContent = "";
  insertResult.style.visibility = "hidden";

  var doctoramka = document.getElementById("docamka").value;
  var citizenamka = document.getElementById("citamka").value;
  var selectedDate = document.getElementById("vacDate").value;

  if (citizenamka == "") {
    insertResult.textContent = "Insert citizen's AMKA to continue";
    insertResult.style.visibility = "visible";
    return;
  }

  if (doctoramka == "") {
    insertResult.textContent = "Insert doctor's AMKA to continue";
    insertResult.style.visibility = "visible";
    return;
  }

  if (!selectedDate) {
    insertResult.textContent = "Insert date to continue";
    insertResult.style.visibility = "visible";
    return;
  }

  var settings = {
    url: "http://localhost:8080/insertVaccination",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      citizenAMKA: String(citizenamka),
      doctorAMKA: String(doctoramka),
      date: String(selectedDate),
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
