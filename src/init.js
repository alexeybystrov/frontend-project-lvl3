import _ from 'lodash';
import 'bootstrap/dist/css/bootstrap.min.css';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import view from './view';
import getFeedData from './parser';

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

const validate = (urls, rssLink) => {
  const schema = yup.string().url().notOneOf(urls);
  const validationErrors = [];

  try {
    schema.validateSync(rssLink);
  } catch (err) {
    validationErrors.push(err.type);
  }

  return validationErrors;
};

const getNewPosts = (targetState, feedData, id) => {
  const newPosts = feedData.posts
    .filter((post) => Date.parse(post.postDate) > targetState.feedUpdateDate)
    .map((post) => ({ ...post, feedId: id }));
  // console.log(newPosts);
  // console.log(targetState.posts);
  return newPosts;
};

const updateFeeds = (targetState) => {
  // console.log(targetState.feedUpdateDate);
  targetState.feeds.forEach((feed) => {
    axios.get(getProxyUrl(feed.url))
      .then((response) => {
        const newFeedData = getFeedData(response.data);
        const newPosts = getNewPosts(targetState, newFeedData, feed.feedId);
        if (newPosts.length > 0) {
          targetState.posts.unshift(newPosts);
          const state = targetState; // fix linter no-param-reassign
          state.feedUpdateDate = Date.now();
        }
        setTimeout(() => updateFeeds(targetState), 5000);
      })
      .catch((err) => {
        targetState.networkErrors.push(err.response.status);
        setTimeout(() => updateFeeds(targetState), 5000);
      });
  });
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          errors: {
            notOneOf: 'feed already exist',
            url: 'this must be a valid URL',
            404: 'RSS not found',
          },
          alerts: {
            adding: 'adding RSS...',
            loaded: 'RSS has been loaded',
          },
        },
      },
    },
  });

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

  const watchedState = onChange(state, (path, value) => {
    view(path, value);
  });

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    watchedState.form.fields.rssLink = formData.get('url');
    watchedState.networkErrors = [];
    watchedState.form.state = 'filling';

    const addedUrls = watchedState.feeds.map(({ url }) => url);
    const errors = validate(addedUrls, watchedState.form.fields.rssLink);
    watchedState.form.validationErrors = errors;

    if (errors.length === 0) {
      watchedState.form.valid = true;
      watchedState.form.state = 'adding';
      axios.get(getProxyUrl(state.form.fields.rssLink))
        .then((response) => {
          watchedState.form.state = 'loaded';
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
};
