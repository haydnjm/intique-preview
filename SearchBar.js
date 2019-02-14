/*
*
* Search bar, used to search through items listed
* on the marketplace, Fetches search suggesstions
* based on items already listed in database
* location: client\src\components\search
*
*/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import SearchInput from './SearchInput';
import SearchSuggestions from './SearchSuggestions';

const Container = styled.div`
  position: relative;
  margin-left: 10px;
`;

class SearchBar extends Component {

  state = {
    query: '',
    suggestions: [],
    overSuggestions: false,
  };

  componentDidMount = () =>
    this.props.location.search !== '' && this.setState({
      query: decodeURI(this.props.location.search.slice(1))
    });

  componentDidUpdate = (prevProps, prevState) => {
    if(prevState.query !== this.state.query) {
      if (this.state.query !== '') {
        this.getSuggestions();
      } else this.setState({ suggestions: [] });
    }
  }

  submitSearch = (query) => {
    const q = query ? `?${query}` :
      this.state.query ? `?${encodeURI(this.state.query)}` :
        '';
    this.props.history.push(`/items/1${q}`);
  }

  handleChange = (e) => this.setState({ query: e });

  handleKeyPress = (event) => {
    if (event.key === 'Enter') this.submitSearch();
  };

  clickSuggestion = (e) => this.submitSearch(e);

  clearSuggestions = () =>
    !this.state.overSuggestions && this.setState({ suggestions: [] });

  clearSearch = () => this.setState({ query: '', suggestions: [] });

  hover = () => this.setState({ overSuggestions: true });
  leave = () => this.setState({ overSuggestions: false });

  getSuggestions = _.debounce(
    () => {
      axios.get(`/api/products/search-suggestions?query=${this.state.query}`)
        .then(({ suggestions }) => {
          if (suggestions.length === 0) this.setState({ suggestions: ['No suggestions'] });
          else this.setState({ suggestions: _.map(suggestions, d => d.productName)});
        });
    },
    500);

  render() {
    const { query, suggestions } = this.state;
    const { size } = this.props;

    return (
      <Container>
        <SearchInput
          handleChange={this.handleChange}
          query={query}
          submitSearch={this.submitSearch}
          clearSuggestions={this.clearSuggestions}
          clearSearch={this.clearSearch}
          size={size}
          handleKeyPress={this.handleKeyPress}
        />
        {
          suggestions.length > 0 && size !== 2 &&
          <SearchSuggestions
            hover={this.hover}
            leave={this.leave}
            suggestions={suggestions}
            handleChange={this.clickSuggestion}
            size={size}
          />
        }
      </Container>
    );
  }
}


SearchBar.propTypes = {
  size: PropTypes.number,
  history: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(SearchBar);
