/*
*
* Render search suggestions based on current
* search query
* location: client\src\components\search
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import _ from 'lodash';

import { paleGrey, mediumGrey, mediumLightGrey } from '../../styles/colours';

const Container = styled.div`
  position: absolute;
  top: ${p => p.size ? '55' : '40'}px;
  left: 0;
  background-color: ${paleGrey};
  border: 1px solid ${mediumGrey};
  font-size: 1.15rem;
  width: ${p => p.size ? '495' : '400'}px;
  white-space: no-wrap;
  text-overflow: ellipsis;
`;

const Suggestion = styled.div`
  padding: 7px 10px 7px;

  &:hover {
    background-color: ${mediumLightGrey};
    cursor: pointer;
  }
`;

const SearchSuggestions = ({ suggestions, handleChange, size, hover, leave }) =>
  <Container
    size={size}
    onMouseEnter={hover}
    onMouseLeave={leave}
  >
    {
      _.map(suggestions, (s, i) => <Suggestion key={i} onClick={() => handleChange(s)}>{s}</Suggestion>)
    }
  </Container>;

SearchSuggestions.propTypes = {
  suggestions: PropTypes.array,
  handleChange: PropTypes.func,
  hover: PropTypes.func,
  leave: PropTypes.func,
  size: PropTypes.number,
};

export default SearchSuggestions;
