firebase.auth().onAuthStateChanged( function( user ) {

  if( user ) {
    $( "#EventOwnerText" ).text( user.displayName );
    $( "#SubmitBtn" ).click( submitBtnHandler );
  } else { 
    alert( "You must first sign in" );
    $( "$SubmitBtn" ).click( function() {} );
  }

} );

var submitBtnHandler = function() {

  // Get current user
  var user = firebase.auth().currentUser;

  // Grab values from form
  var eventName = $( "#EventNameInput" ).val();
  var eventLocation = $( "#EventLocationInput" ).val();
  
  // Data object to be sent to database
  var eventData = {
    owner_id: user.uid,
    event_id: false,
    event_name: eventName,
    event_location: eventLocation
  }

  // If valid event name and location
  if( eventName !== "" && eventLocation !== "" ) {

    // Get Firebase Database References
    var userRef = firebase.database().ref( 'users/' + user.uid );
    var eventsRef = firebase.database().ref( "events" );

    // Create a new key for the new event
    var eventID = userRef.child( 'events' ).push().key;
    eventData.event_id = eventID;
    
    // Set the data in the database
    eventsRef.child( eventID ).set( eventData );
    userRef.child( 'events' ).child( eventID ).set( 'true' );
  
    window.location.replace( "/Event/index.html?eventID=" + eventID );

  } // If valid event name and location

} // submitBtnHandler 
