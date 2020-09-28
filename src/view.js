// import _ from 'lodash';
import i18next from 'i18next';

export default (path, value) => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          errors: {
            feedAlreadyExist: 'feed already exist',
            notValidUrl: 'this must be a valid URL',
            404: 'RSS not found',
          },
          alerts: {
            addingRss: 'adding RSS...',
            rssHasBeenLoaded: 'RSS has been loaded',
          },
        },
      },
    },
  });

  const renderValidation = (valid) => {
    const input = document.querySelector('input');
    if (!valid) {
      input.classList.add('is-invalid');
    } else input.classList.remove('is-invalid');
  };

  const renderErrors = (errors) => {
    const target = document.querySelector('.feedback');
    target.classList.remove('text', 'text-danger', 'text-success');
    target.textContent = '';

    const button = document.querySelector('button');
    button.classList.remove('disabled');

    if (errors.length !== 0) {
      target.classList.add('text-danger');
      target.textContent = errors.map((error) => i18next.t(`errors.${error}`)).join(' ');
    }
  };

  const renderAlert = (alert) => {
    const target = document.querySelector('.feedback');
    target.classList.remove('text', 'text-danger', 'text-success');
    target.textContent = '';

    const button = document.querySelector('button');

    if (alert === 'addingRss') {
      button.classList.add('disabled');
      target.classList.add('text');
      target.textContent = i18next.t(`alerts.${alert}`);
    }
    if (alert === 'rssHasBeenLoaded') {
      button.classList.remove('disabled');
      target.classList.add('text-success');
      target.textContent = i18next.t(`alerts.${alert}`);
    }
  };

  const renderFeeds = (feed) => {
    const [{ feedTitle, feedDescription, feedId }] = feed;
    const div = document.createElement('div');
    div.setAttribute('data-feed-id', feedId);
    const h3 = document.createElement('h3');
    h3.classList.add('mb-1');
    h3.textContent = feedTitle;
    const p = document.createElement('p');
    p.classList.add('mb-1');
    p.textContent = feedDescription;
    div.append(h3, p);

    const feedsContainer = document.querySelector('.feeds');
    feedsContainer.prepend(div);
    const form = document.querySelector('.rss-form');
    form.reset();
  };

  const renderPosts = ([posts]) => {
    posts
      .reverse()
      .forEach(({ postTitle, postLink, feedId }) => {
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.setAttribute('href', postLink);
        a.textContent = postTitle;
        div.append(a);

        const targetFeed = document.querySelector(`[data-feed-id="${feedId}"]`);
        const targetP = targetFeed.querySelector('p');
        targetP.after(div);
      });
  };

  switch (path) {
    case 'form.valid':
      renderValidation(value);
      break;
    case 'form.validationErrors':
      renderErrors(value);
      break;
    case 'networkErrors':
      renderErrors(value);
      break;
    case 'feeds':
      renderFeeds(value);
      break;
    case 'posts':
      renderPosts(value);
      break;
    case 'form.state':
      renderAlert(value);
      break;
    case 'form.fields.rssLink':
      break;
    case 'feedUpdateDate':
      break;
    default:
      throw new Error(`Unknown statement ${path}`);
  }
};
