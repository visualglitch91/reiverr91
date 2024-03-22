import { useQuery } from "@tanstack/react-query";
import { TmdbApiOpen, getPosterProps } from "$lib/apis/tmdb/tmdbApi";
import { genres, networks } from "$lib/discover";
import { formatDateToYearMonthDay } from "$lib/utils";
import settingsStore from "$lib/settings";
import { TitleType } from "$lib/types";
import Carousel, { CarouselPlaceholderItems } from "$components/Carousel";
import GenreCard from "$components/GenreCard";
import NetworkCard from "$components/NetworkCard";
import PersonCard from "$components/PersonCard";
import Poster from "$components/Poster";
import TitleShowcase from "$components/TitleShowcase";
import QueryRenderer from "$components/QueryRenderer";

const PADDING = "px-4 lg:px-8 2xl:px-16";

function parseIncludedLanguages(includedLanguages: string) {
  return includedLanguages.replace(" ", "").split(",").join("|");
}

function parseCardProps(
  items: {
    name?: string;
    title?: string;
    id?: number;
    vote_average?: number;
    number_of_seasons?: number;
    first_air_date?: string;
    poster_path?: string;
  }[],
  type?: TitleType
): React.ComponentProps<typeof Poster>[] {
  return items
    .map((item) => getPosterProps(item, type))
    .filter((p) => p.backdropUrl);
}

const Title = ({ children }: { children: string }) => (
  <div className="text-lg font-semibold text-zinc-300">{children}</div>
);

export default function Discovery() {
  const $trendingActor = useQuery({
    queryKey: ["trending__person", { path: { time_window: "week" } }] as const,
    queryFn: ({ queryKey: [, params] }) => {
      return TmdbApiOpen.GET("/3/trending/person/{time_window}", { params });
    },
  });

  const $upcomingMovies = useQuery({
    queryKey: [
      "discover__movie",
      {
        query: {
          "primary_release_date.gte": formatDateToYearMonthDay(new Date()),
          sort_by: "popularity.desc",
          language: settingsStore.language,
          region: settingsStore.discover.region,
          with_original_language: parseIncludedLanguages(
            settingsStore.discover.includedLanguages
          ),
        },
      },
    ] as const,
    queryFn: ({ queryKey: [, params] }) => {
      return TmdbApiOpen.GET("/3/discover/movie", { params });
    },
  });

  const $upcomingSeries = useQuery({
    queryKey: [
      "discover__tv",
      {
        query: {
          "first_air_date.gte": formatDateToYearMonthDay(new Date()),
          sort_by: "popularity.desc",
          language: settingsStore.language,
          with_original_language: parseIncludedLanguages(
            settingsStore.discover.includedLanguages
          ),
        },
      },
    ] as const,
    queryFn: ({ queryKey: [, params] }) => {
      return TmdbApiOpen.GET("/3/discover/tv", { params });
    },
  });

  const $digitalReleases = useQuery({
    queryKey: [
      "discover__movie",
      {
        query: {
          with_release_type: 4,
          sort_by: "popularity.desc",
          "release_date.lte": formatDateToYearMonthDay(new Date()),
          language: settingsStore.language,
          with_original_language: parseIncludedLanguages(
            settingsStore.discover.includedLanguages
          ),
        },
      },
    ] as const,
    queryFn: ({ queryKey: [, params] }) => {
      return TmdbApiOpen.GET("/3/discover/movie", { params });
    },
  });

  const $nowStreaming = useQuery({
    queryKey: [
      "discover__tv",
      {
        query: {
          "air_date.gte": formatDateToYearMonthDay(new Date()),
          "first_air_date.lte": formatDateToYearMonthDay(new Date()),
          sort_by: "popularity.desc",
          language: settingsStore.language,
          with_original_language: parseIncludedLanguages(
            settingsStore.discover.includedLanguages
          ),
        },
      },
    ] as const,
    queryFn: ({ queryKey: [, params] }) => {
      return TmdbApiOpen.GET("/3/discover/tv", { params });
    },
  });

  return (
    <div className="pt-24">
      <TitleShowcase />

      <div className="flex flex-col gap-12 py-6 bg-stone-950">
        <Carousel
          scrollClassName={PADDING}
          slots={{ title: <Title>Popular People</Title> }}
        >
          <QueryRenderer
            query={$trendingActor}
            loading={<CarouselPlaceholderItems />}
            success={(res) =>
              res.data?.results
                ?.filter((a) => a.profile_path)
                .map((actor) => ({
                  tmdbId: actor.id || 0,
                  backdropUri: actor.profile_path || "",
                  name: actor.name || "",
                  subtitle: actor.known_for_department || "",
                }))
                .map((props) => <PersonCard key={props.tmdbId} {...props} />)
            }
          />
        </Carousel>

        <Carousel
          scrollClassName={PADDING}
          slots={{ title: <Title>Upcoming Movies</Title> }}
        >
          <QueryRenderer
            query={$upcomingMovies}
            loading={<CarouselPlaceholderItems />}
            success={(res) => {
              return parseCardProps(res?.data?.results || []).map((props) => (
                <Poster key={props.tmdbId} {...props} />
              ));
            }}
          />
        </Carousel>

        <Carousel
          scrollClassName={PADDING}
          slots={{ title: <Title>Upcoming Series</Title> }}
        >
          <QueryRenderer
            query={$upcomingSeries}
            loading={<CarouselPlaceholderItems />}
            success={(res) => {
              return parseCardProps(res?.data?.results || []).map((props) => (
                <Poster key={props.tmdbId} {...props} />
              ));
            }}
          />
        </Carousel>

        <Carousel
          scrollClassName={PADDING}
          slots={{ title: <Title>Genres</Title> }}
        >
          {Object.values(genres).map((genre) => (
            <GenreCard genre={genre} key={genre.key} />
          ))}
        </Carousel>

        <Carousel
          scrollClassName={PADDING}
          slots={{ title: <Title>New Digital Releases</Title> }}
        >
          <QueryRenderer
            query={$digitalReleases}
            loading={<CarouselPlaceholderItems />}
            success={(res) => {
              return parseCardProps(res?.data?.results || []).map((props) => (
                <Poster key={props.tmdbId} {...props} />
              ));
            }}
          />
        </Carousel>

        <Carousel
          scrollClassName={PADDING}
          slots={{ title: <Title>Streaming Now</Title> }}
        >
          <QueryRenderer
            query={$nowStreaming}
            loading={<CarouselPlaceholderItems />}
            success={(res) => {
              return parseCardProps(res?.data?.results || []).map((props) => (
                <Poster key={props.tmdbId} {...props} />
              ));
            }}
          />
        </Carousel>

        <Carousel
          scrollClassName={PADDING}
          slots={{ title: <Title>Networks</Title> }}
        >
          {Object.values(networks).map((network) => (
            <NetworkCard network={network} key={network.key} />
          ))}
        </Carousel>
      </div>
    </div>
  );
}
