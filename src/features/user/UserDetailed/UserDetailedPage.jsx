import React, {Component} from 'react';
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty } from 'react-redux-firebase'
import { compose } from 'redux'
import { Grid } from "semantic-ui-react";
import UserDetailedHeader from './UserDetailedHeader'
import UserDetailedAboutMe from './UserDetailedAboutMe'
import UserDetailedPhotos from './UserDetailedPhotos'
import UserDetailedEvents from './UserDetailedEvents'
import UserDetailedSideBar from './UserDetailedSideBar'
import { userDetailedQuery } from '../userQueries'
import LoadingComponent from '../../../app/layout/LoadingComponent'

const mapState = (state,ownProps) => {
  let userUid = null;
  let user = {};

  if(ownProps.match.params.id === state.auth.uid){
    user = state.firebase.profile
  } else {
    user = !isEmpty(state.firestore.ordered.profile) && state.firestore.ordered.profile[0];
    userUid = ownProps.match.params.id;
  }
  return {
    auth: state.firebase.auth,
    user,
    userUid,
    photos: state.firestore.ordered.photos,
    requesting: state.firestore.status.requesting
  }
};

class UserDetailedPage extends Component {

    render() {
        const { user, photos, auth, match, requesting } = this.props;
        const isCurrentUser = auth.uid === match.params.id;
        const loading = Object.values(requesting).some(a => a === true);
        if(loading)  return <LoadingComponent inverted={true} />

        return (
            <Grid stackable>
                <UserDetailedHeader user={user} />
                <UserDetailedAboutMe  user={user} />
                <UserDetailedSideBar isCurrentUser={isCurrentUser} />
                {photos && photos.length > 0 &&
                <UserDetailedPhotos photos={photos}/>}
                <UserDetailedEvents />
            </Grid>
        );
    }
}


export default compose(
    connect(mapState, null),
    firestoreConnect((auth, userUid) => userDetailedQuery(auth,userUid))
)(UserDetailedPage);