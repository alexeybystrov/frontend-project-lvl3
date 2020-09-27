export default (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/xml');

  const channel = dom.querySelector('channel');
  const feedTitle = channel.querySelector('title').textContent;
  const feedDescription = channel.querySelector('description').textContent;

  const posts = Array.from(channel.querySelectorAll('item')).map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postLink = post.querySelector('link').textContent;
    const postDate = post.querySelector('pubDate').textContent;
    return { postTitle, postLink, postDate };
  });

  return { feedTitle, feedDescription, posts };
};
