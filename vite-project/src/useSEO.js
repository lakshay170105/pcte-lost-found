// Dynamic SEO hook — updates title and meta description per page
const useSEO = (title, description) => {
  if (typeof document === 'undefined') return;

  // Title
  document.title = title
    ? `${title} | PCTE Lost & Found Portal`
    : 'PCTE Lost & Found Portal | Report Lost Items | Ludhiana | by L-SHAY';

  // Meta description
  let meta = document.querySelector('meta[name="description"]');
  if (meta && description) meta.setAttribute('content', description);

  // OG title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && title) ogTitle.setAttribute('content', `${title} | PCTE Lost & Found`);

  // OG description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && description) ogDesc.setAttribute('content', description);
};

export default useSEO;
