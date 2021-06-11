import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';
import Head from 'next/head';
import React from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Comments from '../../components/Comments';
import PreviewButton from '../../components/PreviewButton';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const readingTime = post.data.content.reduce((acc, item) => {
    const bodyTextLenght = RichText.asText(item.body).split(/\w+/).length;

    const time = Math.ceil(bodyTextLenght / 200);

    return acc + time;
  }, 0);

  return (
    <>
      <Head>
        <title>spaceTraveling - {post.data.title}</title>
      </Head>
      <Header />

      <img src={post.data.banner.url} alt="Banner" className={styles.banner} />

      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <span>
            <p>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM y', {
                locale: ptBR,
              })}
            </p>
            <p>
              <FiUser />
              {post.data.author}
            </p>
            <p>
              <FiClock />
              {`${readingTime} min`}
            </p>
          </span>

          {post.data.content.map(content => (
            <div key={content.heading} className={styles.postContent}>
              <h3>{content.heading}</h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </article>

        <Comments />

        {preview && <PreviewButton />}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid'],
      pageSize: 20,
    }
  );

  const slugs = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths: slugs,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    fetch: '*',
    ref: previewData?.ref ?? null,
  });

  const post = {
    uid: response?.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post, preview },
    revalidate: 60 * 60,
  };
};
