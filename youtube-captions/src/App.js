import {gql} from 'apollo-boost';
import {ApolloProvider, Query} from 'react-apollo';
import OneGraphApolloClient from 'onegraph-apollo-client';
import OneGraphAuth from 'onegraph-auth';

import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

const APP_ID = 'd822cdea-b8ca-4e71-9032-4eab6f38f042';

const GET_VIDEO = gql`
  query VideoWithCaptionsQuery($videoId: String!) {
    youTube {
      video(id: $videoId) {
        id
        snippet {
          title
        }
        captions {
          items {
            snippet {
              language
              status
            }
            body
          }
        }
      }
    }
  }
`;

class App extends Component {
  state = {
    isLoggedIn: false,
  };

  constructor(props) {
    super(props);
    this._oneGraphAuth = new OneGraphAuth({
      appId: APP_ID,
    });
    this._oneGraphClient = new OneGraphApolloClient({
      oneGraphAuth: this._oneGraphAuth,
    });
  }

  _authWithYoutube = async () => {
    await this._oneGraphAuth.login('youtube');
    const isLoggedIn = await this._oneGraphAuth.isLoggedIn('youtube');
    this.setState({isLoggedIn: isLoggedIn});
  };

  componentDidMount() {
    this._oneGraphAuth
      .isLoggedIn('youtube')
      .then(isLoggedIn => this.setState({isLoggedIn}));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">YouTube Captions</h1>
        </header>
        <div className="App-intro">
          {this.state.isLoggedIn ? (
            <ApolloProvider client={this._oneGraphClient}>
              <Query query={GET_VIDEO} variables={{videoId: 't6CRZ-iG39g'}}>
                {({loading, error, data}) => {
                  if (loading) return <div>Loading video...</div>;
                  if (error)
                    return (
                      <div>Uh oh, something went wrong: {error.message}</div>
                    );
                  if (!data.youTube.video) {
                    return <div>Could not find a video with that id.</div>;
                  }
                  const caption = data.youTube.video.captions.items.find(
                    caption =>
                      caption.snippet.status === 'serving' &&
                      caption.snippet.language === 'en',
                  );
                  return <pre>{caption.body}</pre>;
                }}
              </Query>
            </ApolloProvider>
          ) : (
            <button style={{fontSize: 18}} onClick={this._authWithYoutube}>
              Login with YouTube
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default App;