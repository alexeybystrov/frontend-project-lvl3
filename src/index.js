import _ from 'lodash';
// import 'bootstrap';
// import 'bootstrap/js/dist/util';
// import 'bootstrap/js/dist/alert';
import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/css/bootstrap-reboot.min.css';
// import 'bootstrap/dist/css/bootstrap-grid.min.css';
// import 'bootstrap/dist/css/bootstrap.css';
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
    processState: 'filling',
    fields: {
      rssLink: '',
    },
    valid: true,
    validationErrors: [],
  },
  feeds: [],
  posts: [],
};

/* const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'form.processState':
      processStateHandler(value);
      break;
    case 'form.valid':
      submitButton.disabled = !value;
      break;
    case 'form.errors':
      viewErrors(fieldElements, value);
      break;
    default:
      break;
  }
});
 */

const form = document.querySelector('.rss-form');

const watchedState = onChange(state, (path, value) => {
  view(watchedState, path, value);
});

const getProxyUrl = (url) => {
  const proxy = 'https://cors-anywhere.herokuapp.com';
  const feed = new URL(url);
  return `${proxy}/${feed.host}${feed.pathname}`;
};

const addFeed = (targetState, feedData) => {
  const feedId = _.uniqueId();
  const { feedTitle, feedDescription, posts } = feedData;
  const url = targetState.form.fields.rssLink;

  const newFeed = {
    feedTitle, feedDescription, feedId, url,
  };
  targetState.feeds.unshift(newFeed);
  const newPosts = posts.map((post) => ({ ...post, feedId }));
  targetState.posts.unshift(newPosts);
};

const validate = (targetState) => {
  const schema = yup.string().url();
  const validationErrors = [];
  try {
    schema.validateSync(targetState.form.fields.rssLink);
  } catch (err) {
    validationErrors.push(err.errors);
  }
  if (targetState.feeds.find((feed) => (feed.url === targetState.form.fields.rssLink))) {
    validationErrors.push('feed already exist');
  }
  return validationErrors;
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  watchedState.form.fields.rssLink = formData.get('url');
  const errors = validate(state);
  watchedState.form.validationErrors = errors;

  if (errors.length === 0) {
    watchedState.form.valid = true;
    axios.get(getProxyUrl(state.form.fields.rssLink))
      .then((response) => {
        addFeed(watchedState, getFeedData(response.data));
        console.log(state);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    watchedState.form.valid = false;
    console.log(state);
  }
});
