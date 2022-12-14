import axios from 'axios';
axios.defaults.baseURL = 'https://api.themoviedb.org/3';
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';
import FetchFromTrendingMovies from './api';
import { renderGalleryTrendingMovie, clearGalleryTrendingMovi } from './render';
import responseForQuery from './responseForQuery';
import { filmLoader } from './library-service';
import { genreLoader } from './genres-service';

const KEY = 'c69608b9bc251fbb333be1b2d7a49ce6';
const trendingMovies = new FetchFromTrendingMovies();
const formValueFef = document.querySelector('.search-button-js');
const searchFormInput = document.querySelector('.search-form__input');
const filmListContainerEl = document.querySelector('.js-container-pagination');
const filmItemEl = document.querySelector('li .gallery__item');
const container = document.getElementById('tui-pagination-container');

let inputQuery = '';
let clickOnSearchButton = false;
formValueFef.addEventListener('click', getImputContent);

async function getImputContent() {
  clickOnSearchButton = true;
  inputQuery = searchFormInput.value;
  console.log('INPUT = ', inputQuery);
  if (clickOnSearchButton == true && inputQuery != '') {
    await responseForQuery(KEY, searchFormInput.value, 1).then(data => {
      console.log(data.total_pages);
      options.totalItems = data.total_results;
      options.visiblePages = 5;
      options.page = data.total_pages;
      pagination(options.page, options);
    });
  }
}
// настройки блока пагинации
const options = {
  totalItems: 20000,
  itemsPerPage: 20,
  visiblePages: 3,
  page: 1,
  centerAlign: false,
  firstItemClassName: 'tui-first-child-x',
  lastItemClassName: 'tui-last-child-x',
  template: {
    page: '<a href="#" class="tui-page-btn-x">{{page}}</a>',
    currentPage: '<strong class="tui-page-btn-x tui-is-selected-x">{{page}}</strong>',
    moveButton:
      '<a href="#" class="tui-page-btn-x tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</a>',
    disabledMoveButton:
      '<span class="tui-page-btn-x tui-is-disabled-x tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</span>',
    moreButton:
      '<a href="#" class="tui-page-btn-x tui-{{type}}-is-ellip">' +
      '<span class="tui-ico-ellip">...</span>' +
      '</a>',
  },
};
if (clickOnSearchButton == false && inputQuery == '') {
  options.totalItems = 20000;
  const countOfPages = options.totalItems / options.itemsPerPage;
  if (countOfPages <= 5) {
    options.visiblePages = countOfPages;
  } else {
    options.visiblePages = 5;
  }
  pagination(options.page, options);
}
async function pagination(page) {
  const pagination = new Pagination(container, { ...options });
  pagination.reset();
  pagination.getCurrentPage();
  pagination.on('afterMove', async ({ page }) => {
    trendingMovies.clickPage = page;
    if (clickOnSearchButton === false && inputQuery === '') {
      clearGalleryTrendingMovi();
      const data = await trendingMovies.fetchTrending();
      console.log('DATA', data);
      //ГЛАВНАЯ - ПАГИНАЦИЯ
      data.map(film => {
        film.genres = genreLoader.getGenres(film.genre_ids);
        if (film.genres.length > 3) {
          film.genres = [...film.genres.slice(0, 3), { id: '00000', name: 'other...' }];
        }
        renderGalleryTrendingMovie(film);
      });
    }
    if (clickOnSearchButton === true && inputQuery !== '') {
      console.log('PAGE', page);
      console.log('inputQuery', inputQuery);
      await responseForQuery(KEY, inputQuery, page)
        .then(data => {
          clearGalleryTrendingMovi();
          // ПОИСК - ПАГИНАЦИЯ
          if (data.results) {
            data.results.map(film => {
              film.genres = genreLoader.getGenres(film.genre_ids);
              if (film.genres.length > 3) {
                film.genres = [...film.genres.slice(0, 3), { id: '00000', name: 'other...' }];
              }
              renderGalleryTrendingMovie(film);
            });
          }
        })
        .catch(e => console.log(e));
    }
  });
  document.addEventListener('unload', localStorage.setItem('currentQuery', ''));
}
