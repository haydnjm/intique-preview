/*
*
* Renders the correct interaction given the
* route that the user is at in the dashboard
* location: client\src\components\interactions 
*
*/

import React from 'react';
import DeliveryQuote from './delivery_quote/DeliveryQuote';
import Conversation from './conversation/Conversation';
import Offer from './offer/Offer';
import Order from './order/Order';
import Return from './return/Return';

import {
  CONVERSATION,
  OFFER,
  DELIVERY_QUOTE,
  ORDER,
  RETURN
} from '../../constants/interactions/interactionTypes';

const Interaction = ({
  interaction,
  important,
  openTab,
  openWithDetails,
  details,
  editTab,
  editDetails,
  index,
  active,
  noTab,
}) => {
  switch (interaction.type) {
  case CONVERSATION:
    return <Conversation
      interaction={interaction}
      openTab={openWithDetails}
      details={details}
      editTab={editTab}
      editDetails={editDetails}
      active={active}
      index={index}
      noTab={noTab}
    />;

  case OFFER:
    return <Offer
      interaction={interaction}
      important={important}
      openTab={openTab}
      editTab={editTab}
      active={active}
      index={index}
      noTab={noTab}
    />;

  case DELIVERY_QUOTE:
    return <DeliveryQuote
      interaction={interaction}
      important={important}
      openTab={openTab}
      editTab={editTab}
      active={active}
      index={index}
      noTab={noTab}
    />;

  case ORDER:
    return <Order
      interaction={interaction}
      important={important}
      openTab={openTab}
      editTab={editTab}
      active={active}
      index={index}
      noTab={noTab}
    />;

  case RETURN:
    return <Return
      interaction={interaction}
      important={important}
      openTab={openTab}
      editTab={editTab}
      active={active}
      index={index}
      noTab={noTab}
    />;

  default:
    return <h3>Message not found!</h3>;
  }
};

export default Interaction;
