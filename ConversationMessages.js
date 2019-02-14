/*
*
* Renders the list of messages for specific thread
* location: client\src\components\interactions\conversation
*
*/

import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import axios from 'axios';
import {
  createStatus,
} from '../../../actions/InfoActions';

import uploadS3Photos from '../../../services/S3/uploadS3Photos';
import loadPhotoDataIntoState from '../../../services/photo_services/loadPhotoDataIntoState';
import { INTERACTIONS_BUCKET } from '../../../constants/S3';
import IMG_TYPES from '../../../constants/ProductImageTypes';

import Messages from './Messages';
import Media from './Media';

const Container = styled.div`
  background-color: #ccc;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
  padding: 10px;
  display: flex;
  justify-content: space-between;

  @media(max-width: 600px) {
    display: block;
  }
`;

class ConversationMessages extends Component {

  state = {
    photoDatas: [],
    photoKeys: [],
    message: '',
    loading: false,
  };

  submitMessage = () => {
    const {
      interactionID,
      index,
      editTab,
      editDetails,
      createStatus,
    } = this.props;
    const {
      photoKeys,
      photoDatas,
      message
    } = this.state;

    this.setState({ message: '', photoKeys: [], loading: true});

    const reply = () => {
      axios.put(
        '/api/interactions/conversations/reply',
        { interactionID, message, photoKeys }
      ).then(({ data: { messages, photos, ...rest } }) => {
        editTab(index, rest, index);
        editDetails({messages: messages, photos: photos});
        this.setState({ loading: false });
      }).catch(({ response: { data } }) =>
        createStatus({
          type: 'error',
          message: data,
        }));
    };

    if (photoDatas.length > 0) {
      this.setState({loading: true});
      uploadS3Photos({
        data: photoDatas,
        photoKeys: _.map(photoKeys, p =>`enquiries/${this.props.interactionID}/${p}`),
        bucket: INTERACTIONS_BUCKET,
      }).then(() => reply());
    } else {
      reply();
    }

  }

  handlePhotoChange = ({ target: { files } }) => {
    const filteredFiles = _.filter(files, file => IMG_TYPES.includes(file.type));
    this.setState({
      photoKeys: _.map(filteredFiles, f => `${f.name}`),
      photoDatas: [],
    });
    const loadIntoState = (obj) => this.setState({ photoDatas: obj.photos });
    loadPhotoDataIntoState(filteredFiles, loadIntoState);
  }

  changeMessage = (e) => this.setState({ message: e.target.value });

  render() {

    const {
      messages,
      photos,
      fromName,
      toName,
      reader,
      interactionID
    } = this.props;

    const {
      photoKeys,
      message,
      loading
    } = this.state;

    return (
      <Container>
        <Messages
          messages={messages}
          changeMessage={this.changeMessage}
          submitMessage={this.submitMessage}
          message={message}
          fromName={fromName}
          toName={toName}
          reader={reader}
          photoKeys={photoKeys}
          handlePhotoChange={this.handlePhotoChange}
          loading={loading}
        />
        <Media
          currentPhotos={photos}
          interactionID={interactionID}
        />
      </Container>
    );
  }
}

ConversationMessages.propTypes = {
  interactionID: PropTypes.string,
  reader: PropTypes.string,
  messages: PropTypes.array,
  photos: PropTypes.array,
  toName: PropTypes.string,
  fromName: PropTypes.string,
  editTab: PropTypes.func,
  editDetails: PropTypes.func,
  index: PropTypes.number,
  createStatus: PropTypes.func,
};

export default connect(null, { createStatus })(ConversationMessages);
