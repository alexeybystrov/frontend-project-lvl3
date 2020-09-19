// import _ from 'lodash';
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

const schema = yup.string().url();

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

const getProxyUrl = (url) => {
  const proxy = 'https://cors-anywhere.herokuapp.com';
  const feed = new URL(url);
  return `${proxy}/${feed.host}${feed.pathname}`;
};

const form = document.querySelector('.rss-form');

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

const watchedState = onChange(state, (/* path, currentValue, previousValue */) => {
  view(state);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  watchedState.form.fields.rssLink = formData.get('url');

  try {
    schema.validateSync(state.form.fields.rssLink, { abortEarly: false });
    watchedState.form.valid = true;
    watchedState.form.validationErrors = [];
    axios.get(getProxyUrl(state.form.fields.rssLink))
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    watchedState.form.valid = false;
    const errors = err.inner.map(({ path, message }) => ({ [path]: message }));
    watchedState.form.validationErrors = errors;
  }
});
