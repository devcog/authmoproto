(function ($) {
  "use strict";

  /// serialize form to Object
  $.fn.serializeObject = function () {
    var result = {};
    var extend = function (i, element) {

      var node = result[element.name];
      // If node with same name exists already, need to convert it to an array as it
      // is a multi-value field (i.e. checkboxes)
      if ('undefined' !== typeof node && node !== null) {
        if ($.isArray(node)) {
          node.push(element.value);
        } else {
          result[element.name] = [node, element.value];
        }
      } else {
        result[element.name] = element.value;
      }
    };

    $.each(this.serializeArray(), extend);
    return result;
  };
  /*==================================================================
  [ Focus input ]*/
  $('.input100').each(function () {
    $(this).on('blur', function () {
      if ($(this).val().trim() !== '') {
        $(this).addClass('has-val');
      } else {
        $(this).removeClass('has-val');
      }
    })
  });
  /*==================================================================
  [ Validate ]*/
  $(document).ready(function () {

    var regex = new RegExp(
      '^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)|' +
      '(\\".+\\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])' +
      '|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
    );

    var emailLooksValid = false;

    $('.email input').on('keyup', function (e) {
      //  $(this).parent().toggleClass('success', regex.test($(this).val()));
      if (regex.test($(this).val())) {
        $(this).parent().addClass('success');
        //set emailLooksValid to true which we're watching for
        emailLooksValid = true;
      } else {
        $(this).parent().removeClass('success');
        //set emailLooksValid to false
        emailLooksValid = false;
        $(".register").hide("fast");
      }
    });

    var typingTimer;                //timer identifier
    var doneTypingInterval = 400;  //inactivity time in ms
    var uInput = document.getElementById('email');

//on keyup, start the countdown
    uInput.addEventListener('keyup', () => {
      clearTimeout(typingTimer);
      if (uInput.value) {
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
      }
    });

   /* function register() {
      $(".register").toggle("fast");
    }*/

//user is "finished typing," do something
    function doneTyping() {
      //do something
      if (emailLooksValid === true) {
        console.log('done typing + looks valid');
        // eslint-disable-next-line no-console
        console.log('my state done typing: ' + emailLooksValid);

        //call the backend w/ the email to check if user is registered already
        makeXHRreq('ping', JSON.stringify($("#email").serializeObject()) );

      }
    }

    // usability rules say dont suppress the enter key, and we dont want standard for submit
    $(document).bind('keypress', function (e) {
      if (e.keyCode === 13) {
        // call the doneTyping function
        //we need some error handler / msg
        console.log('user pressed enter');
        if (emailLooksValid === true) {
          doneTyping();
        } else {
          console.log('not a syntactically valid email to submit');
          return false;
        }
      }
    });
  });

  $("#amo").submit(function (e) {
    $("#spinner").show();
    $("#verify_email_bnt").hide();
    e.preventDefault(); // avoid to execute the actual submit of the form.

    makeXHRreq('verify', JSON.stringify($("#email").serializeObject()));

  });


  function successCallBack(returnData){
    // process ajax resp
    //todo add some guards against bad data

    if (returnData.ack === 'new') {
      $('.register').show('fast');
    }

    if (returnData.ack === 'verify'){
      $('.loader').show('fast');

    }
    $('#verify_email_bnt').text(returnData.btntxt); // add id to your button
    $('#dialog_1').text(returnData.dialog_1); // add id to your button
    $('#smalltalk_1').text(returnData.smalltalk_1); // add id to your button
    console.log('returnData: '+ JSON.stringify(returnData));


  }

  function makeXHRreq(restPath, data) {
    $.ajax({
      url: 'http://localhost:8000/'+ restPath, // url where to submit the request
      type: "POST",
      dataType: 'json', // data type
      contentType: 'application/json',
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: data, // post data
      success: successCallBack,
      //todo review error logic and handling for UX
      error: function (xhr, resp, text) {
        console.log('info: ' + xhr, resp, text);
        if (xhr.status === 0){
          alert('I\'m sorry, I can\'t seem to access the internet');
        }
      },
      timeout: 50000 // sets timeout to 5 seconds
    });
  }

  const { browserSupportsWebauthn, startRegistration, startAuthentication } = SimpleWebAuthnBrowser;
  /**
   * A simple way to control how debug content is written to a debug console element
   */


  // Hide the Begin button if the browser is incapable of using WebAuthn
  if (!browserSupportsWebauthn()) {
    console.log('It seems this browser does not support WebAuthn');
  } else {

    /**
     * Registration
     */
    document.querySelector('#verify_email_bnt').addEventListener('click', async () => {

      const resp = await fetch('http://localhost:8000/generate-registration-options');

      let attResp;
      try {
        const opts = await resp.json();
       // printDebug(elemDebug, 'Registration Options', JSON.stringify(opts, null, 2));
        attResp = await startRegistration(opts);
      //  printDebug(elemDebug, 'Registration Response', JSON.stringify(attResp, null, 2));
      } catch (error) {
        if (error.name === 'InvalidStateError') {
          console.log('Error: Authenticator was probably already registered by user');
        } else {
          console.log('error');
        }

        throw error;
      }

      const verificationResp = await fetch('http://localhost:8000/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attResp),
      });

      const verificationJSON = await verificationResp.json();
    //  printDebug(elemDebug, 'Server Response', JSON.stringify(verificationJSON, null, 2));

      if (verificationJSON && verificationJSON.verified) {
      //  elemSuccess.innerHTML = `Authenticator registered!`;
      } else {
    //    elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(verificationJSON,)}</pre>`;
      }
    });

    /**
     * Authentication
     */
/*    document.querySelector('#btnAuthBegin').addEventListener('click', async () => {
      const elemSuccess = document.querySelector('#authSuccess');
      const elemError = document.querySelector('#authError');
      const elemDebug = document.querySelector('#authDebug');

      // Reset success/error messages
      elemSuccess.innerHTML = '';
      elemError.innerHTML = '';
      elemDebug.innerHTML = '';

      const resp = await fetch('/generate-authentication-options');

      let asseResp;
      try {
        const opts = await resp.json();
        printDebug(elemDebug, 'Authentication Options', JSON.stringify(opts, null, 2));
        asseResp = await startAuthentication(opts);
        printDebug(elemDebug, 'Authentication Response', JSON.stringify(asseResp, null, 2));
      } catch (error) {
        elemError.innerText = error;
        throw new Error(error);
      }

      const verificationResp = await fetch('/verify-authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asseResp),
      });

      const verificationJSON = await verificationResp.json();
      printDebug(elemDebug, 'Server Response', JSON.stringify(verificationJSON, null, 2));

      if (verificationJSON && verificationJSON.verified) {
        elemSuccess.innerHTML = `User authenticated!`;
      } else {
        elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
          verificationJSON,
        )}</pre>`;
      }
    })*/;
  }


})(jQuery);


