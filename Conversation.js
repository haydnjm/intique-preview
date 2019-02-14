/*
*
* A 'conversation' is a basic message thread between
* two users of the platform, it can container both
* text and images (of types PNG and JPEG)
* location: client\src\components\interactions\conversation
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import ConversationTab from './ConversationTab';
import ConversationMessages from './ConversationMessages';

const Conversation = ({
  interaction,
  openTab,
  details,
  editTab,
  editDetails,
  active,
  index,
  noTab,
}) =>
  <div>
    {
      !noTab &&
      <ConversationTab
        interaction={interaction}
        openTab={openTab}
        active={active}
        index={index}
      />
    }
    {
      active && <ConversationMessages
        interactionID={interaction._id}
        reader={interaction.reader}
        messages={details.messages}
        photos={details.photos}
        fromName={interaction.fromName}
        toName={interaction.toName}
        editTab={editTab}
        editDetails={editDetails}
        index={index}
      />
    }
  </div>;

Conversation.propTypes = {
  interaction: PropTypes.object,
  openTab: PropTypes.func,
  details: PropTypes.object,
  editTab: PropTypes.func,
  editDetails: PropTypes.func,
  active: PropTypes.bool,
  index: PropTypes.number,
  noTab: PropTypes.bool,
};

export default Conversation;
