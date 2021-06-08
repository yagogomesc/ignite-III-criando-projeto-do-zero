import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

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
          {postsPagination.results.map(post => (
            <div className={styles.post} key={post.uid}>
              <Link href={`/posts/${post.uid}`}>
                <a>{post.data.title}</a>
              </Link>
              <p>{post.data.subtitle}</p>
              <div>
                <p>
                  <img src="/images/calendar.svg" alt="calendar" />{' '}
                  {post.first_publication_date}
                </p>
                <p>
                  <img src="/images/user.svg" alt="user" /> {post.data.author}
                </p>
              </div>
            </div>
          ))}
          {postsPagination.next_page !== null && (
            <button type="button" className={styles.loadMoreButton}>
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
    { fetch: ['posts.title', 'posts.subtitle', 'posts.author'], pageSize: 1 }
  );

  const postsPagination = {
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
  };

  return {
    props: { postsPagination },
    revalidate: 60 * 60 * 24,
  };
};
