import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Grid,
  Modal,
  Rating,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  Favorite,
  FavoriteBorderOutlined,
  Language,
  Movie as MovieIcon,
  PlusOne,
  Remove,
  Theaters,
} from '@mui/icons-material';
import axios from 'axios';

import {
  useGetListQuery,
  useGetMovieQuery,
  useGetRecommendationsQuery,
} from '../../services/TMDB';
import useStyles from './styles';
import genreIcons from '../../assets/genres';
import { selectCategory } from '../../features/currentCategory';
import MovieList from './../MovieList/MovieList';

const MovieInfo = () => {
  const { classes } = useStyles();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.user);

  const { data, isFetching, error } = useGetMovieQuery(id);

  const { data: favoriteMovies } = useGetListQuery({
    listName: 'favorite/movies',
    accountId: user.id,
    sessionId: localStorage.getItem('session_id'),
    page: 1,
  });

  const { data: watchlistMovies } = useGetListQuery({
    listName: 'watchlist/movies',
    accountId: user.id,
    sessionId: localStorage.getItem('session_id'),
    page: 1,
  });

  const { data: recommendations } = useGetRecommendationsQuery({
    list: 'recommendations',
    movie_id: id,
  });

  const [isMovieFavorited, setIsMovieFavorited] = useState(false);
  const [isMovieWatchListed, setIsMovieWatchListed] = useState(false);

  useEffect(() => {
    setIsMovieFavorited(
      !!favoriteMovies?.results?.find((movie) => movie?.id === data?.id)
    );
  }, [favoriteMovies, data]);

  useEffect(() => {
    setIsMovieWatchListed(
      !!watchlistMovies?.results?.find((movie) => movie?.id === data?.id)
    );
  }, [watchlistMovies, data]);

  const addToFavorites = async () => {
    await axios.post(
      `https://api.themoviedb.org/3/account/${user.id}/favorite?api_key=${
        process.env.REACT_APP_TMDB_KEY
      }&session_id=${localStorage.getItem('session_id')}`,
      {
        media_type: 'movie',
        media_id: id,
        favorite: !isMovieFavorited,
      }
    );

    setIsMovieFavorited((prev) => !prev);
  };

  const addToWatchList = async () => {
    await axios.post(
      `https://api.themoviedb.org/3/account/${user.id}/watchlist?api_key=${
        process.env.REACT_APP_TMDB_KEY
      }&session_id=${localStorage.getItem('session_id')}`,
      {
        media_type: 'movie',
        media_id: id,
        watchlist: !isMovieWatchListed,
      }
    );

    setIsMovieWatchListed((prev) => !prev);
  };

  if (isFetching) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center'>
        <CircularProgress size='8rem' />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center'>
        <Link to='/'>Something went wrong - Go Back</Link>
      </Box>
    );
  }

  return (
    <Grid container className={classes.containerSpaceAround}>
      <Grid
        item
        sm={12}
        lg={4}
        style={{ display: 'flex', marginBottom: '30px' }}>
        <img
          className={classes.poster}
          src={`https://image.tmdb.org/t/p/w500/${data?.poster_path}`}
          alt={data?.title}
        />
      </Grid>
      <Grid item container direction='column' lg={7}>
        <Typography variant='h3' align='center' gutterBottom>
          {data?.title} {data.release_date.split('-')[0]}
        </Typography>
        <Typography variant='h5' align='center' gutterBottom>
          {data?.tagline}
        </Typography>
        <Grid item className={classes.containerSpaceAround}>
          <Box display='flex' alignContent='center'>
            <Rating readOnly value={data.vote_average / 2} />
            <Typography
              variant='subtitle1'
              gutterBottom
              style={{ marginLeft: '10px' }}>
              {Math.round(data?.vote_average * 10) / 10} / 10
            </Typography>
          </Box>
          <Typography variant='h6' align='center' gutterBottom>
            {data?.runtime} Minutes/{' '}
            {data?.spoken_languages.length > 0
              ? data?.spoken_languages[0].name
              : ''}
          </Typography>
        </Grid>
        <Grid item className={classes.genresContainer}>
          {data?.genres?.map((genre) => (
            <Link
              key={genre.name}
              className={classes.links}
              to='/'
              onClick={() => dispatch(selectCategory(genre.id))}>
              <img
                src={genreIcons[genre.name.toLowerCase()]}
                alt='Genres'
                className={classes.genreImage}
                height={30}
              />
              <Typography color='textPrimary' variant='subtitle1'>
                {genre?.name}
              </Typography>
            </Link>
          ))}
        </Grid>
        <Typography variant='h5' gutterBottom style={{ marginTop: '15px' }}>
          Overview
        </Typography>
        <Typography style={{ marginBottom: '2rem' }}>
          {data?.overview}
        </Typography>
        <Typography variant='h5' gutterBottom>
          Top Cast
        </Typography>
        <Grid item container spacing={2}>
          {data &&
            data.credits?.cast
              ?.map(
                (character, i) =>
                  character.profile_path && (
                    <Grid
                      key={i}
                      item
                      xs={4}
                      md={2}
                      component={Link}
                      to={`/actors/${character.id}`}
                      style={{ textDecoration: 'none' }}>
                      <img
                        className={classes.castImage}
                        src={`https://image.tmdb.org/t/p/w500/${character.profile_path}`}
                        alt={character.name}
                      />
                      <Typography color='textPrimary'>
                        {character?.name}
                      </Typography>
                      <Typography color='textSecondary'>
                        {character?.character.split('/')[0]}
                      </Typography>
                    </Grid>
                  )
              )
              .slice(0, 6)}
        </Grid>
        <Grid item container style={{ marginTop: '2rem' }}>
          <div className={classes.buttonContainer}>
            <Grid item xs={12} sm={6} className={classes.buttonContainer}>
              <ButtonGroup size='medium' variant='outlined'>
                <Button
                  target='_blank'
                  rel='noopener noreferrer'
                  href={data?.homepage}
                  endIcon={<Language />}>
                  Website
                </Button>
                <Button
                  target='_blank'
                  rel='noopener noreferrer'
                  href={`https://www.imdb.com/title/${data?.imdb_id}`}
                  endIcon={<MovieIcon />}>
                  IMDB
                </Button>
                <Button
                  onClick={() => setOpen(true)}
                  href='#'
                  endIcon={<Theaters />}>
                  Trailer
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={12} sm={6} className={classes.buttonContainer}>
              <ButtonGroup size='medium' variant='outlined'>
                <Button
                  onClick={addToFavorites}
                  endIcon={
                    isMovieFavorited ? <FavoriteBorderOutlined /> : <Favorite />
                  }>
                  {isMovieFavorited ? 'Unfavorite' : 'Favorite'}
                </Button>
                <Button
                  onClick={addToWatchList}
                  endIcon={isMovieWatchListed ? <Remove /> : <PlusOne />}>
                  Watchlist
                </Button>
                <Button
                  endIcon={<ArrowBack />}
                  sx={{ borderColor: 'primary.main' }}>
                  <Typography
                    style={{ textDecoration: 'none' }}
                    component={Link}
                    to='/'
                    color='inherit'
                    variant='subtitle2'>
                    Back
                  </Typography>
                </Button>
              </ButtonGroup>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <Box marginTop='5rem' width='100%'>
        <Typography variant='h3' gutterBottom align='center'>
          You might also like
        </Typography>
        {recommendations?.results?.length > 0 ? (
          <MovieList movies={recommendations} numberOfMovies={12} />
        ) : (
          <Typography variant='h6'>Sorry, Nothing was found.</Typography>
        )}
      </Box>
      <Modal
        closeAfterTransition
        className={classes.modal}
        open={open}
        onClose={() => setOpen(false)}>
        {data?.videos?.results?.length > 0 ? (
          <iframe
            autoPlay
            className={classes.video}
            title='Trailer'
            src={`https://www.youtube.com/embed/${data?.videos?.results[0]?.key}`}
            allow='autoplay'
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              bgcolor: 'white',
              border: '2px solid #000',
              borderRadius: '20px',
              boxShadow: 24,
              p: 4,
            }}>
            <Typography variant='h6'>Sorry!!</Typography>
            <Typography sx={{ mt: 2 }}>
              No Trailer found for this Movie.
            </Typography>
          </Box>
        )}
      </Modal>
    </Grid>
  );
};

export default MovieInfo;
