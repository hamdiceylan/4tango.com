import React, { Component } from 'react';
import {Container} from 'semantic-ui-react';
import { Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable'
import EventDashboard from '../../features/events/EventDashboard/EventDashboard';
import NavBar from '../../features/nav/NavBar/NavBar';
import EventForm from '../../features/events/EventForm/EventForm';
import SettingsDashboard  from '../../features/user/Settings/SettingsDashboard';
import UserDetailedPage  from '../../features/user/UserDetailed/UserDetailedPage';
import PeopleDashboard  from '../../features/user/PeopleDashboard/PeopleDashboard';
import EventDetailedPage  from '../../features/events/EventDetailed/EventDetailedPage';
import ModalManager from '../../features/modals/modalManager'
import NotFound from './NotFound'
import LoadingComponent from './LoadingComponent';

const AsyncHomePage = Loadable({
  loader: () => import('../../features/home/HomePage'),
  loading: LoadingComponent

})

class App extends Component {
  render() {
    return (
      <div>
        <ModalManager />
        <Switch>
          <Route exact path='/' component={AsyncHomePage}/>
        </Switch>

        <Route 
          path="/(.+)"
          render ={() => (
            <div>
              <NavBar/>
              <Container className="main">
              <Switch>
                  <Route path='/events' component={EventDashboard}/>
                  <Route path='/event/:id' component={EventDetailedPage}/>
                  <Route path='/manage/:id' component={EventForm}/>
                  <Route path='/people' component={PeopleDashboard}/>
                  <Route path='/profile/:id' component={UserDetailedPage}/>
                  <Route path='/settings' component={SettingsDashboard}/>
                  <Route path='/createEvent' component={EventForm}/>
                  <Route path='/events' component={EventDashboard}/>
                  <Route path='/error' component={NotFound}/>
                </Switch>
              </Container>
            </div>
          )}
          />
      </div>

    );
  }
}

export default App;


