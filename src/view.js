// import _ from 'lodash';
import i18next from 'i18next';

export default (state, path, value) => {
  // console.log(state.form);
  // console.log(path);
  // console.log(state[`${path}`]);
  // console.log(value);

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          errors: {
            feedAlreadyExist: 'feed already exist',
            notValidUrl: 'must be a valid URL',
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
    target.classList.remove('text-danger');
    target.textContent = '';

    if (errors.length !== 0) {
      target.classList.add('text-danger');
      target.textContent = errors.map((error) => i18next.t(`errors.${error}`)).join(' ');
    }
  };

  const renderFeeds = (feed) => {
  /*  feedsContainer.innerHTML = '';
      targetState.feeds.forEach(({ feedTitle, feedDescription, feedId }) => {
        const div = document.createElement('div');
        div.setAttribute('data-feed-id', feedId);
        const h3 = document.createElement('h3');
        h3.classList.add('mb-1');
        h3.textContent = feedTitle;
        const p = document.createElement('p');
        p.classList.add('mb-1');
        p.textContent = feedDescription;

        div.append(h3, p);
        feedsContainer.append(div);
      });
 */
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

  const renderPosts = (posts) => {
    posts[0].forEach(({ postTitle, postLink, feedId }) => {
      const div = document.createElement('div');
      const a = document.createElement('a');
      a.setAttribute('href', postLink);
      a.textContent = postTitle;
      div.append(a);

      const targetFeed = document.querySelector(`[data-feed-id="${feedId}"]`);
      targetFeed.append(div);
    });
  };

  switch (path) {
    case 'form.valid':
      renderValidation(value);
      break;
    case 'form.validationErrors':
      renderErrors(value);
      break;
    case 'feeds':
      renderFeeds(value);
      break;
    case 'posts':
      renderPosts(value);
      break;
    case 'form.fields.rssLink':
      break;
    default:
      throw new Error('Unknown statement!');
  }
};
