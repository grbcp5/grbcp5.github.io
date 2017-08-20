var facebookAuthProvider;

var writeUserData = function( uid, fbid, name ) { 

  firebase.database().ref( 'users/' + uid ).set( {
    'uid': uid,
    'facebook': {
      'id': fbid,
      'name': name
    }
  } );

}

var changeInfoBasedOnSignIn = function( curUser ) {
  if ( curUser ) {
      $( "#SignInText" ).text( curUser.displayName ); 

      console.log( "current user:" );
      console.log( curUser );
      curUser.providerData.forEach(function (profile) {
    console.log("Sign-in provider: "+profile.providerId);
    console.log("  Provider-specific UID: "+profile.uid);
    console.log("  Name: "+profile.displayName);
    console.log("  Email: "+profile.email);
    console.log("  Photo URL: "+profile.photoURL);

    var userId = curUser.uid;
    firebase.database().ref( '/users/' + userId ).once( 'value' ).then( function( snapshot ) {
      if( !snapshot.val() ) {
        var uid = curUser.uid;
        var fbid = curUser.providerData[0].uid;
        var name = curUser.displayName;

        writeUserData( uid, fbid, name);        
      }
    } );
  } );
    } else {
      $( "#SignInText" ).text( "Sign In" );
    }
}

$( document ).ready( function() {

  facebookAuthProvider = new firebase.auth.FacebookAuthProvider();
  facebookAuthProvider.addScope( 'public_profile' );

  var curUser = firebase.auth().currentUser;
  changeInfoBasedOnSignIn( curUser );
  $.getScript( "/js/listen.js" );

} );

firebase.auth().onAuthStateChanged( function( user ) {

  changeInfoBasedOnSignIn( user );

} );

$( "#SignInButton" ).click( function() {

  if( firebase.auth().currentUser ) {
    window.location.replace( "/Profile" );
    return;
  }

  firebase.auth().signInWithRedirect( facebookAuthProvider ).then( function( result ) {
  
    console.log( "Cur User:" );
    console.log( result.user );
    console.log( "Credential:" );
    console.log( result.credential );

  } ).catch( function( err ) {

    console.log( err );
    alert( "An error occered while authenticating" );
    alert( err.message );

  } );

} );
