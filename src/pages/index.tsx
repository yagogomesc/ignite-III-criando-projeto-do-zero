import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  async function handlePagination() {
    await fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const formattedPosts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM y',
              { locale: ptBR }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...formattedPosts]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | Spacetravelling.</title>
      </Head>
      <main className={styles.container}>
        <header>
          <img src="/images/logo.svg" alt="logo" />
        </header>
        <div className={styles.posts}>
          {posts.map(post => (
            <div className={styles.post} key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a>{post.data.title}</a>
              </Link>
              <p>{post.data.subtitle}</p>
              <div>
                <p>
                  <FiCalendar />
                  {format(new Date(post.first_publication_date), 'dd MMM y', {
                    locale: ptBR,
                  })}
                </p>
                <p>
                  <FiUser /> {post.data.author}
                </p>
              </div>
            </div>
          ))}

          {nextPage && (
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={handlePagination}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { fetch: ['posts.title', 'posts.subtitle', 'posts.author'], pageSize: 10 }
  );

  const postsPagination = [
    {
      next_page: postsResponse.next_page,
      results: postsResponse.results.map(post => ({
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd MMM y',
          { locale: ptBR }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      })),
    },
  ];

  return {
    props: { postsPagination },
    revalidate: 60 * 60 * 24,
  };
};
