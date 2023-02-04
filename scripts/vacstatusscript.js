"use strict";
document.querySelector("#showStatus").addEventListener(
  "click",
  function (evt) {
    document.getElementById("status").value = "";
    document.getElementById("validuntil").value = "";
    getVaccinationStatus();
  },
  false
);
function getVaccinationStatus() {
  let amka = document.getElementById("citizenAMKA").value;

  if (amka == "") {
    document.getElementById("statusresult").textContent =
      "Insert AMKA to continue";
    document.getElementById("statusresult").style.visibility = "visible";
    return;
  }
  var settings = {
    url: "http://localhost:8080/showVaccinationStatus?amka=" + amka,
    method: "GET",
    timeout: 0,
  };

  $.ajax(settings).done(function (response) {
    if (response.status == "SUCCESS") {
      document.getElementById("status").value = response.resultmsg;
      if (response.resultmsg == "VACCINATED") {
        let datearray = String(response.obj.vaccinationEndDate).split("-");
        let month = datearray[1];
        let day = datearray[2].slice(0, 2);
        let year = datearray[0];
        document.getElementById("validuntil").value =
          day + "-" + month + "-" + year;
      }
    } else {
      document.getElementById("statusresult").textContent =
        "Problem retrieving vaccination data. Error message: " +
        response.warningMessage;

      document.getElementById("statusresult").style.visibility = "visible";
      return;
    }
  });
}
