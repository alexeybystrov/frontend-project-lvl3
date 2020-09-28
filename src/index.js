import _ from 'lodash';
import 'bootstrap/dist/css/bootstrap.min.css';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import view from './view';
import getFeedData from './parser';

/* const errorMessages = {
  network: {
    error: 'Network Problems. Try again.',
  },
};
 */
const state = {
  form: {
    state: 'filling',
    fields: {
      rssLink: '',
    },
    valid: true,
    validationErrors: [],
  },
  feeds: [],
  posts: [],
  feedUpdateDate: Date.now(),
  networkErrors: [],
};

const form = document.querySelector('.rss-form');

const watchedState = onChange(state, (path, value) => {
  view(path, value);
});

const getProxyUrl = (url) => {
  const proxy = 'https://cors-anywhere.herokuapp.com';
  const feed = new URL(url);
  return `${proxy}/${feed.host}${feed.pathname}`;
};

const addFeed = (targetState, feedData) => {
  const feedId = _.uniqueId();
  const {
    feedTitle, feedDescription, feedUpdateDate, posts,
  } = feedData;
  const url = targetState.form.fields.rssLink;

  const newFeed = {
    feedTitle, feedDescription, feedUpdateDate, feedId, url,
  };
  targetState.feeds.unshift(newFeed);
  const newPosts = posts.map((post) => ({ ...post, feedId }));
  targetState.posts.unshift(newPosts);
};

const validate = (targetState) => {
  const schema = yup.string().url();
  const validationErrors = [];

  if (!schema.isValidSync(targetState.form.fields.rssLink)) {
    validationErrors.push('notValidUrl');
  }
  if (targetState.feeds.find((feed) => (feed.url === targetState.form.fields.rssLink))) {
    validationErrors.push('feedAlreadyExist');
  }
  return validationErrors;
};

const getNewPosts = (targetState, feedData, id) => {
  const newPosts = feedData.posts
    .filter((post) => Date.parse(post.postDate) > targetState.feedUpdateDate)
    .map((post) => ({ ...post, feedId: id }));
  return newPosts;
};

const updateFeeds = (targetState) => {
  targetState.feeds.forEach((feed) => {
    axios.get(getProxyUrl(feed.url))
      .then((response) => {
        const newFeedData = getFeedData(response.data);
        const newPosts = getNewPosts(state, newFeedData, feed.feedId);
        if (newPosts.length > 0) {
          targetState.posts.unshift(newPosts);
          watchedState.feedUpdateDate = Date.now();
        }
      });
  });
  setTimeout(() => updateFeeds(targetState), 5000);
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  watchedState.form.fields.rssLink = formData.get('url');
  watchedState.networkErrors = [];
  watchedState.form.state = 'filling';
  const errors = validate(state);
  watchedState.form.validationErrors = errors;

  if (errors.length === 0) {
    watchedState.form.valid = true;
    watchedState.form.state = 'addingRss';
    axios.get(getProxyUrl(state.form.fields.rssLink))
      .then((response) => {
        watchedState.form.state = 'rssHasBeenLoaded';
        addFeed(watchedState, getFeedData(response.data));
        updateFeeds(watchedState);
      })
      .catch((err) => {
        watchedState.networkErrors.push(err.response.status);
      });
  } else {
    watchedState.form.valid = false;
  }
});
