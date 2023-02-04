"use strict";

document.querySelector("#login").addEventListener(
  "click",
  function (evt) {
    login();
  },
  false
);

function login() {
  let amka = document.getElementById("amka").value;
  let psw = document.getElementById("psw").value;
  let loginAs = document.getElementById("loginAs").value;

  let flag = false;
  if (loginAs == "doctor") {
    flag = true;
  }

  var settings = {
    url: "http://localhost:8080/login",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      amka: amka,
      password: psw,
      doctor: flag,
    }),
  };

  $.ajax(settings).done(function (response) {
    let result = response;
    if (result.status == "SUCCESS") {
      if (flag) {
        window.location.href = "./doctorpage.html";
      } else {
        //window.location.href = "./citizenpage.html";
        window.location.href = "citizenpage.html";
      }
    } else {
      const errormessage = document.getElementById("loginErrorMessage");
      errormessage.textContent = "Wrong AMKA or password";
      errormessage.style.visibility = "visible";
    }
  });
}
