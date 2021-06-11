import { useEffect } from 'react';

export default function Comments() {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-utterances');

    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'async');
    script.setAttribute(
      'repo',
      'yagogomesc/ignite-III-criando-projeto-do-zero'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }, []);

  return <div id="inject-comments-for-utterances" />;
}
