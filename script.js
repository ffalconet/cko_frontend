
var paymentEndpoint = 'http://localhost:4000/checkout/payments';
var customerEndpoint = 'http://localhost:4000/checkout/customers';
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
var local='FR-FR';
var securePayment;

var tokenisationresult;
var token;
var saveCardDetails;
var maskedcardnumber;

$("#paymentFrames").hide();
$("#payment_result").hide();
$("#devise").text("€");
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
    local = 'FR-FR';
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

function displayCardForm() {
  if ( $("#payment-form").css('display') == 'none' || $("#payment-form").css("visibility") == "hidden") {
    $("#payment-form").show();
    $("a#linkFrames").html("Hide new card payment");
  } else {
    $("#payment-form").hide();
    $("a#linkFrames").html("pay with another card");
  }
}

function Paymentstage() {

  // On cache la partie resultat de paiement
  $("#payment_result").hide();
  $("#payment_result_redirection").hide();
  $("#payment-form").hide();

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
      local = 'FR-FR';
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

  getStoredPaymentDetails();

  Frames.init({
      publicKey: "pk_sbox_w2jd5htaawrbo4eeziyn2dmifeu",
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

function getStoredPaymentDetails() {
    var settings = {
      "url": customerEndpoint + '/' + Email,
      "method": GET,
      "timeout": 0,
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    $.ajax(settings).done(function (response) {
      if(response && response?.instruments?.length > 0) {
        displayInstruments(response.instruments)
      } 
    }).fail(function (jqXHR, textStatus) {
      var result = $('#instruments');
      result.append('<label style="width:25rem;color:red" >No stored card</label>');
      $("#pay-button-card").hide();
      displayCardForm();
  });

}

function displayInstruments(instruments) {
  var result = $('#instruments');
  result.html('');
  for (var i = 0; i < instruments.length; i++) {
    result.append('<label style="width:25rem" ><input type="radio" id="instrument" name="instrument" value="' + instruments[i].id + '" /> ' + 
    instruments[i].scheme + ' - ' + instruments[i].bin + '********' + instruments[i].last4 + ' - ' +
    instruments[i].expiry_month + '/' + instruments[i].expiry_year
    + '</label>');
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

function makePaymentWithStoredCard() {
  console.log("Le client veut payer avec une carte enregistrée");

  var cardSelected  = $("#instrument:checked").val();
  
  if (cardSelected && cardSelected.startsWith('src_')) {
    var settings = {
      "url": paymentEndpoint,
      "method": POST,
      "timeout": 0,
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      "data": {
        "source": cardSelected,
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
    }).fail(function (jqXHR, textStatus) {
      console.log(textStatus);
      console.log(jqXHR);
  });

  } else {
    $("#payment_result_redirection").text('You have to select a card payment').css('color', 'red');
    $("#payment_result_redirection").show();
    $("#mainpageproduct").hide();
  }
}
