// import _ from 'lodash';

export default (state, path, value) => {
  // console.log(state.form);
  // console.log(path);
  // console.log(state[`${path}`]);
  // console.log(value);

  const input = document.querySelector('input');

  // const renderErrors = () => {};

  switch (path) {
    case 'form.valid':
      if (!value) {
        input.classList.add('is-invalid');
      } else input.classList.remove('is-invalid');
      break;
    case 'form.validationErrors':
      break;
    default:
      break;
  }
};
