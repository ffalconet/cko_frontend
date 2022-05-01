
var paymentEndpoint = 'http://localhost:4000/checkout/payments';
var sofortEndpoint = 'http://localhost:4000/checkout/sofortRequest';
var returnUrl = 'http://127.0.0.1:1313/index.html';
var POST = 'POST'
var GET = 'GET'
var product1totalprice = 0;
var fullname;
var Email;
var phoneNumber = '0606060606';
var address = '11 rue du test';
var city = 'Aix-En-Provence';
var zipCode = '13100';
var country;
var devise;
var local='EN-GB';
var securePayment;

var tokenisationresult;
var token;
var saveCardDetails;
var maskedcardnumber;

$("#paymentFrames").hide();
$("#payment_result").hide();
$("#devise").text("£");
$("#payment_result_redirection").hide();

// Parse redirection URL which is index.html 
// in order to check if  cko-session-id / responseCode is in URL.
// This will help to make payment Details request
window.onload = function() {
  getURLfrom();
};

function getURLfrom() {
  currLoc = $(location).attr('href');
  console.log(currLoc);
  var url = new URL(currLoc);
  var ckoSessionId = url.searchParams.get("cko-session-id");
  var responseCode = url.searchParams.get("responseCode");
  console.log(ckoSessionId);
  console.log(responseCode);

  
  // Recuperation 
  // if (ckoSessionId && responseCode == 10000) {
    if (ckoSessionId) {
    var settings = {
      "url": paymentEndpoint + '/' + ckoSessionId,
      "method": GET,
      "timeout": 0,
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
  
    $.ajax(settings).done(function (response) {
      console.log(response)
      console.log(response.status);
      if(response.status === 'Pending') {
        $("#payment_result_redirection").text('Thank you very much, Your payment is in progress').css('color', 'orange');
        $("#payment_result_redirection").show();
        $("#mainpageproduct").hide();
      } else if(response.status == 'Declined') {
        $("#payment_result_redirection").text('We are sorry. Your payment is declined').css('color', 'red');
        $("#payment_result_redirection").show();
        $("#mainpageproduct").hide();
      } else if(response.status == 'Captured' && response.approved) {
        $("#payment_result_redirection").text('Congratulations, you will look pretty with this tee-shirt. Thank you.').css('color', 'green');
        $("#payment_result_redirection").show();
        $("#mainpageproduct").hide();
      } else {
        $("#payment_result_redirection").text('Sorry for that, there is an error when trying to get result payment').css('color', 'orange');
        $("#payment_result_redirection").show();
        $("#mainpageproduct").hide();
      }
    });
  }

}


$(document).ready(function() {

  $('.color-choose input').on('click', function() {
      var headphonesColor = $(this).attr('data-image');

      $('.active').removeClass('active');
      $('.left-column img[data-image = ' + headphonesColor + ']').addClass('active');
      $(this).addClass('active');
  });

});

// manage checkbox for 3DSecure
$("#secure").on('change', function() {
  if ($(this).is(':checked')) {
    $(this).attr('value', 'true');
  } else {
    $(this).attr('value', 'false');
  }
})

// Add and remove product simulation
// Just add or substract price.
$(".cart-btn-cart").on("click", function () {

  var $button = $(this);
  var total = parseInt(document.getElementById("amount").innerText);

  if ($button.text() == "+") {
      total = total + 10;
  } 
  if ($button.text() == "-") {
    if (total > 0) {
      total = total - 10;
    } else {
      total = 0;
    }
  }

  document.getElementById("amount").textContent=total;

  console.log(total);
});

function updateInfos() {  
  console.log('changement de pays'); 
  country = $("#country").val();
  console.log(country);
  if (country === "UK") {
    $("#devise").text("£");
    $("#productAmount").text("10 £");
    $("#productAmount2").text("10 £");
      devise = "GBP";
      local = 'EN-GB';
      $("#sofortpaymentimg").hide();
  } else {
    $("#devise").text("€");
    $("#productAmount").text("10 €");
    $("#productAmount2").text("10 €");
    $("#sofortpaymentimg").show();
    devise = "EUR";
    local = 'DE-DE';
  }
}

function makePayment() {
  var settings = {
    "url": paymentEndpoint,
    "method": POST,
    "timeout": 0,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    "data": {
      "token": token,
      "email": Email,
      "name": fullname,
      "currency": devise,
      "amount": product1totalprice * 100,
      "reference": new Date().getTime(),
    }
  };

  $.ajax(settings).done(function (response) {
    console.log(response.approved)
    if(response.approved) {
      $("#payment_result").text('Congratulations, you will look pretty with this tee-shirt. Thank you.').css('color', 'green');;
      $("#payment_result").show();
      $("#mainpageproduct").hide();
    } else {
      $("#payment_result").text('We are sorry. Your payment is declined').css('color', 'red');
      $("#payment_result").show();
      $("#mainpageproduct").hide();
    }
  });
}


function makeSecurePayment() {
  var settings = {
    "url": paymentEndpoint,
    "method": POST,
    "timeout": 0,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    "data": {
      "token": token,
      "email": Email,
      "name": fullname,
      "currency": devise,
      "amount": product1totalprice * 100,
      "reference": new Date().getTime(),
      "securePayment": true,
      "success_url": returnUrl,
      "failure_url": returnUrl,
    }
  };

  $.ajax(settings).done(function (response) {
    console.log(response)
    if(response.status === 'Pending' && response.redirectLink) {
      window.location.replace(response.redirectLink);
    } else {
      $("#payment_result").text('We are sorry. There were a problem with secure payment').css('color', 'red');
      $("#payment_result").show();
    }
  });
}


function Paymentstage() {

  // On cache la partie resultat de paiement
  $("#payment_result").hide();
  $("#payment_result_redirection").hide();

  // Collecte de données
  product1totalprice = parseInt(document.getElementById("amount").innerText);
  fullname = $("#fullname").val();
  Email = $("#mail").val();
  country = $("#country").val();
  securePayment = $("#secure").val();

  // controle de format
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!Email.match(mailformat)) {
    alert('email address invalid');
    return;
  }

  if(product1totalprice == 0) {
    alert('add a tee Shirt');
    return;
  }
  if(!fullname || !Email)  {
    alert('Please fill the form');
    return;
  }


  if (country === "UK") {
    $("#devise").text("£");
    $("#productAmount").text("10 £");
    $("#productAmount2").text("10 £");
      devise = "GBP";
      local = 'EN-GB';
      $("#sofortpaymentimg").hide();
  } else {
      $("#devise").text("€");
      $("#productAmount").text("10 €");
      $("#productAmount2").text("10 €");
      $("#sofortpaymentimg").show();
      devise = "EUR";
      local = 'DE-DE';
  }

  $("#mainpageproduct").hide();
  $("#paymentFrames").show();
  $("#pay-button").text("Pay " + devise + " " + product1totalprice);
  Frames.cardholder = {
      name: fullname,
      billingAddress: {
          addressLine1: address,
          addressLine2: "",
          zip: zipCode,
          city: city,
          state: "",
          country: country,
      },
      phone: phoneNumber
  };

  Frames.init({
      publicKey: "pk_test_4296fd52-efba-4a38-b6ce-cf0d93639d8a",
      modes: [],
      frameSelector: ".card-frame",
      localization: local,
      debug: true,
      schemeChoice: {
          frameSelector: ".scheme-choice-frame"
      }
  });

  Frames.addEventHandler(
      Frames.Events.CARD_TOKENIZED,
      CARD_TOKENIZED
  );

  // Get Token and make payment with this token
  function CARD_TOKENIZED(event) {
      console.log("CARD_TOKENIZED: %o", event);
      console.log(JSON.stringify(event));
      payButton.disabled = !Frames.isCardValid();
      token = event.token;
      tokenisationresult = event

      securePayment = $("#secure").is(":checked") ? "true" : "false";

      if(token) {
        if(securePayment == 'false') {
          makePayment();
        } else {
          makeSecurePayment();
        }
      }
  }
}


// payment Sofort request
// redirection to sofort Pages 
function sofortpayment() {
  console.log("Le client veut payer avec Sofort");
  var settings = {
    "url": sofortEndpoint,
    "method": POST,
    "timeout": 0,
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    "data": {
      "amount": product1totalprice * 100,
      "currency": devise,
      "success_url": returnUrl,
      "failure_url": returnUrl,
    }
  };

  $.ajax(settings).done(function (response) {
    console.log(response)
    if(response.status === 'Pending' && response.redirectLink) {
      window.location.replace(response.redirectLink);
    }
  });
}
