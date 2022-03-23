import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { GetStaticProps } from "next";
import { ptBR } from "date-fns/locale";
import { format, parseISO } from "date-fns";

import styles from "./home.module.scss";
import { api } from "../services/api";
import { convertDurationTotimeString } from "../utils/convertDurationTotimeString";
import { usePlayer } from "../contexts/PlayerContext";

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  url: string;
};

type HomeProps = {
  allEpisodes: Episode[];
  latestEpisodes: Episode[];
};

export default function Home({ allEpisodes, latestEpisodes }: HomeProps) {
  const { playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homePage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((ep, index) => {
            return (
              <li key={ep.id}>
                <div className={styles.thumbWrapper}>
                  <Image
                    src={ep.thumbnail}
                    alt={ep.title}
                    width={150}
                    height={150}
                    objectFit="cover"
                    className={styles.image}
                  />
                </div>

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${ep.id}`}>
                    <a>{ep.title}</a>
                  </Link>
                  <p>{ep.members}</p>
                  <div>
                    <span>{ep.publishedAt}</span>
                    <span> {ep.durationAsString}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playList(episodeList, index)}
                >
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <div className={styles.mobileAllEpisodes}>
          {allEpisodes.map((ep, index) => {
            return (
              <div key={ep.id} className={styles.mobileEpisodeRow}>
                <div style={{ width: 72 }}>
                  <Image
                    width={120}
                    height={120}
                    objectFit="cover"
                    src={ep.thumbnail}
                    alt={ep.title}
                  />
                </div>
                <div className={styles.mobileTextWrapper}>
                  <Link href={`/episodes/${ep.id}`}>
                    <a>{ep.title}</a>
                  </Link>
                  <p>{ep.members}</p>
                  <p style={{ width: 100 }}>{ep.publishedAt}</p>
                  <p>{ep.durationAsString}</p>
                </div>
                <span>
                  <button
                    type="button"
                    onClick={() =>
                      playList(episodeList, index + latestEpisodes.length)
                    }
                  >
                    <img src="/play-green.svg" alt="tocar episódio" />
                  </button>
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.desktopAllEpisodes}>
          <table cellSpacing={0}>
            <thead>
              <tr>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map((ep, index) => {
                return (
                  <tr key={ep.id}>
                    <td style={{ width: 72 }}>
                      <Image
                        width={120}
                        height={120}
                        src={ep.thumbnail}
                        alt={ep.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${ep.id}`}>
                        <a>{ep.title}</a>
                      </Link>
                    </td>
                    <td>{ep.members}</td>
                    <td style={{ width: 100 }}>{ep.publishedAt}</td>
                    <td>{ep.durationAsString}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          playList(episodeList, index + latestEpisodes.length)
                        }
                      >
                        <img src="/play-green.svg" alt="tocar episódio" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get("/episodes", {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const episodes = data.map((ep) => {
    return {
      id: ep.id,
      title: ep.title,
      thumbnail: ep.thumbnail,
      members: ep.members,
      publishedAt: format(parseISO(ep.published_at), "d MMM yy", {
        locale: ptBR,
      }),
      duration: Number(ep.file.duration),
      durationAsString: convertDurationTotimeString(Number(ep.file.duration)),
      description: ep.description,
      url: ep.file.url,
    };
  });

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  };
};
