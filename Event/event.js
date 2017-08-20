var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

$( document ).ready( function() {
 
  var eventID = getUrlParameter( "eventID" );
  var eventRef = firebase.database().ref( "/events/" + eventID );

  // Set the width of each card
  var wid = $( '.event_title' ).width();
  $( '.mdl-card__title' ).css( { 'height': wid + 'px' } );
  console.log( "wid: " + wid );

  eventRef.once( "value" ).then( function( snapshot ) {
    var e = snapshot.val();
    
    if( !e ) {
      window.location.replace( "/FindEvents/" );
    }

    var linkText = "http://volta.ddns.net/Event/index.html?eventID=" + eventID;
    $( "#eventLinkText" ).text( 'Event Link' );
    $( "#eventLinkText" ).attr( 'href', linkText );
    $( "#eventTitle" ).text( e.event_name );
    $( "#locationText" ).text(  e.event_location );
  } );

} );

var disableRideBtnIfNoDrivers = function( eventID ) {

  var eventRef = firebase.database().ref( "/events/" + eventID + "/drivers" );

  eventRef.orderByValue().limitToLast( 1 ).once( "value" , function( snapshot ) {
    
    if( !snapshot.val() || !Object.values( snapshot.val() )[0] ) {
      $( "#requestRideBtn" ).prop( "disabled", true );
    }

  } );

  return false;
}

var requestRideHandler = function( user, eventID ) {

  
     
}

var offerDriveHandler = function( user ) {

  var uid = firebase.auth().currentUser.uid;
  var eventID = getUrlParameter( "eventID" );
  var userRef = firebase.database().ref( "/users/" + uid );
  var eventRef = firebase.database().ref( "/events/" + eventID );

  try {

    userRef.child( 'drive' ).child( eventID ).once( "value" ).then( function( snapshot ) {
    
      if( snapshot.val() !== null ) {
        alert( "You have already offered to drive for this event" );
        return;
      }

      userRef.child( 'drive' ).child( eventID ).set( false );
      eventRef.child( 'drivers' ).child( uid ).set( false );
    
      alert( "You have offered to drive for this event\n\n" + 
             "Check your profile page to check your driver status" );
      location.reload(); 
   } );

  } catch ( e ) {
    alert( "There was an error in offering to ride" ); 
  }

}

var mustSignIn = function() {

  alert( "You must first sign in to comlete this action" );
}

var addDrivers = function( user ) {

}

var deleteEventCallback = function() {
  var eventID = getUrlParameter( "eventID" );
  var userID = firebase.auth().currentUser.uid;

  var shouldDelete = confirm( "Are you sure you want to delete this event?" );

  if( shouldDelete ) {
    firebase.database().ref( "/events/" + eventID ).remove();
    firebase.database().ref( "/users/" + userID + "/events/" + eventID ).remove();

    window.location.replace( "/" );
  }

}

var editEventCallback = function() {
  alert( "Edit event" );
}

var addOwnerButtons = function( user ) {

  var regBtnClass = "mdl-button--colored";
  var delBtnClass = "mdl-button--accent";

  var eventID = getUrlParameter( "eventID" );
  var btnData = [
  { "id":"editEventBtn", "text":"Edit", "callback":editEventCallback},
  { "id":"deleteEventBtn", "text":"Delete", "callback":deleteEventCallback}
  ];


  for( var i = 0; i < btnData.length; i++ ) {

  var $mdlCell6 = $( "<div>",
      { "class" : "mdl-cell mdl-cell--6-col" } );
  var $btnContainer = $( "<div>",
      { "class" : "btn-container" } );
  var $btn = $( "<button>",
      { "class" : "mdl-button mdl-js-button mdl-button--raised " 
      + "mdl-js-ripple-effect event-btn "
      + ( i === btnData.length - 1 ? delBtnClass : regBtnClass ),
        "id" : btnData[ i ].id } );
  $btn.text( btnData[ i ].text );
  $btn.click( btnData[ i ].callback );
 
  $btnContainer.append( $btn );
  $mdlCell6.append( $btnContainer );
  $( "#layoutGrid" ).append( $mdlCell6 );
  }

}

firebase.auth().onAuthStateChanged( function( user ) {

  var eventID = getUrlParameter( "eventID" );
  var eventRef = firebase.database().ref( "/events/" + eventID ); 
  var userRef = firebase.database().ref( "/users/" + user.uid );
 
  if( user ) { 
  
    $( "#requestRideBtn" ).click( 
    function(){
      requestRideHandler( user, eventID );
    } );

    disableRideBtnIfNoDrivers( eventID );

    userRef.child( 'drive' ).child( eventID ).once( "value" ).then( function( snapshot ) {
   
      console.log( "Snapshot" + snapshot.val() );
      if( snapshot.val() !== null ) {
        $( "#offerDriveBtn" ).prop( "disabled", true );
     } else {
        $( "#offerDriveBtn" ).prop( "disabled", false );
        $( "#offerDriveBtn" ).text( "Offer to drive" );
        $( "#offerDriveBtn" ).click(
        function() {
          offerDriveHandler( user );
        } );
      }

    } );
  

    eventRef.once( "value" ).then( function( snapshot ) {
    
      var eventOwnerID = snapshot.val().owner_id;

      if( user.uid == eventOwnerID ) {
        addOwnerButtons( user );
        addDrivers( user );
      }
      
    } );

  } else {
    $( "#requestRideBtn" ).click( mustSignIn );
    $( "#offerDriveBtn" ).click( mustSignIn );
  }

} );


