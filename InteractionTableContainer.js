/*
*
* Sellers on the platform have a dashboard that they use to
* manage their items, orders, offers etc. They have a number
* of ways of interacting with buyers, we call these 'Interactions'.
* This container holds the logic for rendering various tables of
* interactions.
* location: client\src\containers\interactions
*
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import axios from 'axios';

import {
  createStatus,
  clearStatus,
} from '../../actions/InfoActions';
import {
  setNotification
} from '../../actions/NotificationsActions';

import TableHeader from '../../components/interactions/headers/TableHeader';
import Interaction from '../../components/interactions/Interaction';
import Loading from '../../components/common/Loading';

class InteractionTableContainer extends Component {

  state = {
    interactions: null,
    page: 1,
    activeTab: null,
    details: null,
    responding: null,
  };

  componentDidMount = () =>
    axios.get(`${this.props.typeEndpoint}/${this.state.page}`)
      .then(({ data }) => this.setState({ interactions: data }))
      .catch(({ response: { data } }) => createStatus({
        type: 'error',
        message: data,
      }));

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.interactions !== prevState.interactions && prevState.interactions !== null) {
      const { id } = this.props;

      const newNotifications = _.reduce(this.state.interactions, (a, c) => {
        if (c.requiresActionFrom === id) return a + 1;
        else if (
          ((c.status === 'SENDER' && id === c._to) ||
          (c.status === 'RECEIVER' && id === c._from)) &&
          c.opened === false
        ) return a + 1;
        else return a;
      }, 0);

      this.props.setNotification({ type: this.props.type, newNotifications });

    }
  }

  openTab = (tab) => this.setState({ activeTab: tab });

  editDetails = (data) => this.setState({ details: Object.assign({}, this.state.details, data) });

  editTab = (index, newTab, tab) =>
    this.setState({
      interactions: [
        ...this.state.interactions.slice(0, index),
        newTab,
        ...this.state.interactions.slice(index + 1),
      ],
      activeTab: tab,
    });

  openWithDetails = (endpoint, index) => {
    if (index === null) {
      this.setState({ details: null, activeTab: null });
    } else {
      axios.get(
        `/api/interactions/${endpoint}`
      ).then(({ data }) => {
        this.setState({
          details: data,
          activeTab: index,
          interactions: [
            ...this.state.interactions.slice(0, index),
            { ...this.state.interactions[index], opened: true },
            ...this.state.interactions.slice(index + 1),
          ],
        });
      })
        .catch(({ response: { data } }) => createStatus({
          type: 'error',
          message: data,
        }));
    }
  };

  render() {

    const { interactions } = this.state;
    const { type } = this.props;

    return (
      <div>
        <TableHeader type={type} />
        {
          interactions === null ?
            <Loading /> :
            interactions && interactions.length < 1 ?
              <h3>You have no messages</h3> :
              this.renderTabs(interactions)
        }
      </div>
    );
  }

  renderTabs = (interactions) => _.map(interactions, (interaction, i) => {
    return (
      <Interaction
        key={interaction._id}
        interaction={interaction}
        important={
          interaction.reader === 'SENDER' ?
            interaction.requiresActionFrom === interaction._from || interaction.unreadMessagesTo === interaction._from :
            interaction.requiresActionFrom === interaction._to || interaction.unreadMessagesTo === interaction._to
        }
        openTab={this.openTab}
        openWithDetails={this.openWithDetails}
        editTab={this.editTab}
        editDetails={this.editDetails}
        active={this.state.activeTab === i}
        details={this.state.activeTab === i ? this.state.details : null}
        index={i}
      />
    );
  });
}

InteractionTableContainer.propTypes = {
  typeEndpoint: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  notifications: PropTypes.object,
  setNotification: PropTypes.func,
};

const mapStateToProps = ({ notifications }) => ({ notifications });

export default connect(mapStateToProps, {
  createStatus,
  clearStatus,
  setNotification
})(InteractionTableContainer);
