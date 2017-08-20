var loaded = {};

firebase.auth().onAuthStateChanged( function( user ) {

  if( user ) {
  
    var uid = user.uid;
    var userEventsRef = firebase.database().ref( "/users/" + uid + "/events" );
    userEventsRef.once( "value", function( snapshot ) {
      
      snapshot.forEach( function( childSnapshot ) {
        
        var eventID = childSnapshot.key;
        var eventDriverPath = "/events/" + eventID + "/drivers";
        var eventDriverRef = firebase.database().ref( eventDriverPath ); 

        console.log( "Adding listener path: " + eventDriverPath );

        eventDriverRef.once( "value", function( s ) {
          loaded[ eventID ] = true;
        } );

        eventDriverRef.on( 'child_added', function( data ) {
          newDriveOffer( eventID, data );
        } );

      } );

    } );
  
    var userDrivePath = "/users/" + uid + "/drive";
    var userDriveRef = firebase.database().ref( userDrivePath );
    userDriveRef.on( "child_changed", driveOfferStateChange );
    userDriveRef.on( "child_removed", driveOfferRemoved );
  }

} );

var newDriveOffer = function( eventID, data ) {

  if( !loaded[ eventID ] )
    return;

  alert( "newDriveOffer: " + eventID );
  console.log( "New drive offer for '" + eventID + "':" );
  console.log( data );

}

var driveOfferStateChange = function( data ) {
  
  var eventPath = '/events/' + data.key;
  var eventRef = firebase.database().ref( eventPath );
  eventRef.once( "value", function( snapshot ) {
    var eventName = snapshot.val().event_name;
    
    console.log( "Listen for " + eventName );
    console.log( data.val() );

    if( data.val() ){
      alert( "Your offer to drive for '" + eventName + "' has been accepted!" );
    } else {
      alert( "Your offer to drive for '" + eventName + "' has been removed." );
    }

  } );
  
}

var driveOfferRemoved = function( data ) {

  var eventPath = '/events/' + data.key;
  var eventRef = firebase.database().ref( eventPath );
  eventRef.once( "value", function( snapshot ) {
    var eventName = snapshot.val().event_name;
 
    alert( "Your offer to drive for '" + eventName + "' has been removed." );
  } );
}
