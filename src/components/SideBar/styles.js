import { makeStyles } from 'tss-react/mui';

export default makeStyles()((theme) => {
  return {
    imageLink: {
      display: 'flex',
      justifyContent: 'center',
      padding: '10% 0',
    },
    image: {
      width: '70%',
    },
    links: {
      color: theme.palette.text.primary,
      textDecoration: 'none',
    },
    genreImages: {
      filter: theme.palette.mode === 'dark' && 'invert(1)',
    },
  };
});
