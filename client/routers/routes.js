import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';

// Import custom components
import PrivateRoute from './PrivateRoute';
import RestrictRoute from './RestrictRoute';
import MainLayout from '../components/common/layout/MainLayout';
import NotFound from '../components/error/NotFound';

const AsyncLoginForm = loadable(() => import('../containers/auth/LoginContainer'));
const AsyncSignUpForm = loadable(() => import('../containers/auth/SignUpContainer'));
const AsyncDashboard = loadable(() => import('../containers/dashboard/DashboardContainer'));
const AsyncRepairRequests = loadable(() => import('../containers/repairRequests/RepairRequestContainer'));

const Router = () => (
  <Fragment>
    <Switch>
      <RestrictRoute exact path="/" component={AsyncLoginForm} />
      <RestrictRoute exact path="/signup" component={AsyncSignUpForm} />

      <PrivateRoute exact path="/dashboard" layout={MainLayout} component={AsyncDashboard} />
      <PrivateRoute exact path="/repair-requests" layout={MainLayout} component={AsyncRepairRequests} />

      <Route component={NotFound} />
    </Switch>
  </Fragment>
);

export default Router;
