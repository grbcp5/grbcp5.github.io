/******************************************************************************
 * 
 * File:
 *   Profile/profile.js
 * 
 * Author:
 *   Grant Broadwater
 * 
 * Description:
 *   Script file for managing Profile/index.html content
 *
 ******************************************************************************/

/******************************************************************************
 * setProfileCard - Fills the profile card with the corect information
 ******************************************************************************/
var setProfileCard = function( user ) {
  var fb_id = user.providerData[0].uid; 
 
  // Use facebook graph api to get larger profile picture
  var imageUrl
    = "http://graph.facebook.com/" + fb_id + "/picture?height=500";
  $('#ProfileCardTitle').css('background-image', 'url(' + imageUrl + ')');

  // Set Profile cards name
  $( "#profile_name_lbl" ).text( user.displayName );
  
  // Set link to direct to users facebook profile
  $( "#profile_link_btn" ).click( 
  function() {
    window.location.replace( "http://facebook.com/" + fb_id ); 
  } );
  
  // When user logs out, update auth and redirect to homescreen
  $( "#log_out_btn" ).click( 
  function() {
    firebase.auth().signOut().then( function() {
      window.location.replace( "./" );
    } );
  } );

} // setProfileCard

var acceptDriveOffer = function( driverUID, eventID ) {

    var updates = {};
    updates[ '/users/' + driverUID + '/drive/' + eventID ] = true;
    updates[ '/events/' + eventID + '/drivers/' + driverUID ] = 1;

    firebase.database().ref().update( updates );
   
}

var declineDriveOffer = function( driverUID, eventID ) {
  var updates = {};

  updates[ '/users/' + driverUID + '/drive/' + eventID ] = null;
  updates[ '/events/' + eventID + '/drivers/' + driverUID ] = null;

  return firebase.database().ref().update( updates );

}

var removeDriver = function( driverUID, eventID ) {
  var updates = {};

  updates[ '/users/' + driverUID + '/drive/' + eventID ] = null;
  updates[ '/events/' + eventID + '/drivers/' + driverUID ] = null;

  return firebase.database().ref().update( updates );
}

/*****************************************************************************
 * Note: Database Structure:
 * 
 * root:
 *   + events:
 *       + eventID: <----- All evens by EVERY user
 *           - eventID
 *           - event_location
 *           - event_name
 *           - owner_id
 *   + users:
 *       + uid <----- All users
 *           + events:
 *               - eventID: true <------ All events by THIS user
 *           + facebook: 
 *               - id
 *               - name
 *           - uid
 *
 * Because only the events eventID is stored under the users entry, to access
 * that events data, a reference to the events
 *
 *****************************************************************************/

/******************************************************************************
 * setEventCards - Creates and fills each event card owned by the user 
 ******************************************************************************/
var setEventCards = function( user ) {

  var next = true;

  // Set the width of each card
  var wid = $( '#ProfileCardTitle' ).width();
  $( '.mdl-card__title' ).css( { 'height': wid + 'px' } );

  // Get all events owned by the user
  var queryRef = "users/" + user.uid + "/events/";
  var query = firebase.database().ref( queryRef ).orderByKey();
  query.once("value").then(function(snapshot) {
    
    // For each event under the current user
    snapshot.forEach(function(childSnapshot) {
   
      // Get key ( eventID ) for current event
      var key = childSnapshot.key;

      // childData will be the actual contents of the child
      var eventRef = firebase.database().ref( 'events/' + key );

      // Load event data from data base
      eventRef.once( "value" ).then( function( snapshot ) {

           while( !next ) {
              
            }
            next = false;



        var eventID = snapshot.child( 'event_id' ).val();

        // Create visual elements
        var $mdlCell6 = $( "<div>", 
            { "class":"owned-event-cell mdl-cell mdl-cell--6-col" } );
        var $demoCardWide = $( "<div>", 
            { "class":"demo-card-wide mdl-card mdl-shadow--2dp" } );
        var $ownedEventTitle = $( "<div>", 
            { "class":"event_title mdl-card__title" } );
        var $titleText = $( "<h2>", 
            { "class":"mdl-card__title-text" } );
        var $supportingText = $( "<div>", 
            { "class":"mdl-card__supporting-text" } );
        var $cardActions = $( "<div>", 
            { "class":"mdl-card__actions mdl-card--border" } );
        var $viewEventLink = $( "<a>", 
            { "class":"mdl-button mdl-button--colored mdl-js-button " 
              + "mdl-js-ripple-effect", 
              "href":"/Event/index.html?eventID=" + eventID } );

        // Populate & nest visual elements
        $titleText.text( snapshot.child( 'event_name' ).val() );
        $ownedEventTitle.append( $titleText );
        $ownedEventTitle.css( {'height':wid+'px' } );
        $demoCardWide.append( $ownedEventTitle );
        $supportingText.text( "Location: " 
                              + snapshot.child( 'event_location' ).val() );
        $demoCardWide.append( $supportingText );
        $viewEventLink.text( "View Event" );
        $cardActions.append( $viewEventLink );
        $demoCardWide.append( $cardActions );
        $mdlCell6.html( $demoCardWide );

        var $eventDriversDiv = $( "<div>", {"id":"drivers"+eventID });
       
        // Add visual elements to document
        $mdlCell6.insertBefore( "#CreateNewEventCell" );
        $eventDriversDiv.insertBefore( "#CreateNewEventCell" );

        // Add visual elements for drivers for each event
        var eventDriversPath = "/events/" + eventID + "/drivers";
        var eventDriversRef = firebase.database().ref( eventDriversPath );
        eventDriversRef.once( "value" , function( eventDriversSnapshot ) {
          eventDriversSnapshot.forEach( function( eventDriverSnap ) {
            
            var driverUID = eventDriverSnap.key;
            var driveOfferAccepted = eventDriverSnap.val();

            var driverPath = "/users/" + driverUID;
            console.log( "Driver path: " + driverPath );
            var driverRef = firebase.database().ref( driverPath );
            driverRef.once( "value", function( driverSnap ) {
             
              if( driverSnap.val() === null )
                return;

              console.log( "Driver: " );
              console.log( driverSnap.val() );
              var driverName = driverSnap.val().facebook.name;
              var driverFBID = driverSnap.val().facebook.id;

        var $driverCell= $( "<div>", 
            { "class":"owned-event-cell mdl-cell mdl-cell--6-col" } );
        var $driverCardWide = $( "<div>", 
            { "class":"demo-card-wide mdl-card mdl-shadow--2dp" } );
        var $driverSupportingText = $( "<div>", 
            { "class":"mdl-card__supporting-text" } );
        var $driverCardActions = $( "<div>", 
            { "class":"mdl-card__actions mdl-card--border" } );
        var $ViewDriverLink = $( "<a>", 
            { "class":"mdl-button mdl-button--colored mdl-js-button " 
              + "mdl-js-ripple-effect",
              "href":"http://facebook.com/" + driverFBID,
              "id":"viewDriver" + driverUID } );
        var $AcceptDriverLink = $( "<a>", 
            { "class":"mdl-button mdl-button--colored mdl-js-button " 
              + "mdl-js-ripple-effect", 
              "id":"acceptDriveFor" + eventID + "From" + driverUID } );
        var $DeclineDriverLink = $( "<a>", 
            { "class":"mdl-button mdl-button--accent mdl-js-button " 
              + "mdl-js-ripple-effect", 
              "id":"declineDriveFor" + eventID + "From" + driverUID } );
         var $RemoveDriverLink = $( "<a>", 
            { "class":"mdl-button mdl-button--accent mdl-js-button " 
              + "mdl-js-ripple-effect", 
              "id":"removeDriveFor" + eventID + "From" + driverUID } );
        
              // Populate & nest
              if( !driveOfferAccepted ) {
              
             $driverSupportingText.text( driverName + " is offering to drive for " + snapshot.child( 'event_name' ).val() + "." );
              } else {
                $driverSupportingText.text( driverName + " is driving for " + snapshot.child( 'event_name' ).val() + "." );
              }
              $driverCardWide.append( $driverSupportingText );

              $ViewDriverLink.text( "View Facebook Profile" );
              $driverCardActions.append( $ViewDriverLink ); 

              if( !driveOfferAccepted ) {

              $AcceptDriverLink.text( "Accept Offer" );
              $AcceptDriverLink.click( function() {
                acceptDriveOffer( driverUID, eventID );
                location.reload();
              } );
              $driverCardActions.append( $AcceptDriverLink );
              $DeclineDriverLink.text( "Decline Offer" );
              $DeclineDriverLink.click( function() {
                declineDriveOffer( driverUID, eventID );
                location.reload();
              } );
              $driverCardActions.append( $DeclineDriverLink );

              } else {
                
                $RemoveDriverLink.text( "Remove Driver" );
                $RemoveDriverLink.click( function() {
                  removeDriver( driverUID, eventID );
                  location.reload();
                } );
                $driverCardActions.append( $RemoveDriverLink );

              }

              $driverCardWide.append( $driverCardActions );
              $driverCell.html( $driverCardWide );
              $driverCell.insertBefore( "#drivers" + eventID );
            } );
          } );
        } );
        next = true;


      } ); // eventRef 

    } ); // for each child
    
  } ) ; // query.once
  
} // setEventCards

$( document ).ready( function() {

  firebase.auth().onAuthStateChanged( function( user ) {

    if( user ) {
      
      setProfileCard( user );

      setEventCards( user );

    } else {
      
      alert( "User Not Logged in" );
    
    } 
  
  } );

} );


