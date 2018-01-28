firebase.initializeApp(config);

var userStorage = firebase.database().ref("user-storage")


/*
// The following code is for firebase authentication/login
var provider = new firebase.auth.GithubAuthProvider();
/*
ui.start('#firebaseui-auth-container', {
    signInOptions =[
        // List of OAuth providers supported.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID
    ],
    // Other config options...
});


 initApp = function() {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var phoneNumber = user.phoneNumber;
            var providerData = user.providerData;
            user.getIdToken().then(function(accessToken) {
              document.getElementById('sign-in-status').textContent = 'Signed in';
              document.getElementById('sign-in').textContent = 'Sign out';
              document.getElementById('account-details').textContent = JSON.stringify({
                displayName: displayName,
                email: email,
                emailVerified: emailVerified,
                phoneNumber: phoneNumber,
                photoURL: photoURL,
                uid: uid,
                accessToken: accessToken,
                providerData: providerData
              }, null, '  ');
            });
          } else {
            // User is signed out.
            document.getElementById('sign-in-status').textContent = 'Signed out';
            document.getElementById('sign-in').textContent = 'Sign in';
            document.getElementById('account-details').textContent = 'null';
          }
        }, function(error) {
          console.log(error);
        });
      };

      window.addEventListener('load', function() {
        initApp()
});
*/
//Place for our API calls
var api = {
    callNameAPI: function () {
        $.ajax({
            url: "https://wordsapiv1.p.mashape.com/words/" + app.userName,
            data: { "X-Mashape-Key": "KTvKMGaySOmsh75NGO7T8aR3MBbwp1rfNdIjsnwdXomPepANNE" },
            method: "GET",
            beforeSend: function (xhr) { xhr.setRequestHeader('X-Mashape-Key', 'KTvKMGaySOmsh75NGO7T8aR3MBbwp1rfNdIjsnwdXomPepANNE') }
        }).done(function (response) {
            var nameObj = response;
            var definition = nameObj.results[0]["definition"];
            app.textTwo = definition;
            // var p = $("<p>")
            // p.text("Your name means " + definition)
            // $("#results-container").append(p)
        });
    },
    callHistory: function () {

        var queryUrl = "https://cors-anywhere.herokuapp.com/" + "http://history.muffinlabs.com/date/" + app.userDobMonth + "/" + app.userDobDay
        // $.ajaxPrefilter(function (options) {
        //     if (options.crossDomain && jQuery.support.cors) {
        //         options.url = "https://cors-anywhere.herokuapp.com/" + options.url;
        //     }
        // })
        $.ajax({
            url: queryUrl,
            method: "GET"
        }).done(function (response) {
            var returnInfo = JSON.parse(response);
            var x = Math.floor(Math.random() * returnInfo.data.Events.length); //randomizes the response we add to the page (next 2 lines)
            app.text = returnInfo.data.Events[x].text;
            app.yearOccur = returnInfo.data.Events[x].year;
            if (app.text.indexOf(":") > -1) {
                app.text = app.text.split(":");
                app.text = app.text[1];
            }
            //Typing animation
            if (app.typeWriterTimeout != ""){
                clearTimeout(app.typeWriterTimeout);
                $("#results-container").empty();
            };
            app.letterCount = 0;
            app.fullMessage = ("Hi " + app.userName + ", In the year " + app.yearOccur + " on the day you were born, " + app.text)
            app.typeAnimation();
        })
    }
}
//app object stores application functions and variables
var app = {
    userName: "",
    userDob: "",
    userDobDay: "",
    userDobMonth: "",
    userDobYear: "",
    text: "",
    textTwo: "",
    textTwoAdded: false,
    fullMessage: "",
    typeWriterTimeout: "",
    letterCount: 0,
    //animates page with answer
    typeAnimation: function () {
        if (app.letterCount === app.fullMessage.length) {
            console.log("I'm done!")
            if (app.textTwo != "" && app.textTwoAdded === false){ //if we have received a response from Words API
                app.addSecondText(); //add its text to our results using this function
            };
        }
        else {
            var character = app.fullMessage.charAt(app.letterCount);
            var information = $("#results-container").text();
            $("#results-container").text(information + character);
            app.letterCount++;
            app.typeWriterTimeoutFunction();
        }
    },
    typeWriterTimeoutFunction: function () {
        var speed = 50;
        app.typeWriterTimeout = setTimeout(app.typeAnimation, speed);
    },
    addSecondText: function (){
        app.letterCount = 0;
        clearTimeout(app.typeWriterTimeout);
        app.fullMessage = "Your name means " + app.textTwo + ".";
        app.textTwoAdded = true; //prevents an endless loop from the logic above in typeAnimation()
        app.typeAnimation(); //appends to date in history
    }
};

  userStorage.on("child_added",function(snapshot){
        var p = $("<p>");
        p.text(snapshot.val().name + " " + snapshot.val().dobMonth + "/" + snapshot.val().dobDay + "/" + snapshot.val().dobYear);
        p.attr("class", "user-button");
        p.attr("name", snapshot.val().name);
        p.attr("day",snapshot.val().dobDay);
        p.attr("month",snapshot.val().dobMonth);
        $("#button-container").append(p);
    },
    function(errData){
        console.log("Unable to retreive data");
    }
)

$(document).delegate(".user-button","click",function(){
    $("#results-container").empty();
    app.userName = $(this).attr("name");
    app.userDobDay = $(this).attr("day");
    app.userDobMonth = $(this).attr("month");
    api.callHistory();
    api.callNameAPI();
})

document.onkeydown = function(event){
    if(event.which === 13){
        $("#results-container").empty();
        app.userName = $("#name-input").val().trim();
        app.userDob = $("#date").val();
        app.userDobDay = app.userDob.substring(app.userDob.length - 2);
        app.userDobMonth = app.userDob.substring(5, 7);
        app.userDobYear = app.userDob.substring(0, 4);

        userStorage.push({
            name: app.userName,
            dobDay: app.userDobDay,
            dobMonth: app.userDobMonth,
            dobYear: app.userDobYear
        })
        
        api.callHistory();
        api.callNameAPI();

    }
}