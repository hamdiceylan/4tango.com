import React from 'react'
import { Grid } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Switch, Route, Redirect } from 'react-router-dom'
import SettingNav from './SettingsNav'
import BasicPage from './BasicPage'
import AboutPage from './AboutPage'
import PhotosPage from './PhotosPage'
import AccountPage from './AccountPage'
import { updatePassword } from '../../auth/authActions'
import { updateProfile } from '../userActions'

const actions = {
  updatePassword,
  updateProfile
}
const mapState = (state) => ({
  providerId: state.firebase.auth.providerData[0].providerId,
  user: state.firebase.profile
})

function SettingsDashboard({updatePassword, providerId, user, updateProfile}) {
  return (
    <Grid stackable>
      <Grid.Column width={12}>
        <Switch>
          <Redirect exact from='/settings' to='settings/basic'/>
          <Route 
            path='/settings/basic' 
            render={() => <BasicPage initialValues={user} updateProfile={updateProfile} />}
          />
          <Route 
            path='/settings/about' 
            render={() => <AboutPage initialValues={user} updateProfile={updateProfile} />} 
          />
          <Route path='/settings/photos' component={PhotosPage}/>
          <Route 
            path='/settings/account' 
            render={() => <AccountPage updatePassword={updatePassword} providerId={providerId} />} 
          />
        </Switch>
      </Grid.Column>
      <Grid.Column width={4}>
        <SettingNav/>
      </Grid.Column>
    </Grid>
  )
}

export default connect(mapState,actions)(SettingsDashboard)
